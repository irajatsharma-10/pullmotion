import type { PRData, PRFile } from "@/types/pr-data";
import type { CategoryKind } from "@/types/scenes";
import {
  parseSourceAST,
  parsePatchAST,
  type SemanticFileInfo,
} from "./semantic-analyzer";
import { analyzeDiff, type AnalyzedDiff } from "./diff-analyzer";
import {
  buildDependencyGraph,
  type DependencyGraph,
  type DependencyEdge,
} from "./dependency-graph";

export type PRArchetype =
  | "doc_only"
  | "dependency_bump"
  | "test_only"
  | "config"
  | "refactor"
  | "feature"
  | "bug_fix"
  | "mixed";

export interface FileCategoryBreakdown {
  category: CategoryKind;
  files: PRFile[];
  additions: number;
  deletions: number;
}

export interface EvidenceReference {
  file: string;
  type: "changed_file" | "context_file" | "dependency" | "commit";
  startLine?: number;
  endLine?: number;
}

export interface ChangeCoverage {
  id: string;
  title: string;
  category: CategoryKind;
  files: string[];
  primaryFile: PRFile;
  relatedFiles: PRFile[];
  evidence: EvidenceReference[];
  complexity: "low" | "medium" | "high";
  shouldSplit: boolean;
  coveredBySceneIds: string[];
  status: "covered" | "partially_covered" | "uncovered";
  additions: number;
  deletions: number;
  description: string;
  keyFilesToSplit?: PRFile[];

  // Semantic & Diff Extensions
  purpose?: string;
  affectedSymbols?: string[];
  dependencies?: DependencyEdge[];
  testFiles?: string[];
  isSecuritySensitive?: boolean;
  reviewerPriority?: "HIGH" | "MEDIUM" | "LOW";
  priorityReason?: string;
}

export interface PRAnalysis {
  archetype: PRArchetype;
  archetypeReason: string;
  categories: Record<CategoryKind, FileCategoryBreakdown>;
  activeCategories: FileCategoryBreakdown[];
  changeGroups: ChangeCoverage[];
  totalFiles: number;
  totalAdditions: number;
  totalDeletions: number;
  supportsBeforeAfterFlow: boolean;
  supportsBeforeAfterReason: string;
  primaryFiles: PRFile[];
  renamedFiles: PRFile[];
  unavailablePatchFiles: PRFile[];
  hasDependencyChanges: boolean;
  hasSchemaChanges: boolean;
  hasApiChanges: boolean;
  hasTestChanges: boolean;
  hasDocChanges: boolean;

  // Semantic AST & Dependency Extensions
  semanticFiles?: SemanticFileInfo[];
  dependencyGraph?: DependencyGraph;
  analyzedDiffs?: AnalyzedDiff[];
}

export function classifyFile(file: PRFile): CategoryKind {
  const p = file.path.toLowerCase();

  // Configuration & CI/CD
  if (
    p.startsWith(".github/") ||
    p.startsWith(".circleci/") ||
    p.includes(".gitlab-ci") ||
    p.endsWith(".yml") ||
    p.endsWith(".yaml") ||
    p.endsWith(".config.js") ||
    p.endsWith(".config.ts") ||
    p.endsWith(".config.mjs") ||
    p.endsWith("tsconfig.json") ||
    p.endsWith(".eslintrc") ||
    p.endsWith("eslint.config.mjs") ||
    p.endsWith(".env.example") ||
    p.endsWith("dockerfile") ||
    p.endsWith("docker-compose.yml")
  ) {
    return "config";
  }

  // Dependencies
  if (
    p.endsWith("package.json") ||
    p.endsWith("package-lock.json") ||
    p.endsWith("yarn.lock") ||
    p.endsWith("pnpm-lock.yaml") ||
    p.endsWith("cargo.toml") ||
    p.endsWith("cargo.lock") ||
    p.endsWith("requirements.txt") ||
    p.endsWith("go.mod") ||
    p.endsWith("go.sum") ||
    p.endsWith("gemfile") ||
    p.endsWith("composer.json")
  ) {
    return "dependency";
  }

  // Test files
  if (
    p.includes("test/") ||
    p.includes("tests/") ||
    p.includes("__tests__") ||
    p.includes("__test__") ||
    p.endsWith(".test.ts") ||
    p.endsWith(".test.js") ||
    p.endsWith(".test.tsx") ||
    p.endsWith(".test.jsx") ||
    p.endsWith(".spec.ts") ||
    p.endsWith(".spec.js") ||
    p.endsWith(".spec.tsx")
  ) {
    return "tests";
  }

  // Schema & Database
  if (
    p.includes("schema") ||
    p.includes("prisma") ||
    p.includes("migration") ||
    p.includes("migrations/") ||
    p.includes("model") ||
    p.endsWith(".sql")
  ) {
    return "schema";
  }

  // API & Route handlers & services
  if (
    p.includes("api/") ||
    p.includes("routes/") ||
    p.includes("router") ||
    p.includes("controllers/") ||
    p.includes("endpoints/") ||
    p.includes("trpc") ||
    p.includes("graphql") ||
    p.includes("server/")
  ) {
    return "api";
  }

  // Documentation
  if (
    p.endsWith(".md") ||
    p.endsWith(".mdx") ||
    p.endsWith(".txt") ||
    p.startsWith("docs/") ||
    p.includes("/docs/") ||
    p.includes("documentation")
  ) {
    return "feature";
  }

  // Refactor or Feature
  if (p.includes("refactor") || file.status === "renamed") {
    return "refactor";
  }

  return "feature";
}

