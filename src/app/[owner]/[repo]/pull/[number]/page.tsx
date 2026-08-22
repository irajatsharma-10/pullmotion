import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findMovieByPR, saveMovie } from "@/lib/db/movies";
import { createGitHubClient } from "@/lib/github/client";
import { fetchPRData } from "@/lib/github/fetcher";
import { computeSourceHash } from "@/lib/movie/source-hash";
import { selectContext } from "@/lib/analysis/context-selector";
import { LLMStoryPlanner } from "@/lib/ai/planner";
import { StudioWorkspace } from "@/components/studio/StudioWorkspace";
import { SHOWCASE_EXAMPLES } from "@/lib/movie/fixture";
import { handleGitHubError } from "@/lib/github/errors";
import { AlertCircle, Film, ArrowLeft, Play, Layers } from "lucide-react";
import type { Metadata } from "next";
import { buildPRReviewModel } from "@/lib/analysis/review-model-builder";
import { createMoviePlan } from "@/lib/analysis/movie-planner";

interface PRMoviePageProps {
  params: Promise<{
    owner: string;
    repo: string;
    number: string;
  }>;
}

export async function generateMetadata({ params }: PRMoviePageProps): Promise<Metadata> {
  const { owner, repo, number } = await params;
  const showcaseKey = `${owner}/${repo}/${number}`;
  const showcase = SHOWCASE_EXAMPLES[showcaseKey];
  const title = showcase
    ? `${showcase.overview.title} — ${owner}/${repo} #${number}`
    : `PR #${number}: ${owner}/${repo} Review & Flow Storyboard`;
  const description = showcase
    ? showcase.overview.summary
    : `Explore animated architecture flow, code diff excerpts, and 100% verified evidence for ${owner}/${repo} PR #${number}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PRMoviePage({ params }: PRMoviePageProps) {
  const { owner, repo, number } = await params;
  const pullNumber = parseInt(number, 10);

  if (isNaN(pullNumber) || pullNumber <= 0) {
    notFound();
  }

  const showcaseKey = `${owner}/${repo}/${pullNumber}`;
  if (SHOWCASE_EXAMPLES[showcaseKey]) {
    return <StudioWorkspace initialMovie={SHOWCASE_EXAMPLES[showcaseKey]} />;
  }

  let movie = await findMovieByPR(owner, repo, pullNumber);

  if (!movie) {
    try {
      const octokit = createGitHubClient();
      const prData = await fetchPRData(octokit, owner, repo, pullNumber);
      const sourceHash = computeSourceHash(prData);

      const context = await selectContext(
        octokit,
        owner,
        repo,
        prData.pullRequest.headSha,
        prData.files
      );

      const reviewModel = buildPRReviewModel(prData, context.keyFiles);
      const plan = createMoviePlan(prData, reviewModel.analysis);

      const movieId = `mov_${sourceHash.slice(7, 19)}`;
      const planner = new LLMStoryPlanner();

      movie = await planner.generateMovie({
        reviewModel,
        plan,
        context,
        movieId,
        sourceHash,
      });

      await saveMovie(movie);
    } catch (rawError: unknown) {
      console.error(`[PRMoviePage] Failed to fetch or generate movie for ${owner}/${repo} #${pullNumber}:`, rawError);
      const ghError = handleGitHubError(rawError);

      let userFacingMessage = "Unable to generate PR movie at this time. Please try again later or explore our verified showcase movies below.";
      if (ghError.code === "NOT_FOUND") {
        userFacingMessage = `Pull request #${pullNumber} was not found in ${owner}/${repo}. Please verify the URL and ensure the repository is public.`;
      } else if (ghError.code === "RATE_LIMITED") {
        userFacingMessage = "GitHub API rate limit reached. Please retry in a few moments or view our pre-rendered demos.";
      }

      return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative w-full max-w-lg bg-[#0d111a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
              Could Not Generate Movie
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              {userFacingMessage}
            </p>

            {ghError.code === "RATE_LIMITED" && (
              <div className="w-full text-left p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-6">
                <strong>GitHub Rate Limit:</strong> Unauthenticated API requests are limited. You can explore our pre-rendered showcase movies below or try again later.
              </div>
            )}

            <div className="w-full text-left mb-6">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Explore Verified Showcase Movies:</span>
              </div>
              <div className="space-y-2">
                <Link
                  href="/vercel/next.js/pull/49258"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-purple-600/15 border border-white/5 hover:border-purple-500/30 text-xs transition-all group"
                >
                  <div>
                    <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                      Next.js #49258
                    </div>
                    <div className="text-[11px] text-slate-400">Add Redis caching layer to reduce DB load</div>
                  </div>
                  <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
                </Link>

                <Link
                  href="/facebook/react/pull/28000"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-purple-600/15 border border-white/5 hover:border-purple-500/30 text-xs transition-all group"
                >
                  <div>
                    <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                      React #28000
                    </div>
                    <div className="text-[11px] text-slate-400">React 19 Server Action Dispatcher</div>
                  </div>
                  <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </Link>
              <Link
                href="/create"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs text-white font-bold shadow-lg shadow-purple-600/25 transition-all"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Open Studio</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return <StudioWorkspace initialMovie={movie} />;
}
