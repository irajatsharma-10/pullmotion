import { NextResponse } from "next/server";
import { parseGitHubPRUrl } from "@/lib/movie/url-parser";
import { createGitHubClient } from "@/lib/github/client";
import { fetchPRData } from "@/lib/github/fetcher";
import { computeSourceHash } from "@/lib/movie/source-hash";
import { selectContext } from "@/lib/analysis/context-selector";
import { buildPRReviewModel } from "@/lib/analysis/review-model-builder";
import { createMoviePlan } from "@/lib/analysis/movie-planner";
import { LLMStoryPlanner } from "@/lib/ai/planner";
import { findMovieBySourceHash, saveMovie } from "@/lib/db/movies";
import { handleGitHubError } from "@/lib/github/errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit/rate-limiter";
import { getCachedPRData, setCachedPRData } from "@/lib/cache/pr-cache";
import { ensureUniqueSceneIds } from "@/lib/movie/scene-utils";

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check (15 generations per 10 minutes per IP)
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`movie_gen:${ip}`, 15, 600);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: `Rate limit reached. Please wait ${rateLimit.reset} seconds before generating more movies.`,
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
    const { url, apiKey, modelName, forceRegenerate } = body;

    const parseResult = parseGitHubPRUrl(url);
    if (!parseResult.isValid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_URL", message: parseResult.error } },
        { status: 400 }
      );
    }

    const { owner, repo, pullNumber } = parseResult;
    const octokit = createGitHubClient();

    // 2. Check PR cache or fetch from GitHub
    let prData = await getCachedPRData(owner, repo, pullNumber);
    if (!prData) {
      prData = await fetchPRData(octokit, owner, repo, pullNumber);
      await setCachedPRData(owner, repo, pullNumber, prData, prData.pullRequest.headSha);
    }

    // 3. Compute Deterministic Source Hash
    const sourceHash = computeSourceHash(prData);

    // 4. Check Database Persistence Cache (unless forceRegenerate is true)
    if (!forceRegenerate) {
      const existingMovie = await findMovieBySourceHash(sourceHash);
      if (existingMovie) {
        return NextResponse.json({ success: true, cached: true, movie: ensureUniqueSceneIds(existingMovie) });
      }
    }

    // 5. Extract Intelligent Context (All files summary, top patches, HEAD contents)
    const context = await selectContext(
      octokit,
      owner,
      repo,
      prData.pullRequest.headSha,
      prData.files
    );

    // 6. Build Canonical PRReviewModel (AST semantics, dependency graph, diffs, priority, risks, test validation)
    const reviewModel = buildPRReviewModel(prData, context.keyFiles);

    // 7. Dynamic Movie Plan Construction
    const plan = createMoviePlan(prData, reviewModel.analysis);

    // 8. Generate Movie via LLM Planner grounded on canonical PRReviewModel
    const movieId = `mov_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const planner = new LLMStoryPlanner(apiKey, modelName);

    const generatedMovie = await planner.generateMovie({
      reviewModel,
      plan,
      context,
      movieId,
      sourceHash,
    });

    const movie = ensureUniqueSceneIds(generatedMovie);

    // 9. Save to Database
    await saveMovie(movie);

    return NextResponse.json({ success: true, cached: false, movie });
  } catch (error) {
    console.error("[API /api/movies] Movie generation encountered an internal error:", error);

    // If it's a known GitHub RequestError (e.g. 404 repo not found or 429 GitHub rate limit)
    const ghError = handleGitHubError(error);
    if (ghError.code === "NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "The repository or pull request was not found. Please verify the URL and ensure the repository is public.",
          },
        },
        { status: 404 }
      );
    }

    if (ghError.code === "RATE_LIMITED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: ghError.message || "GitHub API rate limit reached. Please retry in a few moments.",
            retryAfterSeconds: ghError.retryAfterSeconds,
          },
        },
        { status: 429 }
      );
    }

    // All internal faults (missing .env tokens, upstream LLM errors, DB errors, pipeline errors)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Unable to generate PR movie at this time. Please try again or explore our instant demo movies.",
        },
      },
      { status: 500 }
    );
  }
}