export function isDocFile(filePath: string): boolean {
  const p = filePath.toLowerCase();
  return (
    p.endsWith(".md") ||
    p.endsWith(".mdx") ||
    p.startsWith("docs/") ||
    p.includes("/docs/") ||
    p.includes("documentation") ||
    p.includes("readme")
  );
}

/**
 * Extracts cohesive semantic Change Groups from the list of changed PR files.
 * Uses AST semantic analysis and cross-file dependency graph to identify logical engineering changes.
 */
export function extractChangeGroups(
  files: PRFile[],
  keyFiles?: Array<{ path: string; content: string }>
): {
  changeGroups: ChangeCoverage[];
  semanticFiles: SemanticFileInfo[];
  dependencyGraph: DependencyGraph;
  analyzedDiffs: AnalyzedDiff[];
} {
  if (!files || files.length === 0) {
    return {
      changeGroups: [],
      semanticFiles: [],
      dependencyGraph: {
        edges: [],
        entryPoints: [],
        leafNodes: [],
        isolatedFiles: [],
        inDegree: {},
        outDegree: {},
        clusters: [],
      },
      analyzedDiffs: [],
    };
  }

  const keyFilesMap = new Map<string, string>();
  if (keyFiles) {
    keyFiles.forEach((kf) => keyFilesMap.set(kf.path, kf.content));
  }

  // 1. Perform AST Semantic Analysis on every changed file
  const semanticFiles: SemanticFileInfo[] = files.map((file) => {
    const fullContent = keyFilesMap.get(file.path);
    if (fullContent) {
      return parseSourceAST(file.path, fullContent);
    }
    return parsePatchAST(file.path, file.patch || "");
  });

  const semanticMap = new Map<string, SemanticFileInfo>();
  semanticFiles.forEach((sf) => semanticMap.set(sf.path, sf));

  // 2. Perform Structured Diff Analysis on every patch
  const analyzedDiffs: AnalyzedDiff[] = files.map((file) => {
    const sem = semanticMap.get(file.path);
    return analyzeDiff(file.path, file.patch || "", sem);
  });
  const diffMap = new Map<string, AnalyzedDiff>();
  analyzedDiffs.forEach((ad) => diffMap.set(ad.path, ad));

  // 3. Build Cross-File Dependency Graph
  const dependencyGraph = buildDependencyGraph(semanticFiles);

  // 4. Form Logical Change Groups:
  // We use dependency graph clusters (files importing/calling/testing each other)
  // and fallback to path clustering for remaining unconnected files.
  const assignedFiles = new Set<string>();
  const rawGroups: Array<{
    title: string;
    files: PRFile[];
    category: CategoryKind;
    clusterKey: string;
  }> = [];

  // 4A. Clusters from Dependency Graph with 2+ files
  for (const cluster of dependencyGraph.clusters) {
    if (cluster.files.length >= 2) {
      const clusterPrFiles = cluster.files
        .map((path) => files.find((f) => f.path === path))
        .filter((f): f is PRFile => Boolean(f));

      if (clusterPrFiles.length > 0) {
        clusterPrFiles.forEach((f) => assignedFiles.add(f.path));
        const primary = clusterPrFiles[0];
        rawGroups.push({
          title: cluster.title,
          files: clusterPrFiles,
          category: classifyFile(primary),
          clusterKey: cluster.subsystem,
        });
      }
    }
  }

  // 4B. Remaining Unassigned Files grouped by Cohesive Subsystem / Directory
  const remainingFiles = files.filter((f) => !assignedFiles.has(f.path));
  const fallbackClusters = new Map<string, PRFile[]>();

  for (const file of remainingFiles) {
    const clusterKey = deriveClusterKey(file);
    if (!fallbackClusters.has(clusterKey)) {
      fallbackClusters.set(clusterKey, []);
    }
    fallbackClusters.get(clusterKey)!.push(file);
  }

  for (const [clusterKey, clusterFiles] of fallbackClusters.entries()) {
    const primary = clusterFiles[0];
    rawGroups.push({
      title: deriveGroupTitle(clusterKey, primary, clusterFiles),
      files: clusterFiles,
      category: classifyFile(primary),
      clusterKey,
    });
  }

  // 5. Construct final ChangeCoverage objects with rich AST & Diff metadata
  const changeGroups: ChangeCoverage[] = [];
  let groupIndex = 1;

  for (const group of rawGroups) {
    const clusterFiles = group.files;
    const implementationFiles = clusterFiles.filter(
      (f) =>
        !f.path.includes("__tests__") &&
        !f.path.includes("__fixtures__") &&
        !f.path.includes("__snapshots__") &&
        !f.path.endsWith(".test.ts") &&
        !f.path.endsWith(".test.js") &&
        !f.path.endsWith(".test.tsx") &&
        !f.path.endsWith(".spec.ts") &&
        !f.path.endsWith(".spec.js") &&
        !f.path.endsWith(".snap")
    );

    // Sort files within cluster by impact (prioritize implementation files)
    const sortedFiles = [...clusterFiles].sort((a, b) => {
      const aIsImpl = implementationFiles.includes(a) ? 1 : 0;
      const bIsImpl = implementationFiles.includes(b) ? 1 : 0;
      if (aIsImpl !== bIsImpl) return bIsImpl - aIsImpl;
      return (b.additions + b.deletions) - (a.additions + a.deletions);
    });

    const primaryFile = sortedFiles[0];
    if (!primaryFile) continue;
    const relatedFiles = sortedFiles.slice(1);
    const totalAdditions = clusterFiles.reduce((sum, f) => sum + f.additions, 0);
    const totalDeletions = clusterFiles.reduce((sum, f) => sum + f.deletions, 0);
    const category = classifyFile(primaryFile);

    // Collect affected AST symbols across all files in this group
    const affectedSymbolsSet = new Set<string>();
    const testFilesList: string[] = [];

    for (const f of clusterFiles) {
      const sem = semanticMap.get(f.path);
      if (sem) {
        sem.modifiedSymbols.forEach((s) => affectedSymbolsSet.add(s.name));
        if (sem.isTest) {
          testFilesList.push(f.path);
        }
      }
    }

    // Collect cross-file dependencies touching this group
    const groupFileSet = new Set(clusterFiles.map((f) => f.path));
    const groupDependencies = dependencyGraph.edges.filter(
      (e) => groupFileSet.has(e.from) && !groupFileSet.has(e.to)
    );

    // Check if group involves security or sensitive paths
    const isSecuritySensitive = clusterFiles.some((f) => {
      const p = f.path.toLowerCase();
      return (
        p.includes("auth") ||
        p.includes("permission") ||
        p.includes("token") ||
        p.includes("secret") ||
        p.includes("security") ||
        p.includes("jwt") ||
        p.includes("oauth")
      );
    });

    // Splitting check for large diverse groups
    const distinctCategories = new Set(implementationFiles.map((f) => classifyFile(f)));
    const majorImplFiles = implementationFiles.filter(
      (f) => (f.additions + f.deletions >= 50 || f.status === "added" || f.status === "deleted") && f.patchStatus === "available"
    );

    const hasCategoryDiversity = distinctCategories.size >= 2;
    const hasMultipleMajorModules = majorImplFiles.length >= 2 && majorImplFiles.length <= 5;
    const isConfigOrDep = category === "config" || category === "dependency";
    const shouldSplit = !isConfigOrDep && (hasCategoryDiversity || hasMultipleMajorModules);

    const keyFilesToSplit = shouldSplit
      ? (majorImplFiles.length >= 2 ? majorImplFiles : sortedFiles.slice(0, 3).filter((f) => f.patchStatus === "available"))
      : undefined;

    const complexity: "low" | "medium" | "high" =
      shouldSplit || totalAdditions + totalDeletions > 250
        ? "high"
        : totalAdditions + totalDeletions > 50
          ? "medium"
          : "low";

    const title = group.title;
    const description = `Modifies ${clusterFiles.length} ${clusterFiles.length === 1 ? "file" : "files"
      } (+${totalAdditions}/-${totalDeletions}) in ${group.clusterKey}`;

    // Compute exact evidence lines from analyzed diff hunks
    const evidence: EvidenceReference[] = sortedFiles.slice(0, 5).map((f) => {
      const diff = diffMap.get(f.path);
      const startLine = diff && diff.hunks.length > 0 ? diff.hunks[0].newStart : 1;
      const endLine = diff && diff.hunks.length > 0
        ? diff.hunks[0].newStart + diff.hunks[0].newCount
        : Math.min(50, f.additions + f.deletions + 1);

      return {
        file: f.path,
        type: "changed_file",
        startLine,
        endLine,
      };
    });

    const affectedSymbols = Array.from(affectedSymbolsSet);

    changeGroups.push({
      id: `group-${groupIndex++}-${sanitizeKey(group.clusterKey)}`,
      title,
      category,
      files: clusterFiles.map((f) => f.path),
      primaryFile,
      relatedFiles,
      evidence,
      complexity,
      shouldSplit: Boolean(shouldSplit && keyFilesToSplit && keyFilesToSplit.length >= 2),
      keyFilesToSplit,
      coveredBySceneIds: [],
      status: "uncovered",
      additions: totalAdditions,
      deletions: totalDeletions,
      description,
      purpose: affectedSymbols.length > 0
        ? `Updates ${affectedSymbols.slice(0, 4).join(", ")} in ${title}`
        : description,
      affectedSymbols,
      dependencies: groupDependencies,
      testFiles: testFilesList,
      isSecuritySensitive,
    });
  }

  // Sort groups by impact
  const sortedChangeGroups = changeGroups.sort(
    (a, b) => (b.additions + b.deletions) - (a.additions + a.deletions)
  );

  return {
    changeGroups: sortedChangeGroups,
    semanticFiles,
    dependencyGraph,
    analyzedDiffs,
  };
}

