import { describe, it, expect } from "vitest";
import { analyzeValidationCoverage } from "@/lib/analysis/validation-analyzer";
import type { PRFile } from "@/types/pr-data";
import type { SemanticFileInfo } from "@/lib/analysis/semantic-analyzer";
import type { DependencyGraph } from "@/lib/analysis/dependency-graph";

describe("Validation Coverage Analyzer - Edge Cases", () => {
  const emptyGraph: DependencyGraph = {
    edges: [],
    entryPoints: [],
    leafNodes: [],
    isolatedFiles: [],
    inDegree: {},
    outDegree: {},
    clusters: [],
  };

  it("handles a 100% test-only PR without division by zero", () => {
    const files: PRFile[] = [
      {
        path: "tests/unit/payment.test.ts",
        status: "added",
        additions: 50,
        deletions: 0,
        patchStatus: "available",
      },
      {
        path: "tests/integration/api.spec.ts",
        status: "modified",
        additions: 20,
        deletions: 5,
        patchStatus: "available",
      },
    ];

    const semanticFiles: SemanticFileInfo[] = [
      {
        path: "tests/unit/payment.test.ts",
        language: "typescript",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [],
        isTest: true,
        isGenerated: false,
        isConfig: false,
        isEntrypoint: false,
        totalLines: 50,
      },
      {
        path: "tests/integration/api.spec.ts",
        language: "typescript",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [],
        isTest: true,
        isGenerated: false,
        isConfig: false,
        isEntrypoint: false,
        totalLines: 30,
      },
    ];

    const summary = analyzeValidationCoverage(files, semanticFiles, emptyGraph);

    expect(summary.totalTestFiles).toBe(2);
    expect(summary.totalImplementationFiles).toBe(0);
    expect(summary.hasTestCoverage).toBe(true);
    expect(summary.coverageRatio).toBe(1); // Safely defaults to 1.0 rather than NaN
    expect(summary.untestedChanges).toHaveLength(0);
    expect(summary.fileTestCoverages.every((c) => c.status === "TEST_EXISTS")).toBe(true);
  });

  it("handles a 0% test PR with multiple implementation files", () => {
    const files: PRFile[] = [
      {
        path: "src/services/billing.ts",
        status: "modified",
        additions: 40,
        deletions: 10,
        patchStatus: "available",
      },
      {
        path: "src/controllers/auth.ts",
        status: "added",
        additions: 80,
        deletions: 0,
        patchStatus: "available",
      },
    ];

    const semanticFiles: SemanticFileInfo[] = [
      {
        path: "src/services/billing.ts",
        language: "typescript",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [{ name: "chargeCustomer", kind: "function", startLine: 1, endLine: 30, isExported: true }],
        isTest: false,
        isGenerated: false,
        isConfig: false,
        isEntrypoint: false,
        totalLines: 40,
      },
      {
        path: "src/controllers/auth.ts",
        language: "typescript",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [{ name: "login", kind: "function", startLine: 1, endLine: 50, isExported: true }],
        isTest: false,
        isGenerated: false,
        isConfig: false,
        isEntrypoint: false,
        totalLines: 80,
      },
    ];

    const summary = analyzeValidationCoverage(files, semanticFiles, emptyGraph);

    expect(summary.totalTestFiles).toBe(0);
    expect(summary.totalImplementationFiles).toBe(2);
    expect(summary.hasTestCoverage).toBe(false);
    expect(summary.coverageRatio).toBe(0);
    expect(summary.untestedChanges).toHaveLength(2);
    expect(summary.fileTestCoverages.every((c) => c.status === "TEST_MISSING")).toBe(true);
  });

  it("excludes deleted implementation files from untestedChanges warnings", () => {
    const files: PRFile[] = [
      {
        path: "src/legacy/old-auth.ts",
        status: "deleted",
        additions: 0,
        deletions: 120,
        patchStatus: "available",
      },
      {
        path: "tests/legacy/old-auth.test.ts",
        status: "deleted",
        additions: 0,
        deletions: 80,
        patchStatus: "available",
      },
    ];

    const semanticFiles: SemanticFileInfo[] = [
      {
        path: "src/legacy/old-auth.ts",
        language: "typescript",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [],
        isTest: false,
        isGenerated: false,
        isConfig: false,
        isEntrypoint: false,
        totalLines: 0,
      },
      {
        path: "tests/legacy/old-auth.test.ts",
        language: "typescript",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [],
        isTest: true,
        isGenerated: false,
        isConfig: false,
        isEntrypoint: false,
        totalLines: 0,
      },
    ];

    const summary = analyzeValidationCoverage(files, semanticFiles, emptyGraph);

    expect(summary.totalImplementationFiles).toBe(0);
    expect(summary.untestedChanges).toHaveLength(0);
  });

  it("correctly models TEST_NOT_ANALYZED and TEST_UNAVAILABLE across heterogeneous file types", () => {
    const files: PRFile[] = [
      {
        path: "docs/architecture.md",
        status: "modified",
        additions: 30,
        deletions: 2,
        patchStatus: "available",
      },
      {
        path: "public/logo.png",
        status: "added",
        additions: 0,
        deletions: 0,
        patchStatus: "unavailable",
      },
      {
        path: "prisma/schema.prisma",
        status: "modified",
        additions: 15,
        deletions: 0,
        patchStatus: "available",
      },
    ];

    const semanticFiles: SemanticFileInfo[] = [
      {
        path: "docs/architecture.md",
        language: "markdown",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [],
        isTest: false,
        isGenerated: false,
        isConfig: false,
        isEntrypoint: false,
        totalLines: 30,
      },
      {
        path: "public/logo.png",
        language: "other",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [],
        isTest: false,
        isGenerated: false,
        isConfig: false,
        isEntrypoint: false,
        totalLines: 0,
      },
      {
        path: "prisma/schema.prisma",
        language: "other",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [],
        isTest: false,
        isGenerated: false,
        isConfig: true,
        isEntrypoint: false,
        totalLines: 15,
      },
    ];

    const summary = analyzeValidationCoverage(files, semanticFiles, emptyGraph);

    const docCoverage = summary.fileTestCoverages.find((c) => c.file === "docs/architecture.md");
    expect(docCoverage?.status).toBe("TEST_NOT_ANALYZED");

    const binaryCoverage = summary.fileTestCoverages.find((c) => c.file === "public/logo.png");
    expect(binaryCoverage?.status).toBe("TEST_UNAVAILABLE");

    const prismaCoverage = summary.fileTestCoverages.find((c) => c.file === "prisma/schema.prisma");
    expect(prismaCoverage?.status).toBe("TEST_NOT_ANALYZED");

    expect(summary.untestedChanges).toHaveLength(0);
  });
});
