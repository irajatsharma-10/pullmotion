import { describe, it, expect } from "vitest";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit/rate-limiter";
import { computeSourceHash } from "@/lib/movie/source-hash";
import type { PRData } from "@/types/pr-data";

describe("Rate Limiter & Deterministic Source Hash - Edge Cases", () => {
  describe("getClientIp Header Extraction", () => {
    it("extracts client IP from multi-hop x-forwarded-for header", () => {
      const req = new Request("http://localhost/api/movies", {
        headers: {
          "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
        },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("falls back to x-real-ip when x-forwarded-for is missing", () => {
      const req = new Request("http://localhost/api/movies", {
        headers: {
          "x-real-ip": "198.51.100.1",
        },
      });
      expect(getClientIp(req)).toBe("198.51.100.1");
    });

    it("defaults to 127.0.0.1 when no IP headers are provided", () => {
      const req = new Request("http://localhost/api/movies");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });

  describe("In-Memory Rate Limiting Boundaries", () => {
    it("enforces rate limit bounds accurately and blocks when limit is exceeded", async () => {
      const testId = `test-ip-${Date.now()}`;
      const limit = 3;
      const windowSec = 60;

      const r1 = await checkRateLimit(testId, limit, windowSec);
      expect(r1.success).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = await checkRateLimit(testId, limit, windowSec);
      expect(r2.success).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = await checkRateLimit(testId, limit, windowSec);
      expect(r3.success).toBe(true);
      expect(r3.remaining).toBe(0);

      // 4th request exceeds limit
      const r4 = await checkRateLimit(testId, limit, windowSec);
      expect(r4.success).toBe(false);
      expect(r4.remaining).toBe(0);
    });
  });

  describe("Source Hash Determinism & Order Invariance", () => {
    const basePR: PRData = {
      repository: {
        owner: "facebook",
        name: "react",
        fullName: "facebook/react",
        url: "https://github.com/facebook/react",
      },
      pullRequest: {
        number: 25000,
        title: "Feature X",
        description: "Test description",
        author: "dan",
        url: "https://github.com/facebook/react/pull/25000",
        baseBranch: "main",
        headBranch: "feat-x",
        baseSha: "aaa",
        headSha: "bbb",
        additions: 10,
        deletions: 2,
        changedFiles: 3,
        createdAt: "2026-08-01T00:00:00Z",
        updatedAt: "2026-08-01T00:00:00Z",
        labels: [],
      },
      commits: [],
      files: [
        { path: "packages/react/src/React.js", status: "modified", additions: 5, deletions: 1, patchStatus: "available" },
        { path: "packages/react-dom/src/ReactDOM.js", status: "modified", additions: 3, deletions: 1, patchStatus: "available" },
        { path: "packages/scheduler/src/Scheduler.js", status: "added", additions: 2, deletions: 0, patchStatus: "available" },
      ],
    };

    it("produces identical hash regardless of the order of files array in PR payload", () => {
      const hash1 = computeSourceHash(basePR);

      // Reversed files array
      const shuffledPR: PRData = {
        ...basePR,
        files: [...basePR.files].reverse(),
      };
      const hash2 = computeSourceHash(shuffledPR);

      expect(hash1).toBe(hash2);
      expect(hash1.startsWith("sha256:")).toBe(true);
    });

    it("produces different hash if any file addition/deletion or commit SHA changes", () => {
      const hashOriginal = computeSourceHash(basePR);

      const modifiedPR: PRData = {
        ...basePR,
        files: [
          { ...basePR.files[0], additions: 999 },
          ...basePR.files.slice(1),
        ],
      };
      const hashModified = computeSourceHash(modifiedPR);

      expect(hashOriginal).not.toBe(hashModified);
    });
  });
});
