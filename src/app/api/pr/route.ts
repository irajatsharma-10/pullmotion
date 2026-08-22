import { NextResponse } from "next/server";
import { parseGitHubPRUrl } from "@/lib/movie/url-parser";
import { createGitHubClient } from "@/lib/github/client";
import { fetchPRData } from "@/lib/github/fetcher";
import { handleGitHubError } from "@/lib/github/errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit/rate-limiter";
import { getCachedPRData, setCachedPRData } from "@/lib/cache/pr-cache";

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`pr_fetch:${ip}`, 40, 600);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: `Too many PR fetch requests. Please retry in ${rateLimit.reset} seconds.`,
            retryAfterSeconds: rateLimit.reset,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.reset),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          },
        }
      );
    }

    const body = await request.json();
    const { url } = body;

    const parseResult = parseGitHubPRUrl(url);
    if (!parseResult.isValid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_URL", message: parseResult.error } },
        { status: 400 }
      );
    }

    const { owner, repo, pullNumber } = parseResult;

    // 2. Check PR cache
    const cachedData = await getCachedPRData(owner, repo, pullNumber);
    if (cachedData) {
      return NextResponse.json({ success: true, data: cachedData, cached: true });
    }

    // 3. Fetch from GitHub
    const octokit = createGitHubClient();
    const prData = await fetchPRData(octokit, owner, repo, pullNumber);

    // 4. Save to PR cache
    await setCachedPRData(owner, repo, pullNumber, prData, prData.pullRequest.headSha);

    return NextResponse.json({ success: true, data: prData, cached: false });
  } catch (error) {
    console.error("[API /api/pr] Failed to fetch PR data:", error);
    const ghError = handleGitHubError(error);
    const status = ghError.code === "NOT_FOUND" ? 404 : ghError.code === "RATE_LIMITED" ? 429 : 500;
    return NextResponse.json({ success: false, error: ghError }, { status });
  }
}
