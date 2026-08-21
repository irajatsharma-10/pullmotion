/**
 * @file client.ts
 * @description Octokit GitHub API client factory with built-in retries, throttling, and timeout controls.
 */

import { Octokit } from "octokit";


/**
 * Creates a configured Octokit client with retry, throttle, and timeout settings.
 *
 * The `octokit` package bundles @octokit/plugin-retry and @octokit/plugin-throttling.
 * This function configures them for production resilience:
 * - Retry: 3 retries on 5xx / network errors with exponential backoff
 * - Throttle: respects GitHub rate limits and secondary rate limits,
 *   retries up to 2 times with the server-provided retry-after delay
 * - Request timeout: 30s per API call
 */
export function createGitHubClient(token?: string): Octokit {

  const authToken = token || process.env.GITHUB_TOKEN;

  return new Octokit({
    auth: authToken,
    userAgent: "prmovie/1.0",
    retry: {
      // Retry on 5xx and network errors up to 3 times
      doNotRetry: [400, 401, 403, 404, 422],
      retries: 3,
    },
    throttle: {
      onRateLimit: (
        retryAfter: number,
        options: { method: string; url: string },
        octokit: Octokit,
        retryCount: number,
      ) => {
        octokit.log.warn(
          `[PR Movie] Rate limit hit for ${options.method} ${options.url} — retry ${retryCount + 1} after ${retryAfter}s`
        );
        // Retry up to 2 times on primary rate limit
        return retryCount < 2;
      },
      onSecondaryRateLimit: (
        retryAfter: number,
        options: { method: string; url: string },
        octokit: Octokit,
        retryCount: number,
      ) => {
        octokit.log.warn(
          `[PR Movie] Secondary rate limit for ${options.method} ${options.url} — retry ${retryCount + 1} after ${retryAfter}s`
        );
        // Retry once on secondary (abuse) rate limit
        return retryCount < 1;
      },
    },
    request: {
      // 30 second timeout per API call
      timeout: 30_000,
    },
  });
}
