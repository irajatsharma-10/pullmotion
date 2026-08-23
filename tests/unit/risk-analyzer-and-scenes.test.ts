import { describe, it, expect } from "vitest";
import { analyzeReviewRisks } from "@/lib/analysis/risk-analyzer";
import { ensureUniqueSceneIds } from "@/lib/movie/scene-utils";
import type { PRFile } from "@/types/pr-data";
import type { SemanticFileInfo } from "@/lib/analysis/semantic-analyzer";
import type { AnalyzedDiff } from "@/lib/analysis/diff-analyzer";
import type { DependencyGraph } from "@/lib/analysis/dependency-graph";
import type { PRMovie } from "@/types/pr-movie";

describe("Risk Analyzer & Scene Sanitizer - Edge Cases", () => {
  describe("analyzeReviewRisks", () => {
    it("flags security-sensitive modifications without tests as HIGH severity missing_validation risk", () => {
      const files: PRFile[] = [
        { path: "src/lib/auth/middleware.ts", status: "modified", additions: 25, deletions: 2, patchStatus: "available" },
      ];
      const semanticFiles: SemanticFileInfo[] = [
        {
          path: "src/lib/auth/middleware.ts",
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
      const diffs: AnalyzedDiff[] = [];
      const graph: DependencyGraph = {
        edges: [],
        entryPoints: [],
        leafNodes: [],
        isolatedFiles: [],
        inDegree: {},
        outDegree: {},
        clusters: [],
      };

      const risks = analyzeReviewRisks(files, semanticFiles, diffs, graph);

      expect(risks.length).toBeGreaterThan(0);
      const authRisk = risks.find((r) => r.category === "missing_validation");
      expect(authRisk).toBeDefined();
      expect(authRisk?.severity).toBe("HIGH");
    });

    it("flags high blast radius files when inDegree >= 3", () => {
      const files: PRFile[] = [
        { path: "src/core/types.ts", status: "modified", additions: 10, deletions: 1, patchStatus: "available" },
      ];
      const semanticFiles: SemanticFileInfo[] = [
        {
          path: "src/core/types.ts",
          language: "typescript",
          imports: [],
          exports: [],
          symbols: [],
          modifiedSymbols: [{ name: "UserPayload", kind: "type", startLine: 1, endLine: 10, isExported: true }],
          isTest: false,
          isGenerated: false,
          isConfig: false,
          isEntrypoint: false,
          totalLines: 30,
        },
      ];
      const diffs: AnalyzedDiff[] = [];
      const graph: DependencyGraph = {
        edges: [
          { from: "src/a.ts", to: "src/core/types.ts", type: "imports", symbols: ["UserPayload"], confidence: "direct" },
          { from: "src/b.ts", to: "src/core/types.ts", type: "imports", symbols: ["UserPayload"], confidence: "direct" },
          { from: "src/c.ts", to: "src/core/types.ts", type: "imports", symbols: ["UserPayload"], confidence: "direct" },
        ],
        entryPoints: [],
        leafNodes: [],
        isolatedFiles: [],
        inDegree: { "src/core/types.ts": 3 },
        outDegree: { "src/a.ts": 1, "src/b.ts": 1, "src/c.ts": 1 },
        clusters: [],
      };

      const risks = analyzeReviewRisks(files, semanticFiles, diffs, graph);
      const blastRisk = risks.find((r) => r.id.includes("blast-radius"));

      expect(blastRisk).toBeDefined();
      expect(blastRisk?.severity).toBe("HIGH");
      expect(blastRisk?.relatedFiles).toContain("src/a.ts");
    });
  });

  describe("ensureUniqueSceneIds Sanitization", () => {
    it("deduplicates collision IDs and replaces generic placeholders with unique keys", () => {
      const movieWithDuplicates = {
        movieId: "test-movie",
        scenes: [
          { id: "scene-1", type: "overview" },
          { id: "scene-1", type: "code_changes" }, // duplicate ID
          { id: "scene-code-changes", type: "code_changes" }, // generic placeholder
          { id: "scene-code-changes", type: "code_changes" }, // duplicate generic placeholder
        ],
      } as unknown as PRMovie;

      const sanitized = ensureUniqueSceneIds(movieWithDuplicates);
      const ids = sanitized.scenes.map((s) => s.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(4);
      expect(ids[0]).toBe("scene-1");
      expect(ids[1]).toBe("scene-2-code-changes");
      expect(ids[2]).toBe("scene-3-code-changes");
    });
  });
});
