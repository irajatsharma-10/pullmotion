import { describe, it, expect } from "vitest";
import { analyzeValidationCoverage } from "@/lib/analysis/validation-analyzer";
import type { PRFile } from "@/types/pr-data";
import type { SemanticFileInfo } from "@/lib/analysis/semantic-analyzer";
import type { DependencyGraph } from "@/lib/analysis/dependency-graph";

describe("Validation Coverage Analyzer", () => {
  it("correctly identifies tested vs untested changes in 4-state model", () => {
    const files: PRFile[] = [
      {
        path: "src/lib/auth/token.ts",
        status: "modified",
        additions: 30,
        deletions: 5,
        patchStatus: "available",
      },
      {
        path: "src/lib/auth/token.test.ts",
        status: "added",
        additions: 40,
        deletions: 0,
        patchStatus: "available",
      },
      {
        path: "src/lib/untested-service.ts",
        status: "added",
        additions: 50,
        deletions: 0,
        patchStatus: "available",
      },
      {
        path: "README.md",
        status: "modified",
        additions: 5,
        deletions: 1,
        patchStatus: "available",
      },
    ];

    const semanticFiles: SemanticFileInfo[] = [
      {
        path: "src/lib/auth/token.ts",
        language: "typescript",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [{ name: "generateToken", kind: "function", startLine: 1, endLine: 20, isExported: true }],
        isTest: false,
        isGenerated: false,
        isConfig: false,
        isEntrypoint: false,
        totalLines: 30,
      },
      {
        path: "src/lib/auth/token.test.ts",
        language: "typescript",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [],
        isTest: true,
        isGenerated: false,
        isConfig: false,
        isEntrypoint: false,
        totalLines: 40,
      },
      {
        path: "src/lib/untested-service.ts",
        language: "typescript",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [{ name: "processBilling", kind: "function", startLine: 1, endLine: 50, isExported: true }],
        isTest: false,
        isGenerated: false,
        isConfig: false,
        isEntrypoint: false,
        totalLines: 50,
      },
    ];

    const dependencyGraph: DependencyGraph = {
      edges: [
        {
          from: "src/lib/auth/token.test.ts",
          to: "src/lib/auth/token.ts",
          type: "tests",
          symbols: ["generateToken"],
          confidence: "direct",
        },
      ],
      entryPoints: [],
      leafNodes: [],
      isolatedFiles: [],
      inDegree: { "src/lib/auth/token.ts": 1 },
      outDegree: { "src/lib/auth/token.test.ts": 1 },
      clusters: [],
    };

    const summary = analyzeValidationCoverage(files, semanticFiles, dependencyGraph);

    expect(summary.totalTestFiles).toBe(1);
    expect(summary.hasTestCoverage).toBe(true);

    const tokenCoverage = summary.fileTestCoverages.find((c) => c.file === "src/lib/auth/token.ts");
    expect(tokenCoverage?.status).toBe("TEST_EXISTS");

    const untestedCoverage = summary.fileTestCoverages.find((c) => c.file === "src/lib/untested-service.ts");
    expect(untestedCoverage?.status).toBe("TEST_MISSING");

    const docCoverage = summary.fileTestCoverages.find((c) => c.file === "README.md");
    expect(docCoverage?.status).toBe("TEST_NOT_ANALYZED");

    expect(summary.untestedChanges.some((u) => u.file === "src/lib/untested-service.ts")).toBe(true);
  });
});
