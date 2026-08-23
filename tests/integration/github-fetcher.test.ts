import { describe, it, expect, vi } from "vitest";
import { fetchPRData } from "@/lib/github/fetcher";
import { handleGitHubError } from "@/lib/github/errors";
import { RequestError } from "octokit";
import type { Octokit } from "octokit";

describe("GitHub Fetcher & Error Boundary - Integration & Resilience", () => {
  describe("fetchPRData with Pagination & Edge Cases", () => {
    it("successfully aggregates PR metadata, multi-page files, and commits", async () => {
      const mockOctokit = {
        rest: {
          pulls: {
            get: vi.fn().mockResolvedValue({
              data: {
                number: 42,
                title: "Feat: Add streaming LLM response",
                body: "Implements event-stream responses for presentation generation.",
                user: { login: "octocat", avatar_url: "https://github.com/octocat.png" },
                html_url: "https://github.com/octo-org/stream-app/pull/42",
                base: { ref: "main", repo: { default_branch: "main", html_url: "https://github.com/octo-org/stream-app" } },
                head: { ref: "feat/streaming", sha: "head-sha-123" },
                additions: 150,
                deletions: 20,
                changed_files: 2,
                created_at: "2026-08-10T12:00:00Z",
                updated_at: "2026-08-10T14:00:00Z",
                labels: [{ name: "feature" }, "backend"],
                milestone: { title: "v2.0" },
              },
            }),
            listFiles: vi.fn().mockResolvedValue({
              data: [
                {
                  filename: "src/stream.ts",
                  status: "added",
                  additions: 100,
                  deletions: 0,
                  patch: "@@ -0,0 +1,10 @@\n+export function stream() {}",
                },
                {
                  filename: "src/old-stream.ts",
                  status: "removed",
                  additions: 0,
                  deletions: 50,
                  patch: "@@ -1,10 +0,0 @@\n-function old() {}",
                },
              ],
            }),
            listCommits: vi.fn().mockResolvedValue({
              data: [
                {
                  sha: "c1",
                  commit: { message: "initial streaming commit", author: { name: "Octo", date: "2026-08-10T12:00:00Z" } },
                },
              ],
            }),
          },
        },
      } as unknown as Octokit;

      const result = await fetchPRData(mockOctokit, "octo-org", "stream-app", 42);

      expect(result.pullRequest.number).toBe(42);
      expect(result.pullRequest.labels).toEqual(["feature", "backend"]);
      expect(result.pullRequest.milestone).toBe("v2.0");
      expect(result.files).toHaveLength(2);
      expect(result.files[0].status).toBe("added");
      expect(result.files[1].status).toBe("deleted");
      expect(result.fetchMetadata?.isComplete).toBe(true);
      expect(result.fetchMetadata?.warnings).toHaveLength(0);
    });

    it("handles partial pagination failure gracefully by capturing partial data and emitting warnings", async () => {
      const mockOctokit = {
        rest: {
          pulls: {
            get: vi.fn().mockResolvedValue({
              data: {
                number: 99,
                title: "Partial PR",
                body: "PR that fails during pagination",
                user: { login: "dev" },
                base: { ref: "main" },
                head: { ref: "patch-1", sha: "sha99" },
                changed_files: 200,
              },
            }),
            listFiles: vi.fn().mockRejectedValue(new Error("GitHub API rate limit exceeded midway")),
            listCommits: vi.fn().mockResolvedValue({ data: [] }),
          },
        },
      } as unknown as Octokit;

      const result = await fetchPRData(mockOctokit, "octo-org", "stream-app", 99);

      expect(result.pullRequest.number).toBe(99);
      expect(result.files).toHaveLength(0);
      expect(result.fetchMetadata?.isComplete).toBe(false);
      expect(result.fetchMetadata?.warnings.length).toBeGreaterThan(0);
      expect(result.fetchMetadata?.warnings[0]).toContain("File pagination failed at page 1");
    });
  });

  describe("handleGitHubError Normalization", () => {
    it("maps 404 RequestError to NOT_FOUND", () => {
      const err = new RequestError("Not Found", 404, {
        request: { method: "GET", url: "https://api.github.com", headers: {} },
      });
      const handled = handleGitHubError(err);
      expect(handled.code).toBe("NOT_FOUND");
    });

    it("maps 401 RequestError to UNAUTHORIZED", () => {
      const err = new RequestError("Bad Credentials", 401, {
        request: { method: "GET", url: "https://api.github.com", headers: {} },
      });
      const handled = handleGitHubError(err);
      expect(handled.code).toBe("UNAUTHORIZED");
    });

    it("maps 403 / 429 rate limits and extracts retryAfter header", () => {
      const err = new RequestError("Rate Limited", 429, {
        request: { method: "GET", url: "https://api.github.com", headers: {} },
        response: {
          status: 429,
          url: "https://api.github.com",
          data: {},
          headers: { "retry-after": "120" },
        },
      });
      const handled = handleGitHubError(err);
      expect(handled.code).toBe("RATE_LIMITED");
      expect(handled.retryAfterSeconds).toBe(120);
    });

    it("maps network TypeError and DOMException timeout", () => {
      const netErr = new TypeError("Failed to fetch");
      expect(handleGitHubError(netErr).code).toBe("NETWORK_ERROR");

      const timeoutErr = new DOMException("The operation was aborted", "TimeoutError");
      expect(handleGitHubError(timeoutErr).code).toBe("TIMEOUT");
    });
  });
});
