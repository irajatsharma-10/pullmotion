import type { PRData } from "@/types/pr-data";
import type { SceneType } from "@/types/scenes";
import type { PRAnalysis, ChangeCoverage } from "./pr-analyzer";

export interface PlannedScene {
  id: string;
  type: SceneType;
  title: string;
  duration: number;
  reason: string;
  targetFilePath?: string;
  targetGroupId?: string;
  subsystem?: string;
  diffExplanation?: string;
  changeKind?: "dedicated" | "grouped" | "aggregate";
  relatedFiles?: string[];
  contractVerdict?: string;
}

export interface MoviePlan {
  archetype: PRAnalysis["archetype"];
  totalDuration: number;
  plannedScenes: PlannedScene[];
  targetSceneTypes: SceneType[];
  changeGroups: ChangeCoverage[];
  coverageScore: number;
  uncoveredGroupsCount: number;
  hasBeforeAfter: boolean;
  contractVerdict: string;
  evidenceSlots: Array<{
    file: string;
    type: "changed_file" | "context_file" | "dependency" | "commit";
    description: string;
  }>;
}

/**
 * Reviewer-First Dynamic Movie Planner
 * 
 * Reuses existing PRReviewModel AST analysis, dependency graph, reviewer priority,
 * risks, and validation to dynamically plan the movie:
 * 
 * 1. Overview & Contract Impact (What problem is solved, contract/verdict)
 * 2. System Flow Transition (Before -> After, if architecture changed)
 * 3. Dedicated Conceptual Scenes (Important standalone conceptual changes)
 * 4. Grouped Implementation Scenes (Related/coordinated changes explained with complete mapped files)
 * 5. Aggregate Changes (Low-signal noise handled cleanly without filler scenes)
 * 6. Risk, Validation Truth & Reviewer Landmines Checklist
 */
