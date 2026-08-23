import { describe, it, expect } from "vitest";
import { parseSourceAST } from "@/lib/analysis/semantic-analyzer";
import { buildDependencyGraph } from "@/lib/analysis/dependency-graph";

describe("Dependency Graph Builder", () => {
  const fileA = parseSourceAST(
    "src/services/movie-service.ts",
    `export class MovieService {}`
  );

  const fileB = parseSourceAST(
    "src/controllers/movie-controller.ts",
    `import { MovieService } from "@/services/movie-service";
     export function handleRequest() { return new MovieService(); }`
  );

  const fileCTest = parseSourceAST(
    "tests/movie-controller.test.ts",
    `import { handleRequest } from "@/controllers/movie-controller";
     describe("movie-controller", () => {});`
  );

  it("constructs directed import and test edges between PR files", () => {
    const graph = buildDependencyGraph([fileA, fileB, fileCTest]);

    expect(graph.edges.length).toBeGreaterThanOrEqual(2);

    const importEdge = graph.edges.find(
      (e) => e.from === "src/controllers/movie-controller.ts" && e.to === "src/services/movie-service.ts"
    );
    expect(importEdge).toBeDefined();
    expect(importEdge?.type).toBe("imports");

    const testEdge = graph.edges.find(
      (e) => e.from === "tests/movie-controller.test.ts" && e.to === "src/controllers/movie-controller.ts"
    );
    expect(testEdge).toBeDefined();
    expect(testEdge?.type).toBe("tests");
  });
});
