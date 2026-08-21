/**
 * @file errors.ts
 * @description Standardized error normalization and result envelopes for GitHub API operations.
 */

import { RequestError } from "octokit";


/** Domain error codes for GitHub client interactions */
export type GitHubClientErrorCode =
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNAUTHORIZED"
  | "INVALID_PR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "PARTIAL_DATA"
  | "UNKNOWN";

export type GitHubClientError = {
  code: GitHubClientErrorCode;
  message: string;
  retryAfterSeconds?: number;
};


/**
 * Structured result wrapper for GitHub data fetches.
 * Allows downstream code to distinguish complete vs partial results
 * and propagate non-fatal warnings (e.g., pagination limits reached).
 */
export type GitHubFetchResult<T> = {
  data: T;
  warnings: string[];
  isComplete: boolean;
};

export function handleGitHubError(error: unknown): GitHubClientError {
  // Timeout: AbortSignal.timeout() throws a DOMException with name "TimeoutError"
  // or an AbortError in some environments
  if (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  ) {
    return {
      code: "TIMEOUT",
      message: "GitHub API request timed out. The server may be slow or unreachable. Please try again.",
    };
  }

  // Network error: fetch() throws TypeError on network failure
  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
    return {
      code: "NETWORK_ERROR",
      message: "Network error while connecting to GitHub. Please check your internet connection and try again.",
    };
  }

  if (error instanceof RequestError) {
    if (error.status === 404) {
      return {
        code: "NOT_FOUND",
        message: "The repository or pull request was not found. Please verify the URL and ensure the repository is public.",
      };
    }
    if (error.status === 401) {
      return {
        code: "UNAUTHORIZED",
        message: "GitHub token is invalid or expired.",
      };
    }
    if (error.status === 403 || error.status === 429) {
      const retryAfter = error.response?.headers["retry-after"];
      const resetTime = error.response?.headers["x-ratelimit-reset"];

      let waitSeconds = 60;
      if (retryAfter && typeof retryAfter === "string") {
        waitSeconds = parseInt(retryAfter, 10);
      } else if (resetTime && typeof resetTime === "string") {
        waitSeconds = Math.max(0, parseInt(resetTime, 10) - Math.floor(Date.now() / 1000));
      }

      return {
        code: "RATE_LIMITED",
        message: `GitHub API rate limit reached. Please retry in ${waitSeconds} seconds.`,
        retryAfterSeconds: waitSeconds,
      };
    }
  }

  return {
    code: "UNKNOWN",
    message: "An unexpected error occurred while accessing GitHub. Please try again later.",
  };
}

