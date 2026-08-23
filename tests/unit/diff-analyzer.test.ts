import { describe, it, expect } from "vitest";
import { analyzeDiff } from "@/lib/analysis/diff-analyzer";
import { parseSourceAST } from "@/lib/analysis/semantic-analyzer";

describe("Diff Analyzer", () => {
  const sampleTsCode = `
export class MovieService {
  constructor(token: string) {
    this.client = new Octokit({ auth: token });
  }

  public async cancelGeneration(): Promise<void> {}
}
`;

  const samplePatch = `@@ -10,6 +10,12 @@ export class MovieService {
    constructor(token: string) {
+    if (!token) {
+      throw new Error("Token required");
+    }
     this.client = new Octokit({ auth: token });
   }
+
+  public async cancelGeneration(): Promise<void> {}
`;

  it("parses unified diff patch into structured hunks", () => {
    const semanticInfo = parseSourceAST("src/services/movie-service.ts", sampleTsCode);
    const diff = analyzeDiff("src/services/movie-service.ts", samplePatch, semanticInfo);

    expect(diff.hunks.length).toBe(1);
    expect(diff.totalAdded).toBeGreaterThan(0);
    expect(diff.hasBranchChanges).toBe(true);
  });

  it("handles empty patches without throwing", () => {
    const diff = analyzeDiff("src/empty.ts", "");
    expect(diff.hunks).toHaveLength(0);
    expect(diff.totalAdded).toBe(0);
    expect(diff.totalRemoved).toBe(0);
  });
});
