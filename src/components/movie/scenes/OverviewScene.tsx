"use client";

import React from "react";
import { motion } from "motion/react";
import { GitPullRequest, User, Sparkles, ShieldCheck } from "lucide-react";
import type { SceneComponentProps } from "./types";
import type { OverviewSceneData } from "@/types/scenes";

export function OverviewScene({ scene }: SceneComponentProps<OverviewSceneData>) {
  const stats = scene.stats || {
    additions: 0,
    deletions: 0,
    filesChanged: 0,
    commits: 0,
  };

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 p-2 sm:p-4 flex flex-col">
      <div className="my-auto w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-2 sm:gap-2.5 select-none py-1">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 mb-1 flex-wrap justify-center"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" />
            <span>Review Stage 1 • PR Overview</span>
          </span>

          {scene.contractVerdict && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>{scene.contractVerdict}</span>
            </span>
          )}

          {scene.author && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] sm:text-xs font-mono">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>@{scene.author}</span>
            </span>
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-snug max-w-3xl"
        >
          {scene.title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-xs sm:text-sm text-slate-200 w-full max-w-3xl mx-auto leading-relaxed bg-[#0b0e17]/90 border border-white/10 p-3.5 sm:p-4 rounded-2xl shadow-xl backdrop-blur-md text-left"
        >
          <div className="flex items-center gap-1.5 mb-1.5 font-bold text-indigo-300 text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 inline" />
            <span>What This PR Does</span>
          </div>
          <p className="text-slate-100 text-xs sm:text-sm leading-relaxed">{scene.summary}</p>

          {(scene.architecturalImpact || scene.testingRealityVerdict) && (
            <div className="mt-2.5 pt-2.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {scene.architecturalImpact && (
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.08]">
                  <span className="text-sky-400 font-bold block mb-0.5 uppercase tracking-wider text-[10px] font-mono">
                    What It Changes:
                  </span>
                  <span className="text-slate-200 leading-snug text-xs">{scene.architecturalImpact}</span>
                </div>
              )}
              {scene.testingRealityVerdict && (
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.08]">
                  <span className="text-emerald-400 font-bold block mb-0.5 uppercase tracking-wider text-[10px] font-mono">
                    How It&apos;s Tested:
                  </span>
                  <span className="text-slate-200 leading-snug text-xs">{scene.testingRealityVerdict}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-[#0b0e17]/90 border border-white/10 backdrop-blur-xl w-full max-w-3xl shadow-2xl"
        >
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/30 border border-white/5">
            <span className="text-emerald-400 font-mono text-base sm:text-lg md:text-xl font-black">
              +{stats.additions.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
              Additions
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/30 border border-white/5">
            <span className="text-rose-400 font-mono text-base sm:text-lg md:text-xl font-black">
              -{stats.deletions.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
              Deletions
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/30 border border-white/5">
            <span className="text-sky-400 font-mono text-base sm:text-lg md:text-xl font-black">
              {stats.filesChanged}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
              Files Touched
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/30 border border-white/5">
            <span className="text-amber-400 font-mono text-base sm:text-lg md:text-xl font-black">
              {stats.commits}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
              Commits
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