export function createMoviePlan(prData: PRData, analysis: PRAnalysis): MoviePlan {
  const plannedScenes: PlannedScene[] = [];
  const changeGroups = analysis.changeGroups.map((g) => ({
    ...g,
    coveredBySceneIds: [] as string[],
    status: "uncovered" as "covered" | "partially_covered" | "uncovered",
  }));

  const contractVerdict = deriveContractVerdict(prData, analysis);

  // --- 1. Overview & Contract Impact (Always first) ---
  plannedScenes.push({
    id: "scene-1-overview",
    type: "overview",
    title: "PR Overview & Key Changes",
    duration: 5,
    reason: `Presents problem, scope, and key changes (${contractVerdict})`,
    contractVerdict,
  });

  // --- 2. System Flow & Architecture Transition (If flow changed) ---
  const hasArchTransition = analysis.supportsBeforeAfterFlow;
  if (hasArchTransition) {
    plannedScenes.push({
      id: "scene-2-before-after",
      type: "before_after",
      title: "Architecture & Data Flow (Before vs After)",
      duration: 7,
      reason: analysis.supportsBeforeAfterReason,
    });
  }

  // Calculate test ripple summary across PR
  const testFiles = prData.files.filter(
    (f) =>
      f.path.includes("test") ||
      f.path.includes("spec") ||
      f.path.includes("__tests__") ||
      f.path.endsWith(".test.ts") ||
      f.path.endsWith(".test.js")
  );
  const testRippleProse =
    testFiles.length > 0
      ? ` Validated across ${testFiles.length} test ${testFiles.length === 1 ? "file" : "files"} in this PR.`
      : "";

  // Score and rank candidate change groups by reviewer cognitive necessity
  // Rule: Never create a scene merely because a file changed.
  // Create a scene ONLY because a reviewer needs to understand a conceptual change or invariant.
  interface CandidateGroup {
    group: ChangeCoverage;
    score: number;
    isDedicated: boolean;
  }

  const candidateGroups: CandidateGroup[] = [];

  for (const group of changeGroups) {
    if (group.category === "tests") {
      // Tests are aggregated into validation reality (Summary scene)
      group.status = "covered";
      continue;
    }

    if (isLowSignalAggregateGroup(group)) {
      // Low signal material (lockfiles, generated code, snapshots)
      group.status = "covered";
      continue;
    }

    // Calculate Reviewer Understanding Score
    let score = 0;
    const priority = group.reviewerPriority?.toUpperCase();
    if (priority === "HIGH") score += 100;
    else if (priority === "MEDIUM") score += 50;
    else score += 10;

    if (group.isSecuritySensitive) score += 80;
    if (group.category === "schema") score += 70;
    if (group.category === "api") score += 60;
    if (group.affectedSymbols && group.affectedSymbols.length > 0) score += 40;
    if (group.additions + group.deletions > 100) score += 30;
    else if (group.additions + group.deletions > 30) score += 15;

    // Minimum cognitive threshold: Don't spawn a scene for purely peripheral / cosmetic edits
    const isSubstantive =
      score >= 30 ||
      priority === "HIGH" ||
      group.isSecuritySensitive ||
      group.category === "schema" ||
      group.category === "api" ||
      (group.affectedSymbols && group.affectedSymbols.length >= 1);

    if (!isSubstantive) {
      // Aggregate into general changes without a dedicated slide
      group.status = "covered";
      continue;
    }

    const isDedicated =
      priority === "HIGH" ||
      group.isSecuritySensitive ||
      group.category === "schema" ||
      group.category === "api" ||
      (group.affectedSymbols && group.affectedSymbols.length >= 1) ||
      (group.additions + group.deletions > 80);

    candidateGroups.push({ group, score, isDedicated });
  }

  // Sort candidates by reviewer necessity (highest impact first)
  candidateGroups.sort((a, b) => b.score - a.score);

  // Select top conceptual change scenes (limit to top 4 so the reviewer briefing remains concise and potent)
  const maxCodeScenes = 4;
  const selectedCandidates = candidateGroups.slice(0, maxCodeScenes);

  for (const { group, isDedicated } of selectedCandidates) {
    const sceneId = `scene-${plannedScenes.length + 1}-code-${sanitize(group.primaryFile.path)}`;
    const duration = calculateSceneDuration(group.additions + group.deletions);

    const fileName = group.primaryFile.path.split("/").pop() || group.primaryFile.path;
    const relatedFileList = group.files.filter((f) => f !== group.primaryFile.path);

    const actionPhrase =
      group.primaryFile.status === "deleted"
        ? `Removes deprecated logic in ${fileName}`
        : group.primaryFile.status === "added"
          ? `Introduces new implementation in ${fileName}`
          : `Updates core behavior in ${fileName}`;

    const symbolDetail =
      group.affectedSymbols && group.affectedSymbols.length > 0
        ? ` to modify ${group.affectedSymbols.slice(0, 3).join(", ")}`
        : "";

    const coordinationDetail =
      relatedFileList.length > 0
        ? `, coordinating changes across ${group.files.length} related files in ${group.title}`
        : "";

    const diffExplanation = `${actionPhrase}${symbolDetail}${coordinationDetail}.${testRippleProse}`;

    plannedScenes.push({
      id: sceneId,
      type: "code_changes",
      title: group.title,
      duration,
      targetFilePath: group.primaryFile.path,
      targetGroupId: group.id,
      subsystem: group.title,
      changeKind: isDedicated ? "dedicated" : "grouped",
      relatedFiles: group.files,
      reason: isDedicated
        ? `Dedicated conceptual change in ${group.primaryFile.path}${symbolDetail}`
        : `Grouped coordinated change across ${group.files.length} files in ${group.title}`,
      diffExplanation,
    });

    group.coveredBySceneIds.push(sceneId);
    group.status = "covered";
  }

  // Mark any remaining candidate groups as aggregated/covered
  for (const { group } of candidateGroups.slice(maxCodeScenes)) {
    group.status = "covered";
  }

  // --- N. Summary, Validation Reality & Reviewer Landmines (Always last) ---
  plannedScenes.push({
    id: `scene-summary`,
    type: "summary",
    title: "Validation Reality & Reviewer Landmines",
    duration: 5,
    reason: "Surfaces test verification signals, concrete risks from PRReviewModel, and reviewer landmine checklist",
  });

  // Deduplication & Redundancy Check
  const deduplicatedScenes = deduplicateScenes(plannedScenes, changeGroups);

  // Coverage Score Calculation
  const totalSubstantiveGroups = changeGroups.filter(
    (g) => g.category !== "tests" && !isLowSignalAggregateGroup(g)
  ).length;
  const coveredSubstantiveGroups = changeGroups.filter(
    (g) => g.status === "covered" && g.category !== "tests" && !isLowSignalAggregateGroup(g)
  ).length;
  const coverageScore =
    totalSubstantiveGroups === 0 ? 1 : coveredSubstantiveGroups / totalSubstantiveGroups;
  const uncoveredGroupsCount = totalSubstantiveGroups - coveredSubstantiveGroups;

  const totalDuration = deduplicatedScenes.reduce((sum, s) => sum + s.duration, 0);
  const targetSceneTypes = deduplicatedScenes.map((s) => s.type);

  // Evidence slots from verified files
  const evidenceFiles = new Set<string>();
  deduplicatedScenes.forEach((s) => {
    if (s.targetFilePath) evidenceFiles.add(s.targetFilePath);
  });
  analysis.primaryFiles.forEach((f) => evidenceFiles.add(f.path));

  const evidenceSlots = Array.from(evidenceFiles).map((filePath) => {
    const fileObj = prData.files.find((f) => f.path === filePath);
    return {
      file: filePath,
      type: "changed_file" as const,
      description: fileObj
        ? `${fileObj.status.toUpperCase()} (+${fileObj.additions}/-${fileObj.deletions})`
        : "Changed file in PR",
    };
  });

  return {
    archetype: analysis.archetype,
    totalDuration,
    plannedScenes: deduplicatedScenes,
    targetSceneTypes,
    changeGroups,
    coverageScore,
    uncoveredGroupsCount,
    hasBeforeAfter: analysis.supportsBeforeAfterFlow,
    contractVerdict,
    evidenceSlots,
  };
}

