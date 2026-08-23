import { describe, it, expect } from "vitest";
import { parseGitHubPRUrl } from "@/lib/movie/url-parser";

describe("parseGitHubPRUrl", () => {
  it("parses valid full HTTPS GitHub PR URLs", () => {
    const result = parseGitHubPRUrl("https://github.com/facebook/react/pull/12345");
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.owner).toBe("facebook");
      expect(result.repo).toBe("react");
      expect(result.pullNumber).toBe(12345);
      expect(result.canonicalUrl).toBe("https://github.com/facebook/react/pull/12345");
    }
  });

  it("handles URLs with trailing query params, hashes, and slashes", () => {
    const result = parseGitHubPRUrl("https://github.com/vercel/next.js/pull/9999/files?diff=unified#diff-123");
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.owner).toBe("vercel");
      expect(result.repo).toBe("next.js");
      expect(result.pullNumber).toBe(9999);
      expect(result.canonicalUrl).toBe("https://github.com/vercel/next.js/pull/9999");
    }
  });

  it("parses URLs without protocol or with whitespace", () => {
    const result = parseGitHubPRUrl("  github.com/tailwindlabs/tailwindcss/pull/42  ");
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.owner).toBe("tailwindlabs");
      expect(result.repo).toBe("tailwindcss");
      expect(result.pullNumber).toBe(42);
    }
  });

  it("rejects non-PR URLs or malformed URLs", () => {
    expect(parseGitHubPRUrl("https://github.com/facebook/react").isValid).toBe(false);
    expect(parseGitHubPRUrl("https://github.com/facebook/react/issues/10").isValid).toBe(false);
    expect(parseGitHubPRUrl("https://gitlab.com/owner/repo/pull/12").isValid).toBe(false);
    expect(parseGitHubPRUrl("not-a-url").isValid).toBe(false);
    expect(parseGitHubPRUrl("").isValid).toBe(false);
  });
});
