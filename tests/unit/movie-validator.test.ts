import { describe, it, expect } from "vitest";
import { validatePRMovie } from "@/lib/analysis/movie-validator";
import { buildPRReviewModel } from "@/lib/analysis/review-model-builder";
import type { PRData } from "@/types/pr-data";
import type { PRMovie } from "@/types/pr-movie";

describe("Deterministic Movie Validator & Hallucination Firewall", () => {
  const dummyPRData: PRData = {
    repository: {
      owner: "vercel",
      name: "next.js",
      fullName: "vercel/next.js",
      url: "https://github.com/vercel/next.js",
    },
    pullRequest: {
      number: 49258,
      title: "Add Redis caching layer to reduce DB load",
      description: "Implements Redis caching before database queries.",
      author: "leerob",
      url: "https://github.com/vercel/next.js/pull/49258",
      baseBranch: "main",
      headBranch: "feat/redis-cache",
      baseSha: "abc",
      headSha: "def",
      additions: 120,
      deletions: 15,
      changedFiles: 3,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-02T00:00:00Z",
      labels: ["feature"],
    },
    commits: [],
    files: [
      {
        path: "packages/next/src/server/redis-cache.ts",
        status: "added",
        additions: 80,
        deletions: 0,
        patchStatus: "available",
        patch: "@@ -0,0 +1,10 @@\n+export function getCachedValue() {}",
      },
      {
        path: "packages/next/src/server/db.ts",
        status: "modified",
        additions: 40,
        deletions: 15,
        patchStatus: "available",
        patch: "@@ -10,5 +10,8 @@\n-function query() {}\n+function query() { getCachedValue(); }",
      },
    ],
  };

  const reviewModel = buildPRReviewModel(dummyPRData);

  it("passes validation for valid movie matching review model files", () => {
    const validMovie: PRMovie = {
      version: 1,
      movieId: "mov-test",
      sourceHash: "hash-123",
      pr: {
        url: "https://github.com/vercel/next.js/pull/49258",
        owner: "vercel",
        repo: "next.js",
        number: 49258,
        title: "Add Redis caching layer to reduce DB load",
        author: "leerob",
        createdAt: "2026-08-01T00:00:00Z",
      },
      overview: {
        title: "Add Redis caching layer to reduce DB load",
        summary: "Implements Redis caching before database queries.",
        totalDuration: 30,
        stats: { additions: 120, deletions: 15, filesChanged: 3, commits: 0 },
      },
      scenes: [
        {
          id: "scene-1-overview",
          type: "overview",
          title: "PR Overview",
          duration: 5,
          author: "leerob",
          stats: { additions: 120, deletions: 15, filesChanged: 3, commits: 0 },
          summary: "Implements caching layer.",
        },
        {
          id: "scene-2-code",
          type: "code_changes",
          title: "Redis Cache Implementation",
          duration: 10,
          filePath: "packages/next/src/server/redis-cache.ts",
          language: "typescript",
          codeSnippet: "export function getCachedValue() {}",
          explanation: "Implements cache lookup mechanism.",
          snippets: [{ after: "export function getCachedValue() {}", startLine: 1, endLine: 10 }],
          claims: [],
        },
        {
          id: "scene-3-summary",
          type: "summary",
          title: "Summary & Takeaways",
          duration: 5,
          bullets: [{ text: "Adds caching mechanism to next server." }],
        },
      ],
      evidence: [
        {
          id: "ev-1",
          file: "packages/next/src/server/redis-cache.ts",
          type: "changed_file",
          githubUrl: "https://github.com/vercel/next.js/pull/49258/files#diff-1",
        },
      ],
      createdAt: "2026-08-01T00:00:00Z",
    };

    const result = validatePRMovie(validMovie, reviewModel);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("rejects movie citing hallucinated non-existent files", () => {
    const invalidMovie: PRMovie = {
      version: 1,
      movieId: "mov-test-bad",
      sourceHash: "hash-123",
      pr: {
        url: "https://github.com/vercel/next.js/pull/49258",
        owner: "vercel",
        repo: "next.js",
        number: 49258,
        title: "Test",
        author: "leerob",
        createdAt: "2026-08-01T00:00:00Z",
      },
      overview: {
        title: "Test",
        summary: "Summary",
        totalDuration: 20,
        stats: { additions: 10, deletions: 0, filesChanged: 1, commits: 0 },
      },
      scenes: [
        {
          id: "scene-bad-code",
          type: "code_changes",
          title: "Hallucinated File Scene",
          duration: 10,
          filePath: "packages/next/src/non-existent-hallucinated-file.ts", // Does not exist in PR
          language: "typescript",
          codeSnippet: "const bad = true;",
          explanation: "Does not exist",
          snippets: [{ after: "const bad = true;", startLine: 1, endLine: 1 }],
          claims: [],
        },
      ],
      evidence: [],
      createdAt: "2026-08-01T00:00:00Z",
    };

    const result = validatePRMovie(invalidMovie, reviewModel);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("references hallucinated file"))).toBe(true);
  });
});