function deriveClusterKey(file: PRFile): string {
  const p = file.path;
  const parts = p.split("/");

  // Root or single-level file
  if (parts.length === 1) {
    if (classifyFile(file) === "config" || classifyFile(file) === "dependency") {
      return "Root Config & Tooling";
    }
    return "Root Module";
  }

  // Changesets
  if (parts[0] === ".changeset") {
    return ".changeset (Release Notes)";
  }

  // CI/CD Workflows
  if (parts[0] === ".github") {
    return ".github (CI/CD Workflows)";
  }

  // Scripts tooling (e.g. scripts/merge-errors-json/...)
  if (parts[0] === "scripts" && parts.length >= 2) {
    return `scripts/${parts[1]}`;
  }

  // Native crates / SWC plugins (e.g. crates/next-error-code-swc-plugin/...)
  if (parts[0] === "crates" && parts.length >= 2) {
    return `crates/${parts[1]}`;
  }

  // Unified test suites: All top-level tests coalesce into one verification group
  if (parts[0] === "test" || parts[0] === "tests") {
    return "test (Test Suites)";
  }

  // Monorepo package (e.g. packages/next/... or packages/react-dom/...)
  if (parts[0] === "packages" && parts.length >= 2) {
    const pkgName = parts[1];

    if (parts.length === 3) {
      return `packages/${pkgName} (Package Manifest & Config)`;
    }

    if (parts[2] === "bin") {
      return `packages/${pkgName}/bin`;
    }

    if (
      p.includes("__tests__") ||
      p.includes("__fixtures__") ||
      p.includes("__snapshots__") ||
      p.includes("/test/") ||
      p.includes("/tests/")
    ) {
      return `packages/${pkgName} (Test Suites)`;
    }

    // Coalesce at packages/${pkgName}/src/${submodule} (e.g. packages/next/src/next-devtools, packages/next/src/server, packages/ui/src/mosaic)
    if (parts.length >= 4 && parts[2] === "src" && parts[3] && !parts[3].includes(".")) {
      return `packages/${pkgName}/src/${parts[3]}`;
    }

    if (parts[2] === "src") {
      return `packages/${pkgName}/src`;
    }

    return `packages/${pkgName}/${parts[2]}`;
  }

  // App or lib directories
  if ((parts[0] === "src" || parts[0] === "app" || parts[0] === "lib") && parts.length >= 3) {
    return parts.slice(0, 3).join("/");
  }

  return parts.slice(0, 2).join("/");
}

