"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Film,
  Workflow,
  Compass,
  GitPullRequest,
  FileCode2,
  Layers,
  RefreshCw,
  X,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface GenerationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  prUrl: string;
  owner: string;
  repo: string;
  pullNumber: number;
  onSuccess?: () => void;
}

interface Step {
  id: number;
  label: string;
  detail: string;
  icon: React.ElementType;
}

const GENERATION_STEPS: Step[] = [
  {
    id: 1,
    label: "Validating PR & Permissions",
    detail: "Checking repository access and PR status on GitHub...",
    icon: GitPullRequest,
  },
  {
    id: 2,
    label: "Ingesting Commits & Diffs",
    detail: "Fetching file patches, additions, deletions, and metadata...",
    icon: FileCode2,
  },
  {
    id: 3,
    label: "Ranking Context & AST Structure",
    detail: "Identifying critical code paths, imports, and architectural nodes...",
    icon: Layers,
  },
  {
    id: 4,
    label: "Synthesizing 6-Scene Storyboard",
    detail: "Composing Before/After flow, diff highlights, and evidence citations...",
    icon: Workflow,
  },
  {
    id: 5,
    label: "Finalizing Cinematic Player",
    detail: "Persisting sourceHash record and preparing player timeline...",
    icon: Film,
  },
];

export function GenerationProgressModal({
  isOpen,
  onClose,
  prUrl,
  owner,
  repo,
  pullNumber,
  onSuccess,
}: GenerationProgressModalProps) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(10);
  const [error, setError] = useState<{ code?: string; message: string; details?: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    const timer1 = setTimeout(() => {
      if (isMounted) {
        setCurrentStepIndex((prev) => (prev < 1 ? 1 : prev));
        setProgress((prev) => (prev < 35 ? 35 : prev));
      }
    }, 1200);

    const timer2 = setTimeout(() => {
      if (isMounted) {
        setCurrentStepIndex((prev) => (prev < 2 ? 2 : prev));
        setProgress((prev) => (prev < 65 ? 65 : prev));
      }
    }, 2800);

    const timer3 = setTimeout(() => {
      if (isMounted) {
        setCurrentStepIndex((prev) => (prev < 3 ? 3 : prev));
        setProgress((prev) => (prev < 85 ? 85 : prev));
      }
    }, 4500);

    async function runGeneration() {
      try {
        const response = await fetch("/api/movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: prUrl }),
        });

        const data = await response.json();

        if (!isMounted) return;

        if (!response.ok || !data.success) {
          const errData = data.error || {};
          let msg = "Unable to generate PR Movie at this time.";
          let detail = "Please try again later or explore our verified demo movies below.";

          if (errData.code === "NOT_FOUND") {
            msg = `Pull request #${pullNumber} in ${owner}/${repo} was not found.`;
            detail = "Please ensure the repository is public and the PR number is correct.";
          } else if (errData.code === "RATE_LIMITED") {
            msg = "GitHub API rate limit reached.";
            detail = "GitHub limits unauthenticated requests. You can explore verified demo movies below or try again in a few moments.";
          } else if (errData.code === "INVALID_URL") {
            msg = "Invalid GitHub PR URL provided.";
            detail = "Format must be: https://github.com/owner/repo/pull/123";
          } else if (errData.message && !errData.message.includes("{") && !errData.message.includes("v1beta") && !errData.message.includes("ModelService")) {
            msg = errData.message;
          }

          setError({
            code: errData.code,
            message: msg,
            details: detail,
          });
          return;
        }

        setCurrentStepIndex(4);
        setProgress(100);
        setIsFinished(true);

        if (onSuccess) onSuccess();

        setTimeout(() => {
          if (isMounted) {
            router.push(`/${owner}/${repo}/pull/${pullNumber}`);
          }
        }, 800);
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error("Movie generation failed:", err);
        setError({
          message: "Network connection error while connecting to generation engine.",
          details: "Please verify your internet connection and try again.",
        });
      }
    }

    runGeneration();

    return () => {
      isMounted = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen, prUrl, owner, repo, pullNumber, router, onSuccess]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#0c0f17] border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col p-6"
        >
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          {(error || isFinished) && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {error ? "Generation Interrupted" : isFinished ? "Movie Ready!" : "Generating PR Movie Story"}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-purple-300">
                  {owner}/{repo}#{pullNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {error
                  ? "We encountered an issue analyzing this pull request"
                  : isFinished
                  ? "Launching cinematic storyboard workspace..."
                  : "Synthesizing evidence-backed 6-scene explanation"}
              </p>
            </div>
          </div>

          {error ? (
            <div className="my-3 space-y-4">
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-rose-300 mb-1">{error.message}</div>
                  {error.details && <div className="text-slate-400 leading-relaxed">{error.details}</div>}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <div className="text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  <span>Try Verified Instant Demos:</span>
                </div>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/vercel/next.js/pull/49258");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-black/40 hover:bg-purple-600/20 hover:border-purple-500/30 border border-white/5 flex items-center justify-between text-slate-300 hover:text-white transition-all cursor-pointer font-mono text-[11px]"
                  >
                    <span>vercel/next.js #49258 (Redis Caching Layer)</span>
                    <Play className="w-3 h-3 fill-current text-purple-400" />
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/facebook/react/pull/28000");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-black/40 hover:bg-purple-600/20 hover:border-purple-500/30 border border-white/5 flex items-center justify-between text-slate-300 hover:text-white transition-all cursor-pointer font-mono text-[11px]"
                  >
                    <span>facebook/react #28000 (React 19 Server Actions)</span>
                    <Play className="w-3 h-3 fill-current text-purple-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setCurrentStepIndex(0);
                    setProgress(10);
                    router.refresh();
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs text-white font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="my-3 space-y-4">
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              <div className="space-y-2.5">
                {GENERATION_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx < currentStepIndex || isFinished;
                  const isCurrent = idx === currentStepIndex && !isFinished;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                        isCurrent
                          ? "bg-purple-500/10 border-purple-500/30 text-white"
                          : isDone
                          ? "bg-white/5 border-white/5 text-slate-300"
                          : "border-transparent text-slate-600 opacity-60"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        ) : (
                          <Icon className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{step.label}</span>
                          {isCurrent && (
                            <span className="text-[10px] text-purple-400 font-mono animate-pulse">Running</span>
                          )}
                        </div>
                        {isCurrent && (
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{step.detail}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Deterministic Evidence Extraction</span>
                <span>{progress}% complete</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
