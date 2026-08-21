import type { SemanticFileInfo } from "./semantic-analyzer";

export type DependencyEdgeType = "imports" | "tests" | "implements" | "configures";

export interface DependencyEdge {
  from: string; // File initiating the import/dependency
  to: string;   // File being depended on
  type: DependencyEdgeType;
  symbols: string[];
  confidence: "direct" | "inferred";
  isTypeOnly?: boolean;
}

export interface DependencyCluster {
  id: string;
  title: string;
  files: string[];
  primaryFile: string;
  subsystem: string;
}

export interface DependencyGraph {
  edges: DependencyEdge[];
  entryPoints: string[];
  leafNodes: string[];
  isolatedFiles: string[];
  inDegree: Record<string, number>;
  outDegree: Record<string, number>;
  clusters: DependencyCluster[];
}

/**
 * Builds a directed dependency graph connecting files within the PR
 * based on AST import declarations and file relationships.
 */
export function buildDependencyGraph(files: SemanticFileInfo[]): DependencyGraph {
  const filePaths = new Set(files.map((f) => f.path));
  const edges: DependencyEdge[] = [];
  const inDegree: Record<string, number> = {};
  const outDegree: Record<string, number> = {};

  // Initialize degree maps
  files.forEach((f) => {
    inDegree[f.path] = 0;
    outDegree[f.path] = 0;
  });

  // 1. Resolve imports to target files within the PR file set
  for (const sourceFile of files) {
    for (const imp of sourceFile.imports) {
      const resolvedTarget = resolveImportPath(sourceFile.path, imp.source, filePaths);
      if (resolvedTarget && resolvedTarget !== sourceFile.path) {
        const symbolNames = imp.specifiers.map((s) => s.name);
        if (imp.defaultImport) symbolNames.push(imp.defaultImport);
        if (imp.namespaceImport) symbolNames.push(imp.namespaceImport);

        // Determine edge type: test -> impl is "tests", otherwise "imports"
        let edgeType: DependencyEdgeType = "imports";
        if (sourceFile.isTest) {
          edgeType = "tests";
        }

        edges.push({
          from: sourceFile.path,
          to: resolvedTarget,
          type: edgeType,
          symbols: symbolNames,
          confidence: "direct",
          isTypeOnly: imp.isTypeOnly,
        });

        outDegree[sourceFile.path] = (outDegree[sourceFile.path] || 0) + 1;
        inDegree[resolvedTarget] = (inDegree[resolvedTarget] || 0) + 1;
      }
    }

    // 2. Co-located Go package clustering: all .go files in the same directory share package scope
    if (sourceFile.language === "go" && !sourceFile.isTest) {
      const fromDir = sourceFile.path.split("/").slice(0, -1).join("/");
      for (const targetFile of files) {
        if (
          targetFile.path !== sourceFile.path &&
          targetFile.language === "go" &&
          !targetFile.isTest
        ) {
          const targetDir = targetFile.path.split("/").slice(0, -1).join("/");
          if (fromDir === targetDir) {
            const exists = edges.some(
              (e) =>
                (e.from === sourceFile.path && e.to === targetFile.path) ||
                (e.from === targetFile.path && e.to === sourceFile.path)
            );
            if (!exists) {
              edges.push({
                from: sourceFile.path,
                to: targetFile.path,
                type: "imports",
                symbols: [],
                confidence: "inferred",
              });
              outDegree[sourceFile.path] = (outDegree[sourceFile.path] || 0) + 1;
              inDegree[targetFile.path] = (inDegree[targetFile.path] || 0) + 1;
            }
          }
        }
      }
    }

    // 3. Pair co-located test files that might not explicitly import everything (naming convention)
    if (sourceFile.isTest) {
      const targetPath = findTestedFilePath(sourceFile.path, filePaths);
      if (targetPath && !edges.some((e) => e.from === sourceFile.path && e.to === targetPath)) {
        edges.push({
          from: sourceFile.path,
          to: targetPath,
          type: "tests",
          symbols: [],
          confidence: "inferred",
        });
        outDegree[sourceFile.path] = (outDegree[sourceFile.path] || 0) + 1;
        inDegree[targetPath] = (inDegree[targetPath] || 0) + 1;
      }
    }
  }

  // 4. Compute entry points, leaves, and isolated files
  const entryPoints: string[] = [];
  const leafNodes: string[] = [];
  const isolatedFiles: string[] = [];

  files.forEach((f) => {
    const inDeg = inDegree[f.path] || 0;
    const outDeg = outDegree[f.path] || 0;

    if (inDeg === 0 && outDeg === 0) {
      isolatedFiles.push(f.path);
    } else {
      if (inDeg === 0) {
        entryPoints.push(f.path);
      }
      if (outDeg === 0) {
        leafNodes.push(f.path);
      }
    }
  });

  // 5. Extract connected clusters (connected components)
  const clusters = extractConnectedClusters(files, edges);

  return {
    edges,
    entryPoints,
    leafNodes,
    isolatedFiles,
    inDegree,
    outDegree,
    clusters,
  };
}