function deriveGroupTitle(clusterKey: string, primaryFile: PRFile, files: PRFile[]): string {
  const parts = primaryFile.path.split("/");
  const rawBaseName = parts.pop()?.replace(/\.[^/.]+$/, "") || "Module";
  const category = classifyFile(primaryFile);

  if (clusterKey.startsWith("test/") || clusterKey.includes("(Test Suites)") || category === "tests") {
    const testCategory = clusterKey.split("/").pop()?.replace(/[^a-zA-Z0-9_-]/g, " ") || "Verification";
    return `Test Suite Verification (${formatReadableName(testCategory)} — ${files.length} ${files.length === 1 ? "file" : "files"})`;
  }
  if (primaryFile.path === "yarn.lock" || primaryFile.path === "package-lock.json" || primaryFile.path === "pnpm-lock.yaml" || primaryFile.path.endsWith("Cargo.lock")) {
    return `Lockfile & Workspace Dependencies`;
  }
  if (primaryFile.status === "deleted" && primaryFile.path.endsWith("package.json")) {
    return `Package Manifest & Config Removal`;
  }
  if (category === "dependency") {
    return `Dependency Updates (${files.length} ${files.length === 1 ? "manifest" : "manifests"})`;
  }
  if (category === "config" || clusterKey.includes("Changeset") || clusterKey.includes("Workflows")) {
    return `Configuration & Tooling (${clusterKey.split("/").pop() || "Build"})`;
  }
  if (category === "schema") {
    return `Data Schema & Models (${formatReadableName(rawBaseName)})`;
  }
  if (category === "api") {
    return `API & Route Handlers (${formatReadableName(rawBaseName)})`;
  }

  let name = rawBaseName;
  if (["index", "main", "mod", "lib"].includes(rawBaseName.toLowerCase())) {
    if (parts.length > 0 && parts[parts.length - 1] === "bin") {
      name = "CLI Entrypoint";
    } else if (parts.length > 0 && parts[parts.length - 1] === "src" && parts.length > 1) {
      name = parts[parts.length - 2];
    } else if (parts.length > 0) {
      name = parts[parts.length - 1];
    }
  }

  const contextTag = clusterKey.split("/").pop() || "Core";
  const formattedName = formatReadableName(name);

  return formattedName.toLowerCase() === contextTag.toLowerCase()
    ? formattedName
    : `${formattedName} (${contextTag})`;
}

