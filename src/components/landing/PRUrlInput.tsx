"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { parseGitHubPRUrl } from "@/lib/movie/url-parser";
import { Play, AlertCircle, Compass, Clipboard, Check, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { GenerationProgressModal } from "./GenerationProgressModal";
import { SHOWCASE_EXAMPLES } from "@/lib/movie/fixture";

interface PRUrlInputProps {
  initialValue?: string;
  size?: "default" | "large";
  autoFocus?: boolean;
}

export function PRUrlInput({ initialValue = "", size = "large", autoFocus = false }: PRUrlInputProps) {
  const router = useRouter();
  const [url, setUrl] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [activeModalData, setActiveModalData] = useState<{
    isOpen: boolean;
    prUrl: string;
    owner: string;
    repo: string;
    pullNumber: number;
  } | null>(null);

  const samplePRs = [
    {
      label: "Next.js #49258",
      title: "Redis Caching Layer",
      url: "https://github.com/vercel/next.js/pull/49258",
      tag: "Cache Architecture",
    },
    {
      label: "React #28000",
      title: "React 19 Server Actions",
      url: "https://github.com/facebook/react/pull/28000",
      tag: "Runtime Dispatcher",
    },
    {
      label: "Tailwind #12890",
      title: "Rust Oxide Engine v4",
      url: "https://github.com/tailwindlabs/tailwindcss/pull/12890",
      tag: "Compiler Engine",
    },
  ];

  const handleTriggerGeneration = (targetUrl: string) => {
    setError(null);
    const parseResult = parseGitHubPRUrl(targetUrl);

    if (!parseResult.isValid) {
      setError(parseResult.error || "Please enter a valid GitHub pull request URL");
      toast.error(parseResult.error || "Please enter a valid GitHub pull request URL");
      return;
    }

    const { owner, repo, pullNumber } = parseResult;
    const showcaseKey = `${owner}/${repo}/${pullNumber}`;

    if (SHOWCASE_EXAMPLES[showcaseKey]) {
      toast.success(`Loading showcase movie: ${owner}/${repo} #${pullNumber}`);
      router.push(`/${owner}/${repo}/pull/${pullNumber}`);
      return;
    }

    toast.info(`Analyzing PR ${owner}/${repo} #${pullNumber}...`);
    setActiveModalData({
      isOpen: true,
      prUrl: targetUrl,
      owner,
      repo,
      pullNumber,
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setError("Please enter or paste a GitHub pull request URL");
      toast.error("Please enter a GitHub pull request URL");
      return;
    }
    handleTriggerGeneration(url.trim());
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (!trimmed) {
        toast.error("Clipboard is empty");
        return;
      }

      const parseResult = parseGitHubPRUrl(trimmed);
      if (parseResult.isValid) {
        setUrl(trimmed);
        setError(null);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast.success(`Valid PR detected: ${parseResult.owner}/${parseResult.repo} #${parseResult.pullNumber}`);
        handleTriggerGeneration(trimmed);
      } else {
        setUrl(trimmed);
        setError(parseResult.error || "Clipboard content is not a valid GitHub PR URL");
        toast.error("Clipboard content is not a valid GitHub PR URL");
      }
    } catch {
      toast.error("Please allow clipboard permissions or paste directly with ⌘V / Ctrl+V");
    }
  };

  const handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text").trim();
    const parseResult = parseGitHubPRUrl(pastedText);
    if (parseResult.isValid) {
      setUrl(pastedText);
      setError(null);
      toast.success(`Valid PR detected: ${parseResult.owner}/${parseResult.repo} #${parseResult.pullNumber}`);
      setTimeout(() => handleTriggerGeneration(pastedText), 100);
    }
  };

  const handleSelectSample = (sample: (typeof samplePRs)[0]) => {
    setUrl(sample.url);
    setError(null);
    handleTriggerGeneration(sample.url);
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
        <form onSubmit={handleSubmit} className="w-full relative flex items-center group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 rounded-2xl blur-lg opacity-30 group-focus-within:opacity-70 transition duration-500" />

          <div className="relative w-full flex items-center bg-white/95 dark:bg-[#0c0f17]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/15 focus-within:border-purple-500 rounded-2xl shadow-2xl p-1.5 transition-all">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              title="Paste from clipboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all border border-slate-200 dark:border-white/5 shrink-0 active:scale-95 cursor-pointer ml-1"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Pasted</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5 text-purple-400" />
                  <span>Paste</span>
                </>
              )}
            </button>

            <div className="relative flex-1 flex items-center">
              <input
                id="github-pr-url"
                name="github-pr-url"
                type="url"
                aria-label="GitHub Pull Request URL"
                autoComplete="off"
                autoFocus={autoFocus}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                onPaste={handlePasteEvent}
                placeholder="https://github.com/facebook/react/pull/28000"
                className={`w-full bg-transparent px-3.5 ${
                  size === "large" ? "py-3 text-xs sm:text-sm" : "py-2 text-xs"
                } text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-mono`}
              />

              {url && (
                <button
                  type="button"
                  onClick={() => {
                    setUrl("");
                    setError(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 mr-2 transition-colors cursor-pointer"
                  aria-label="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!url.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              <span>Watch Movie</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </form>

        {error && (
          <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 text-xs mt-3 bg-rose-500/10 border border-rose-500/25 px-3.5 py-1.5 rounded-xl animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4 text-xs text-slate-600 dark:text-slate-400 flex-wrap justify-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Instant Demos:</span>
          </span>
          {samplePRs.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white border border-slate-200 dark:border-white/10 text-[11px] transition-all cursor-pointer shadow-sm hover:border-purple-500/30"
            >
              <span className="font-mono font-semibold">{sample.label}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 hidden sm:inline">
                • {sample.tag}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>

      {activeModalData && (
        <GenerationProgressModal
          isOpen={activeModalData.isOpen}
          prUrl={activeModalData.prUrl}
          owner={activeModalData.owner}
          repo={activeModalData.repo}
          pullNumber={activeModalData.pullNumber}
          onClose={() => setActiveModalData(null)}
        />
      )}
    </>
  );
}
