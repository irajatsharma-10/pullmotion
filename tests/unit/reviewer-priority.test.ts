import { describe, it, expect } from "vitest";
import { evaluateReviewerPriority } from "@/lib/analysis/reviewer-priority";
import type { PRFile } from "@/types/pr-data";
import type { SemanticFileInfo } from "@/lib/analysis/semantic-analyzer";
import type { AnalyzedDiff } from "@/lib/analysis/diff-analyzer";
import type { DependencyGraph } from "@/lib/analysis/dependency-graph";

describe("Reviewer Priority Engine", () => {
  const dummyDependencyGraph: DependencyGraph = {
    edges: [],
    entryPoints: [],
    leafNodes: [],
    isolatedFiles: [],
    inDegree: {},
    outDegree: {},
    clusters: [],
  };

  it("assigns HIGH priority to security and authentication files", () => {
    const files: PRFile[] = [
      {
        path: "src/lib/auth/jwt.ts",
        status: "modified",
        additions: 25,
        deletions: 5,
        patchStatus: "available",
      },
    ];

    const semanticFiles: SemanticFileInfo[] = [
      {
        path: "src/lib/auth/jwt.ts",
        language: "typescript",
        imports: [],
        exports: [],
        symbols: [],
        modifiedSymbols: [],
        isTest: false,
        isGenerated: false,
        isConfig: false,
        isEntrypoint: false,
        totalLines: 50,
      },
    ];

    const analyzedDiffs: AnalyzedDiff[] = [
      {
        path: "src/lib/auth/jwt.ts",
        hunks: [],
        totalAdded: 25,
        totalRemoved: 5,
        modifiedLineNumbers: [10, 11],
        modifiedSymbols: [],
        changeTypes: ["general_logic"],
        hasSignatureChanges: false,
        hasBranchChanges: false,
        hasSchemaChanges: false,
        hasApiChanges: false,
        hasTestChanges: false,
      },
    ];

    const priorityItems = evaluateReviewerPriority(
      files,
      semanticFiles,
      analyzedDiffs,
      dummyDependencyGraph
    );

    expect(priorityItems.length).toBe(1);
    expect(priorityItems[0].priority).toBe("HIGH");
    expect(priorityItems[0].signals).toContain("security_sensitive");
  });

  it("assigns HIGH priority to database schema files", () => {
    const files: PRFile[] = [
      {
        path: "src/prisma/schema.prisma",
        status: "modified",
        additions: 15,
        deletions: 2,
        patchStatus: "available",
      },
    ];

    const semanticFiles: SemanticFileInfo[] = [];
    const analyzedDiffs: AnalyzedDiff[] = [
      {
        path: "src/prisma/schema.prisma",
        hunks: [],
        totalAdded: 15,
        totalRemoved: 2,
        modifiedLineNumbers: [],
        modifiedSymbols: [],
        changeTypes: ["schema_change"],
        hasSignatureChanges: false,
        hasBranchChanges: false,
        hasSchemaChanges: true,
        hasApiChanges: false,
        hasTestChanges: false,
      },
    ];

    const priorityItems = evaluateReviewerPriority(
      files,
      semanticFiles,
      analyzedDiffs,
      dummyDependencyGraph
    );

    expect(priorityItems.length).toBe(1);
    expect(priorityItems[0].priority).toBe("HIGH");
    expect(priorityItems[0].signals).toContain("data_mutation");
  });
});