function formatReadableName(str: string): string {
  return str
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function sanitizeKey(str: string): string {
  return str.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 30);
}

export function analyzePR(
  prData: PRData,
  keyFiles?: Array<{ path: string; content: string }>
): PRAnalysis {
  const files = prData.files || [];
  const title = (prData.pullRequest.title || "").toLowerCase();
  const labels = (prData.pullRequest.labels || []).map((l) => l.toLowerCase());

  const categories: Record<CategoryKind, FileCategoryBreakdown> = {
    feature: { category: "feature", files: [], additions: 0, deletions: 0 },
    dependency: { category: "dependency", files: [], additions: 0, deletions: 0 },
    api: { category: "api", files: [], additions: 0, deletions: 0 },
    schema: { category: "schema", files: [], additions: 0, deletions: 0 },
    tests: { category: "tests", files: [], additions: 0, deletions: 0 },
    config: { category: "config", files: [], additions: 0, deletions: 0 },
    refactor: { category: "refactor", files: [], additions: 0, deletions: 0 },
  };

  const renamedFiles: PRFile[] = [];
  const unavailablePatchFiles: PRFile[] = [];
  let docFilesCount = 0;

  for (const file of files) {
    const cat = classifyFile(file);
    categories[cat].files.push(file);
    categories[cat].additions += file.additions;
    categories[cat].deletions += file.deletions;

    if (file.status === "renamed") {
      renamedFiles.push(file);
    }
    if (file.patchStatus === "unavailable" || !file.patch) {
      unavailablePatchFiles.push(file);
    }
    if (isDocFile(file.path)) {
      docFilesCount++;
    }
  }

  const activeCategories = Object.values(categories).filter((c) => c.files.length > 0);

  const hasDependencyChanges = categories.dependency.files.length > 0;
  const hasSchemaChanges = categories.schema.files.length > 0;
  const hasApiChanges = categories.api.files.length > 0;
  const hasTestChanges = categories.tests.files.length > 0;
  const hasDocChanges = docFilesCount > 0;

  // Extract semantic Change Coverage Groups using AST + Dependency Graph
  const { changeGroups, semanticFiles, dependencyGraph, analyzedDiffs } =
    extractChangeGroups(files, keyFiles);

  // Detect PR Archetype deterministically
  let archetype: PRArchetype = "feature";
  let archetypeReason = "Code changes modifying repository functionality";

  if (files.length === docFilesCount && files.length > 0) {
    archetype = "doc_only";
    archetypeReason = "All changed files are documentation or markdown files";
  } else if (
    files.length > 0 &&
    categories.dependency.files.length === files.length
  ) {
    archetype = "dependency_bump";
    archetypeReason = "All changed files are package manifests or lockfiles";
  } else if (
    files.length > 0 &&
    categories.tests.files.length === files.length
  ) {
    archetype = "test_only";
    archetypeReason = "All changed files are test suites or test fixtures";
  } else if (
    files.length > 0 &&
    categories.config.files.length === files.length
  ) {
    archetype = "config";
    archetypeReason = "All changed files are configuration or CI/CD workflow files";
  } else if (
    title.includes("fix") ||
    title.startsWith("fix:") ||
    title.startsWith("fix(") ||
    labels.some((l) => l.includes("bug") || l.includes("fix"))
  ) {
    archetype = "bug_fix";
    archetypeReason = "PR title or labels indicate a bug fix";
  } else if (
    title.includes("refactor") ||
    title.startsWith("refactor:") ||
    title.startsWith("refactor(") ||
    categories.refactor.files.length > 0
  ) {
    archetype = "refactor";
    archetypeReason = "Code reorganization without adding new dependencies or external APIs";
  } else if (
    title.startsWith("docs:") ||
    title.startsWith("docs(") ||
    title.includes("documentation")
  ) {
    archetype = docFilesCount > 0 ? "doc_only" : "feature";
    archetypeReason = "PR focuses on documentation updates";
  } else if (activeCategories.length >= 3) {
    archetype = "mixed";
    archetypeReason = "PR spans multiple distinct categories (API, UI, config, tests)";
  }

  // Determine whether an architectural Before/After flow diagram is genuinely supported by data
  let supportsBeforeAfterFlow = false;
  let supportsBeforeAfterReason = "No multi-tier architectural transition in PR";

  if (archetype === "doc_only") {
    supportsBeforeAfterFlow = false;
    supportsBeforeAfterReason = "Documentation-only PR has no runtime system architecture change";
  } else if (archetype === "dependency_bump") {
    supportsBeforeAfterFlow = false;
    supportsBeforeAfterReason = "Dependency updates do not alter system data flow topology";
  } else if (archetype === "test_only") {
    supportsBeforeAfterFlow = false;
    supportsBeforeAfterReason = "Test additions do not alter production system architecture";
  } else if (archetype === "config") {
    supportsBeforeAfterFlow = false;
    supportsBeforeAfterReason = "Configuration changes do not alter runtime application flow";
  } else if (
    hasApiChanges ||
    hasSchemaChanges ||
    (hasDependencyChanges && activeCategories.length > 1) ||
    activeCategories.length >= 2 ||
    dependencyGraph.edges.length >= 2
  ) {
    supportsBeforeAfterFlow = true;
    supportsBeforeAfterReason = "PR modifies API, data flow, or multi-component interactions";
  }

  // Select primary files ranked by impact
  const primaryFiles = [...files]
    .filter((f) => f.patchStatus === "available" && f.patch)
    .sort((a, b) => (b.additions + b.deletions) - (a.additions + a.deletions));

  return {
    archetype,
    archetypeReason,
    categories,
    activeCategories,
    changeGroups,
    totalFiles: files.length,
    totalAdditions: prData.pullRequest.additions,
    totalDeletions: prData.pullRequest.deletions,
    supportsBeforeAfterFlow,
    supportsBeforeAfterReason,
    primaryFiles: primaryFiles.length > 0 ? primaryFiles : files,
    renamedFiles,
    unavailablePatchFiles,
    hasDependencyChanges,
    hasSchemaChanges,
    hasApiChanges,
    hasTestChanges,
    hasDocChanges,
    semanticFiles,
    dependencyGraph,
    analyzedDiffs,
  };
}
