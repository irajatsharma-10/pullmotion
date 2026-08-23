import { describe, it, expect } from "vitest";
import { parseSourceAST } from "@/lib/analysis/semantic-analyzer";

describe("Semantic AST Analyzer", () => {
  const sampleTsCode = `
import { Octokit } from "octokit";
import { parseGitHubPRUrl } from "@/lib/movie/url-parser";
import type { PRData } from "@/types/pr-data";

export interface MovieOptions {
  duration: number;
  quality: "high" | "low";
}

export class MovieService {
  private client: Octokit;

  constructor(token: string) {
    this.client = new Octokit({ auth: token });
  }

  public async generatePreview(url: string): Promise<string> {
    const parsed = parseGitHubPRUrl(url);
    return "preview-ready";
  }
}

export function helperFunction(a: number, b: number): number {
  return a + b;
}

export const API_VERSION = "2.0";
`;

  it("extracts language, imports, exports, and symbols correctly", () => {
    const semanticInfo = parseSourceAST("src/services/movie-service.ts", sampleTsCode, [16, 17, 18]);

    expect(semanticInfo.language).toBe("typescript");
    expect(semanticInfo.imports.length).toBe(3);
    expect(semanticInfo.imports.map(i => i.source)).toContain("octokit");

    const exportNames = semanticInfo.exports.map(e => e.name);
    expect(exportNames).toContain("MovieOptions");
    expect(exportNames).toContain("MovieService");
    expect(exportNames).toContain("helperFunction");
    expect(exportNames).toContain("API_VERSION");

    expect(semanticInfo.symbols.length).toBeGreaterThan(0);
    const modified = semanticInfo.modifiedSymbols.map(s => s.name);
    expect(modified.some(name => name.includes("MovieService") || name.includes("generatePreview"))).toBe(true);
  });

  it("handles non-TypeScript files and unrecognized extensions gracefully", () => {
    const mdInfo = parseSourceAST("README.md", "# Documentation\nSome markdown text");
    expect(mdInfo.language).toBe("markdown");
    expect(mdInfo.symbols).toHaveLength(0);

    const unknownInfo = parseSourceAST("data.xyz", "custom content");
    expect(unknownInfo.language).toBe("other");
    expect(unknownInfo.symbols).toHaveLength(0);
  });
});
