import { describe, it, expect } from "vitest";
import { validatePRMovie } from "@/lib/analysis/movie-validator";
import { buildPRReviewModel } from "@/lib/analysis/review-model-builder";
import type { PRData } from "@/types/pr-data";
import type { PRMovie } from "@/types/pr-movie";

describe("Movie Validator & Hallucination Firewall - Edge Cases", () => {
  const samplePRData: PRData = {
    repository: {
      owner: "acme",
      name: "payment-api",
      fullName: "acme/payment-api",
      url: "https://github.com/acme/payment-api",
    },
    pullRequest: {
      number: 101,
      title: "Optimize Stripe webhook handler",
      description: "Refactors webhook dispatching logic for Stripe events.",
      author: "alice",
      url: "https://github.com/acme/payment-api/pull/101",
      baseBranch: "main",
      headBranch: "perf/stripe",
      baseSha: "111",
      headSha: "222",
      additions: 45,
      deletions: 10,
      changedFiles: 1,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-02T00:00:00Z",
      labels: ["backend"],
    },
    commits: [
      {
        sha: "222",
        message: "Refactor webhook dispatcher",
        author: "alice",
        date: "2026-08-01T00:00:00Z",
      },
    ],
    files: [
      {
        path: "src/webhooks/stripe.ts",
        status: "modified",
        additions: 45,
        deletions: 10,
        patchStatus: "available",
        patch: "@@ -1,5 +1,10 @@\n+export function dispatchWebhook() {}",
      },
    ],
  };

  const reviewModel = buildPRReviewModel(samplePRData);

  const baseValidMovie: PRMovie = {
    version: 1,
    movieId: "mov-base-101",
    sourceHash: "sha256:abc12345",
    pr: {
      url: "https://github.com/acme/payment-api/pull/101",
      owner: "acme",
      repo: "payment-api",
      number: 101,
      title: "Optimize Stripe webhook handler",
      author: "alice",
      createdAt: "2026-08-01T00:00:00Z",
    },
    overview: {
      title: "Optimize Stripe webhook handler",
      summary: "Refactors webhook dispatching logic.",
      totalDuration: 20,
      stats: { additions: 45, deletions: 10, filesChanged: 1, commits: 1 },
    },
    scenes: [
      {
        id: "scene-1",
        type: "overview",
        title: "Overview",
        duration: 5,
        author: "alice",
        stats: { additions: 45, deletions: 10, filesChanged: 1, commits: 1 },
        summary: "Refactors webhook dispatching logic.",
      },
    ],
    evidence: [
      {
        id: "ev-stripe",
        file: "src/webhooks/stripe.ts",
        type: "changed_file",
        githubUrl: "https://github.com/acme/payment-api/pull/101/files#diff-1",
      },
    ],
    createdAt: "2026-08-01T00:00:00Z",
  };

  it("fails validation when a scene references an unindexed evidenceId", () => {
    const invalidMovie: PRMovie = {
      ...baseValidMovie,
      scenes: [
        {
          id: "scene-bad-evidence",
          type: "code_changes",
          title: "Code change",
          duration: 5,
          filePath: "src/webhooks/stripe.ts",
          language: "typescript",
          codeSnippet: "export function dispatchWebhook() {}",
          explanation: "Dispatches events.",
          snippets: [{ after: "export function dispatchWebhook() {}", startLine: 1, endLine: 5 }],
          claims: [],
          evidenceId: "ev-non-existent",
        },
      ],
    };

    const result = validatePRMovie(invalidMovie, reviewModel);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("unindexed evidenceId"))).toBe(true);
  });

  it("fails validation when a FACT claim has no supporting evidence", () => {
    const invalidMovie: PRMovie = {
      ...baseValidMovie,
      scenes: [
        {
          id: "scene-code",
          type: "code_changes",
          title: "Stripe Dispatcher",
          duration: 10,
          filePath: "src/webhooks/stripe.ts",
          language: "typescript",
          codeSnippet: "export function dispatchWebhook() {}",
          explanation: "Dispatches events async.",
          snippets: [{ after: "export function dispatchWebhook() {}", startLine: 1, endLine: 5 }],
          claims: [
            {
              type: "FACT",
              text: "Dispatches events asynchronously without blocking HTTP response",
              evidence: [], // FACT claim must have evidence
            },
          ],
        },
      ],
    };

    const result = validatePRMovie(invalidMovie, reviewModel);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("without supporting evidence"))).toBe(true);
  });

  it("detects and blocks fabricated quantitative performance metrics", () => {
    const hallucinatedMetricMovie: PRMovie = {
      ...baseValidMovie,
      scenes: [
        {
          id: "scene-overview",
          type: "overview",
          title: "Overview",
          duration: 5,
          author: "alice",
          stats: { additions: 45, deletions: 10, filesChanged: 1, commits: 1 },
          summary: "This change reduces latency by 75% across all endpoints.", // 75% not in PR metadata
        },
      ],
    };

    const result = validatePRMovie(hallucinatedMetricMovie, reviewModel);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Unverified performance/metric claim"))).toBe(true);
  });

  it("detects and blocks unevidenced external infrastructure claims (e.g. Kafka/Redis)", () => {
    const unevidencedInfraMovie: PRMovie = {
      ...baseValidMovie,
      scenes: [
        {
          id: "scene-overview",
          type: "overview",
          title: "Overview",
          duration: 5,
          author: "alice",
          stats: { additions: 45, deletions: 10, filesChanged: 1, commits: 1 },
          summary: "Switches messaging pipeline over to Kafka cluster.", // Kafka is not mentioned in PR
        },
      ],
    };

    const result = validatePRMovie(unevidencedInfraMovie, reviewModel);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("unevidenced infrastructure/service \"kafka\""))).toBe(true);
  });

  it("rejects movies with missing required top-level metadata or empty scenes", () => {
    const emptyScenesMovie: PRMovie = {
      ...baseValidMovie,
      scenes: [],
    };

    const result = validatePRMovie(emptyScenesMovie, reviewModel);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Movie must contain at least one scene.");
  });
});