function deriveContractVerdict(prData: PRData, analysis: PRAnalysis): string {
  const hasSchema = analysis.changeGroups.some((g) => g.category === "schema");
  const hasSecurity = analysis.changeGroups.some((g) => g.isSecuritySensitive);
  const titleLower = prData.pullRequest.title.toLowerCase();
  const bodyLower = (prData.pullRequest.description || "").toLowerCase();

  if (titleLower.includes("breaking") || bodyLower.includes("breaking change")) {
    return "BREAKING PUBLIC API";
  }
  if (hasSecurity || titleLower.includes("cve") || titleLower.includes("security")) {
    return "SECURITY HARDENING";
  }
  if (hasSchema || titleLower.includes("migration") || titleLower.includes("schema")) {
    return "SCHEMA & MIGRATION UPDATE";
  }
  if (analysis.archetype === "feature" || titleLower.startsWith("feat")) {
    return "FEATURE ADDITION";
  }
  if (analysis.archetype === "bug_fix" || titleLower.startsWith("fix")) {
    return "BUG FIX & STABILITY";
  }
  if (analysis.archetype === "refactor" || titleLower.includes("refactor") || titleLower.includes("cleanup")) {
    return "INTERNAL RUNTIME REFACTOR";
  }
  if (analysis.archetype === "dependency_bump" || titleLower.includes("bump") || titleLower.includes("upgrade")) {
    return "DEPENDENCY UPGRADE";
  }
  return "INTERNAL IMPLEMENTATION UPDATE";
}

/**
 * Identifies genuine low-signal aggregate groups (e.g. pure lockfiles, snapshots, generated artifacts)
 * that belong in the inventory/breakdown scenes rather than individual story scenes.
 */
function isLowSignalAggregateGroup(group: ChangeCoverage): boolean {
  const allPaths = group.files.map((f) => f.toLowerCase());
  if (allPaths.length === 0) return true;

  // 1. Pure lockfiles
  const isAllLockfiles = allPaths.every(
    (p) =>
      p.endsWith("yarn.lock") ||
      p.endsWith("package-lock.json") ||
      p.endsWith("pnpm-lock.yaml") ||
      p.endsWith("cargo.lock") ||
      p.endsWith("go.sum")
  );
  if (isAllLockfiles) return true;

  // 2. Pure test snapshots / test fixtures without implementation code
  const isAllSnapshots = allPaths.every(
    (p) =>
      p.endsWith(".snap") ||
      p.includes("__snapshots__") ||
      p.includes("__fixtures__")
  );
  if (isAllSnapshots) return true;

  // 3. Pure generated files
  const isAllGenerated = allPaths.every(
    (p) =>
      p.endsWith(".generated.ts") ||
      p.endsWith(".generated.js") ||
      p.endsWith(".d.ts") ||
      p.endsWith(".min.js") ||
      p.endsWith(".bundle.js")
  );
  if (isAllGenerated) return true;

  // 4. Release changesets (.changeset/*.md)
  const isAllChangesets = allPaths.every((p) => p.startsWith(".changeset/"));
  if (isAllChangesets) return true;

  // 5. Pure SVG/icons
  const isAllIcons = allPaths.every((p) => p.endsWith(".svg") || p.includes("/icons/"));
  if (isAllIcons) return true;

  // 6. Pure git configuration / attributes
  const isAllGit = allPaths.every((p) => p.endsWith(".gitattributes") || p.endsWith(".gitignore"));
  if (isAllGit) return true;

  return false;
}

function calculateSceneDuration(deltaLines: number): number {
  if (deltaLines > 200) return 6;
  if (deltaLines > 50) return 5;
  return 4;
}

function sanitize(str: string): string {
  return str.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 30);
}

function deduplicateScenes(
  scenes: PlannedScene[],
  changeGroups: ChangeCoverage[]
): PlannedScene[] {
  const seenTargets = new Set<string>();
  const idMap = new Map<string, string>(); // oldSceneId -> newSceneId
  const result: PlannedScene[] = [];

  for (const scene of scenes) {
    if (scene.type === "code_changes" && scene.targetFilePath) {
      if (seenTargets.has(scene.targetFilePath)) {
        // Redundant scene on the same file - omit
        continue;
      }
      seenTargets.add(scene.targetFilePath);
    }

    const newId = `scene-${result.length + 1}-${scene.type}`;
    idMap.set(scene.id, newId);

    result.push({
      ...scene,
      id: newId,
    });
  }

  // Update changeGroups with new deduplicated scene IDs and re-evaluate coverage status
  for (const group of changeGroups) {
    const survivingSceneIds = group.coveredBySceneIds
      .map((oldId) => idMap.get(oldId))
      .filter((newId): newId is string => Boolean(newId));

    group.coveredBySceneIds = survivingSceneIds;

    if (survivingSceneIds.length === 0) {
      group.status = "uncovered";
    } else if (
      group.shouldSplit &&
      group.keyFilesToSplit &&
      survivingSceneIds.length < group.keyFilesToSplit.length
    ) {
      group.status = "partially_covered";
    } else {
      group.status = "covered";
    }
  }

  return result;
}
