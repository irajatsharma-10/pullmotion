import { Octokit } from "octokit";
import type { PRFile } from "@/types/pr-data";

export type ContextCompleteness = {
  totalFiles: number;
  includedPatches: number;
  totalPatches: number;
  includedKeyFiles: number;
  requestedKeyFiles: number;
  keyFileFetchFailures: string[];
  truncationWarnings: string[];
};

export type SelectedContext = {
  keyFiles: Array<{ path: string; content: string }>;
  patches: Array<{
    path: string;
    patch: string;
    additions: number;
    deletions: number;
    status: string;
    previousPath?: string;
    patchStatus: "available" | "unavailable";
  }>;
  allFilesSummary: Array<{
    path: string;
    status: string;
    additions: number;
    deletions: number;
    patchStatus: "available" | "unavailable";
    previousPath?: string;
  }>;
  repoStructure: string;
  totalFilesCount: number;
  totalAdditions: number;
  totalDeletions: number;
  contextCompleteness: ContextCompleteness;
};

const IGNORED_EXTENSIONS = [
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp",
  ".lock", ".lockb", ".min.js", ".min.css", ".map", ".mp4",
  ".woff", ".woff2", ".ttf", ".eot", ".zip", ".tar.gz",
];

export async function selectContext(
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string,
  files: PRFile[],
  maxKeyFiles = 6,
  maxFileBytes = 25_000,
  maxDetailedPatches = 50
): Promise<SelectedContext> {
  // 1. All files summary (never truncated)
  const allFilesSummary = files.map((f) => ({
    path: f.path,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    patchStatus: f.patchStatus,
    previousPath: f.previousPath,
  }));

  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);

  // 2. Filter eligible code files for ranking (fallback to all files if PR only modifies configs/lockfiles/assets)
  const eligibleFiles = files.filter(
    (f) => !IGNORED_EXTENSIONS.some((ext) => f.path.toLowerCase().endsWith(ext))
  );
  const candidateFiles = eligibleFiles.length > 0 ? eligibleFiles : files;

  // 3. Score and rank files by narrative relevance
  const ranked = [...candidateFiles].sort((a, b) => scoreFile(b) - scoreFile(a));

  // 4. Fetch full HEAD file contents for top N files concurrently in parallel
  const topFiles = ranked.slice(0, maxKeyFiles).filter((f) => f.status !== "deleted");
  const keyFileFetchFailures: string[] = [];
  const keyFilesResults = await Promise.allSettled(
    topFiles.map(async (file) => {
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: file.path,
          ref: headSha,
        });

        if ("content" in data && data.encoding === "base64") {
          const decoded = Buffer.from(data.content, "base64").toString("utf-8");
          if (decoded.length <= maxFileBytes) {
            return { path: file.path, content: decoded };
          }
        }
        return null;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        keyFileFetchFailures.push(`${file.path}: ${msg}`);
        return null;
      }
    })
  );

  const keyFiles: Array<{ path: string; content: string }> = [];
  for (const result of keyFilesResults) {
    if (result.status === "fulfilled" && result.value) {
      keyFiles.push(result.value);
    }
  }

  // 5. Extract detailed patches for files (ensuring every change group has patch content)
  const patches = ranked.slice(0, maxDetailedPatches).map((f) => ({
    path: f.path,
    patch: f.patch || (f.patchStatus === "unavailable" ? "(Binary asset or diff exceeds GitHub limit)" : "(No diff content)"),
    additions: f.additions,
    deletions: f.deletions,
    status: f.status,
    previousPath: f.previousPath,
    patchStatus: f.patchStatus,
  }));

  // 6. Generate compact directory structure
  const repoStructure = generateCompactTree(files);

  // Compute context completeness diagnostics
  const totalPatchesAvailable = files.filter((f) => f.patchStatus === "available").length;
  const truncationWarnings: string[] = [];
  if (patches.length < totalPatchesAvailable) {
    truncationWarnings.push(
      `Included ${patches.length} of ${totalPatchesAvailable} available patches (max: ${maxDetailedPatches})`
    );
  }
  if (keyFileFetchFailures.length > 0) {
    truncationWarnings.push(
      `Failed to fetch ${keyFileFetchFailures.length} key file(s): ${keyFileFetchFailures.join("; ")}`
    );
  }

  const contextCompleteness: ContextCompleteness = {
    totalFiles: files.length,
    includedPatches: patches.length,
    totalPatches: totalPatchesAvailable,
    includedKeyFiles: keyFiles.length,
    requestedKeyFiles: topFiles.length,
    keyFileFetchFailures,
    truncationWarnings,
  };

  return {
    keyFiles,
    patches,
    allFilesSummary,
    repoStructure,
    totalFilesCount: files.length,
    totalAdditions,
    totalDeletions,
    contextCompleteness,
  };
}

function scoreFile(file: PRFile): number {
  let score = 0;
  const p = file.path.toLowerCase();

  // P0: Core API / Models / Schemas
  if (p.includes("schema") || p.includes("contract") || p.includes("model")) score += 60;
  if (p.includes("api/") || p.includes("routes/") || p.includes("service")) score += 50;

  // P1: Core Logic
  if (p.startsWith("src/") || p.startsWith("lib/") || p.startsWith("app/") || p.startsWith("packages/")) score += 30;

  // P2: Components
  if (p.includes("components/")) score += 20;

  // P3: Tests & Docs
  if (p.includes("test") || p.includes("spec")) score += 15;
  if (p.endsWith(".md") || p.endsWith(".mdx")) score += 10;

  // Weight additions + deletions (capped at 40)
  score += Math.min(file.additions + file.deletions, 40);

  return score;
}

function generateCompactTree(files: PRFile[]): string {
  const dirs = new Set<string>();
  for (const file of files) {
    const parts = file.path.split("/");
    if (parts.length > 1) {
      dirs.add(parts.slice(0, -1).join("/"));
    }
  }
  return Array.from(dirs).sort().slice(0, 30).join("\n");
}
