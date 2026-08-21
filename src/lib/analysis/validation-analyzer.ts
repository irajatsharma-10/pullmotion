import type { PRFile } from "@/types/pr-data";
import { isTestFilePath, type SemanticFileInfo } from "./semantic-analyzer";
import type { DependencyGraph } from "./dependency-graph";
import type { EvidenceRef } from "@/types/evidence";
import type { FileTestCoverage } from "@/types/review-model";

export interface TestChangeMapping {
  testFile: string;
  coversFiles: string[];
  coversSymbols: string[];
  confidence: "direct" | "inferred";
  evidence: EvidenceRef[];
}

export interface UntestedChange {
  file: string;
  symbols: string[];
  reason: string;
  evidence: EvidenceRef[];
}

export interface ValidationSummary {
  testsAdded: string[];
  testsModified: string[];
  testToChangeMapping: TestChangeMapping[];
  untestedChanges: UntestedChange[];
  fileTestCoverages: FileTestCoverage[];
  totalTestFiles: number;
  totalImplementationFiles: number;
  hasTestCoverage: boolean;
  coverageRatio: number;
}

/**
 * Evaluates test verification coverage across changed PR files.
 * Connects tests to real implementation files and symbols via AST dependency edges.
 * Strictly models test presence using 4 explicit states:
 * TEST_EXISTS | TEST_MISSING | TEST_NOT_ANALYZED | TEST_UNAVAILABLE
 */
export function analyzeValidationCoverage(
  files: PRFile[],
  semanticFiles: SemanticFileInfo[],
  dependencyGraph: DependencyGraph
): ValidationSummary {
  const testFiles = files.filter((f) => {
    const sem = semanticFiles.find((s) => s.path === f.path);
    return sem?.isTest || isTestFilePath(f.path);
  });

  const implementationFiles = files.filter((f) => {
    const sem = semanticFiles.find((s) => s.path === f.path);
    return !sem?.isTest && !sem?.isConfig && !sem?.isGenerated && f.status !== "deleted";
  });

  const testsAdded = testFiles.filter((f) => f.status === "added").map((f) => f.path);
  const testsModified = testFiles.filter((f) => f.status === "modified").map((f) => f.path);

  const testToChangeMapping: TestChangeMapping[] = [];
  const coveredImplFiles = new Set<string>();
  const fileToCoveringTests = new Map<string, string[]>();
  const fileToTestedSymbols = new Map<string, string[]>();

  // 1. Map tests to implementations via Dependency Graph "tests" or "imports" edges
  for (const testFile of testFiles) {
    const outEdges = dependencyGraph.edges.filter((e) => e.from === testFile.path);
    const coveredFiles = outEdges.map((e) => e.to);
    const coveredSymbols = outEdges.flatMap((e) => e.symbols);

    coveredFiles.forEach((f) => {
      coveredImplFiles.add(f);
      const existingTests = fileToCoveringTests.get(f) || [];
      existingTests.push(testFile.path);
      fileToCoveringTests.set(f, existingTests);

      const existingSymbols = fileToTestedSymbols.get(f) || [];
      existingSymbols.push(...coveredSymbols);
      fileToTestedSymbols.set(f, Array.from(new Set(existingSymbols)));
    });

    testToChangeMapping.push({
      testFile: testFile.path,
      coversFiles: coveredFiles,
      coversSymbols: coveredSymbols,
      confidence: outEdges.some((e) => e.confidence === "direct") ? "direct" : "inferred",
      evidence: [
        {
          file: testFile.path,
          type: "changed_file",
          startLine: 1,
          endLine: Math.min(40, testFile.additions + testFile.deletions),
          confidence: "direct",
        },
      ],
    });
  }

  // 2. Identify Untested Implementation Changes and compute per-file test coverage states
  const untestedChanges: UntestedChange[] = [];
  const fileTestCoverages: FileTestCoverage[] = [];

  for (const file of files) {
    const sem = semanticFiles.find((s) => s.path === file.path);
    const isTest = sem?.isTest || isTestFilePath(file.path);

    if (isTest) {
      fileTestCoverages.push({
        file: file.path,
        status: "TEST_EXISTS",
        coveringTestFiles: [file.path],
        testedSymbols: [],
        reason: "File is itself a test suite in this PR surface.",
      });
      continue;
    }

    if (file.patchStatus === "unavailable") {
      fileTestCoverages.push({
        file: file.path,
        status: "TEST_UNAVAILABLE",
        coveringTestFiles: [],
        testedSymbols: [],
        reason: "Diff patch is unavailable (e.g. binary or exceeds limits); test coverage cannot be established.",
      });
      continue;
    }

    if (sem?.isConfig || sem?.isGenerated || file.path.endsWith(".md") || file.path.endsWith(".json")) {
      fileTestCoverages.push({
        file: file.path,
        status: "TEST_NOT_ANALYZED",
        coveringTestFiles: [],
        testedSymbols: [],
        reason: "Non-executable documentation or configuration file not subject to unit test coverage.",
      });
      continue;
    }

    if (coveredImplFiles.has(file.path)) {
      const coveringTests = fileToCoveringTests.get(file.path) || [];
      const testedSyms = fileToTestedSymbols.get(file.path) || [];
      fileTestCoverages.push({
        file: file.path,
        status: "TEST_EXISTS",
        coveringTestFiles: coveringTests,
        testedSymbols: testedSyms,
        reason: `Covered by test suite: ${coveringTests.join(", ")}`,
      });
    } else {
      const modifiedSymbols = sem ? sem.modifiedSymbols.map((s) => s.name) : [];
      fileTestCoverages.push({
        file: file.path,
        status: "TEST_MISSING",
        coveringTestFiles: [],
        testedSymbols: [],
        reason: "No corresponding test was detected in the analyzed PR change set.",
      });

      if (file.status !== "deleted") {
        untestedChanges.push({
          file: file.path,
          symbols: modifiedSymbols,
          reason: "No corresponding test was identified in the analyzed test surface.",
          evidence: [
            {
              file: file.path,
              type: "changed_file",
              startLine: 1,
              endLine: Math.min(30, file.additions + file.deletions),
              confidence: "direct",
              symbol: modifiedSymbols[0],
            },
          ],
        });
      }
    }
  }

  const totalImplCount = implementationFiles.length;
  const coverageRatio = totalImplCount > 0 ? coveredImplFiles.size / totalImplCount : 1;

  return {
    testsAdded,
    testsModified,
    testToChangeMapping,
    untestedChanges,
    fileTestCoverages,
    totalTestFiles: testFiles.length,
    totalImplementationFiles: totalImplCount,
    hasTestCoverage: testFiles.length > 0,
    coverageRatio,
  };
}