/**
 * Resolves an import source string (e.g. './foo', '@/lib/bar', 'crate::models', 'from .services') to a concrete PR file path.
 */
export function resolveImportPath(
  fromFilePath: string,
  importSource: string,
  allFiles: Set<string>
): string | null {
  // Candidate extensions across polyglot ecosystems
  const extensions = [
    "",
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".py", "/__init__.py",
    ".go",
    ".rs", "/mod.rs",
    ".java", ".kt", ".cs",
    ".cpp", ".cc", ".c", ".h", ".hpp",
    ".rb", ".php",
    "/index.ts", "/index.tsx", "/index.js"
  ];

  // 1. Relative imports: ./ or ../ or Python .submodule
  if (importSource.startsWith(".")) {
    const fromDir = fromFilePath.split("/").slice(0, -1).join("/");
    // Normalize Python dot syntax e.g. .models -> ./models, ..services -> ../services
    const relPath = importSource.replace(/^\.+/, (dots) => {
      return dots.length === 1 ? "./" : "../".repeat(dots.length - 1);
    });
    const normalized = normalizePath(`${fromDir}/${relPath}`);

    for (const ext of extensions) {
      const candidate = `${normalized}${ext}`;
      if (allFiles.has(candidate)) return candidate;
    }
  }

  // 2. Rust crate:: or super:: imports
  if (importSource.startsWith("crate::")) {
    const sub = importSource.replace(/^crate::/, "").replace(/::/g, "/");
    for (const ext of extensions) {
      const candidateSrc = `src/${sub}${ext}`;
      if (allFiles.has(candidateSrc)) return candidateSrc;
      const candidateRoot = `${sub}${ext}`;
      if (allFiles.has(candidateRoot)) return candidateRoot;
    }
  }
  if (importSource.startsWith("super::")) {
    const fromDir = fromFilePath.split("/").slice(0, -1).join("/");
    const sub = importSource.replace(/^super::/, "").replace(/::/g, "/");
    const normalized = normalizePath(`${fromDir}/../${sub}`);
    for (const ext of extensions) {
      const candidate = `${normalized}${ext}`;
      if (allFiles.has(candidate)) return candidate;
    }
  }

  // 3. Path alias imports: @/ or ~/
  if (importSource.startsWith("@/") || importSource.startsWith("~/")) {
    const relativeToSrc = importSource.replace(/^[@~]\//, "src/");
    for (const ext of extensions) {
      const candidate = `${relativeToSrc}${ext}`;
      if (allFiles.has(candidate)) return candidate;
    }

    // Direct project root alias (e.g. @/lib -> lib/ or app/)
    const withoutPrefix = importSource.replace(/^[@~]\//, "");
    for (const ext of extensions) {
      const candidate = `${withoutPrefix}${ext}`;
      if (allFiles.has(candidate)) return candidate;
    }
  }

  // 4. Monorepo package imports: packages/xxx or package name
  if (importSource.startsWith("packages/")) {
    for (const ext of extensions) {
      const candidate = `${importSource}${ext}`;
      if (allFiles.has(candidate)) return candidate;
    }
  }

  // 5. Search by exact base name or dotted package match (e.g. Java / Python)
  const slashSource = importSource.replace(/\./g, "/");
  for (const file of allFiles) {
    const stripped = file.replace(/\.[^/.]+$/, "");
    if (
      stripped.endsWith(importSource.replace(/^\.\.?\//, "")) ||
      stripped.endsWith(slashSource)
    ) {
      return file;
    }
  }

  return null;
}

function normalizePath(p: string): string {
  const parts = p.split("/");
  const stack: string[] = [];

  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      stack.pop();
    } else {
      stack.push(part);
    }
  }

  return stack.join("/");
}

export function findTestedFilePath(testPath: string, allFiles: Set<string>): string | null {
  const p = testPath;
  const lower = p.toLowerCase();

  // Python: test_foo.py / foo_test.py -> foo.py
  if (lower.endsWith("_test.py")) {
    const candidate = p.replace(/_test\.py$/, ".py");
    if (allFiles.has(candidate)) return candidate;
  }
  if (lower.includes("test_") && lower.endsWith(".py")) {
    const candidate = p.replace(/test_([a-zA-Z0-9_-]+\.py)$/, "$1");
    if (allFiles.has(candidate)) return candidate;
    const noTestsDir = candidate.replace(/\/tests?\//, "/");
    if (allFiles.has(noTestsDir)) return noTestsDir;
  }

  // Go: foo_test.go -> foo.go
  if (lower.endsWith("_test.go")) {
    const candidate = p.replace(/_test\.go$/, ".go");
    if (allFiles.has(candidate)) return candidate;
  }

  // Rust: tests/test_foo.rs -> src/foo.rs or foo.rs
  if (lower.endsWith(".rs") && (lower.includes("test") || lower.startsWith("tests/"))) {
    const base = p.split("/").pop()?.replace(/^test_/, "").replace(/_test\.rs$/, ".rs") || "";
    for (const file of allFiles) {
      if (file.endsWith(`/${base}`) || file === base || file === `src/${base}`) {
        return file;
      }
    }
  }

  // Java / Kotlin / C#: FooTest.java / FooTests.kt -> Foo.java / Foo.kt
  if (
    lower.endsWith("test.java") ||
    lower.endsWith("tests.java") ||
    lower.endsWith("test.kt") ||
    lower.endsWith("tests.kt") ||
    lower.endsWith("test.cs") ||
    lower.endsWith("tests.cs")
  ) {
    const ext = p.substring(p.lastIndexOf("."));
    const base = p.replace(/(?:Tests?)\.[^.]+$/, ext);
    if (allFiles.has(base)) return base;
    const srcCandidate = base.replace(/\/test\//, "/main/").replace(/\/tests?\//, "/src/");
    if (allFiles.has(srcCandidate)) return srcCandidate;
  }

  // Ruby: foo_spec.rb / test_foo.rb -> foo.rb
  if (
    lower.endsWith("_spec.rb") ||
    lower.endsWith("_test.rb") ||
    (lower.includes("test_") && lower.endsWith(".rb"))
  ) {
    const base =
      p.split("/").pop()?.replace(/_spec\.rb$/, ".rb").replace(/_test\.rb$/, ".rb").replace(/^test_/, "") ||
      "";
    for (const file of allFiles) {
      if (file.endsWith(`/${base}`) || file === base || file === `lib/${base}` || file === `app/${base}`) {
        return file;
      }
    }
  }

  // C/C++: foo_test.cpp / test_foo.cpp -> foo.cpp or foo.h
  if (lower.endsWith("_test.cpp") || lower.endsWith("_test.cc") || lower.endsWith("test.cpp")) {
    const baseName =
      p.split("/").pop()?.replace(/_test\.[^.]+$/, "").replace(/^test_/, "") || "";
    for (const ext of [".cpp", ".cc", ".h", ".hpp", ".c"]) {
      for (const file of allFiles) {
        if (file.endsWith(`/${baseName}${ext}`) || file === `${baseName}${ext}`) {
          return file;
        }
      }
    }
  }

  // TypeScript / JavaScript conventions
  const base = testPath
    .replace(/\.test\.[^.]+$/, "")
    .replace(/\.spec\.[^.]+$/, "")
    .replace(/__tests__\//, "")
    .replace(/\/tests?\//, "/");

  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
  ];

  for (const c of candidates) {
    if (allFiles.has(c)) return c;
  }

  return null;
}

function extractConnectedClusters(
  files: SemanticFileInfo[],
  edges: DependencyEdge[]
): DependencyCluster[] {
  // Undirected adjacency map for connected component discovery
  const adj = new Map<string, Set<string>>();
  files.forEach((f) => adj.set(f.path, new Set()));

  for (const edge of edges) {
    adj.get(edge.from)?.add(edge.to);
    adj.get(edge.to)?.add(edge.from);
  }

  const visited = new Set<string>();
  const clusters: DependencyCluster[] = [];
  let clusterId = 1;

  for (const file of files) {
    if (visited.has(file.path)) continue;

    // Breadth-first search for connected component
    const component: string[] = [];
    const queue = [file.path];
    visited.add(file.path);

    while (queue.length > 0) {
      const current = queue.shift()!;
      component.push(current);

      const neighbors = adj.get(current) || new Set();
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }

    if (component.length > 0) {
      // Pick primary file: prioritize entrypoints, then highest total lines / symbol count
      const sorted = [...component].sort((a, b) => {
        const fileA = files.find((f) => f.path === a);
        const fileB = files.find((f) => f.path === b);
        const aScore = (fileA?.isEntrypoint ? 100 : 0) + (fileA?.symbols.length || 0);
        const bScore = (fileB?.isEntrypoint ? 100 : 0) + (fileB?.symbols.length || 0);
        return bScore - aScore;
      });

      const primary = sorted[0];
      const subsystem = primary.split("/").slice(0, 2).join("/");

      clusters.push({
        id: `cluster-${clusterId++}`,
        title: deriveClusterTitle(primary, component),
        files: component,
        primaryFile: primary,
        subsystem,
      });
    }
  }

  return clusters;
}

function deriveClusterTitle(primaryFile: string, files: string[]): string {
  const parts = primaryFile.split("/");
  const fileName = parts[parts.length - 1]?.replace(/\.[^/.]+$/, "") || "Module";

  if (primaryFile.startsWith("packages/") && parts.length >= 4) {
    const pkgName = parts[1];
    const subModule = parts[3];
    return `${formatName(subModule)} (${formatName(pkgName)})`;
  }

  if (primaryFile.startsWith("crates/") && parts.length >= 2) {
    return formatName(parts[1]);
  }

  if (primaryFile.startsWith("scripts/") && parts.length >= 2) {
    return `Build Tooling: ${formatName(parts[1])}`;
  }

  if (primaryFile.startsWith("test/") || primaryFile.startsWith("tests/")) {
    return `Test Suite Verification (${formatName(parts[1] || "Core")})`;
  }

  const dirName = parts.length >= 2 ? parts[parts.length - 2] : "Core";

  if (files.length === 1) {
    return formatName(fileName);
  }

  return `${formatName(fileName)} & ${files.length - 1} related (${formatName(dirName)})`;
}

function formatName(str: string): string {
  return str
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
