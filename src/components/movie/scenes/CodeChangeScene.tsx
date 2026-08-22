"use client";

import React from "react";
import { motion } from "motion/react";
import { FileCode, ShieldCheck, AlertTriangle, Flame, Layers, Code2, ExternalLink } from "lucide-react";
import type { SceneComponentProps } from "./types";
import type { CodeChangeSceneData } from "@/types/scenes";

export function CodeChangeScene({ scene, onSelectEvidence, prUrl }: SceneComponentProps<CodeChangeSceneData>) {
  const lines = (scene.codeSnippet || "").split("\n");
  const priority = scene.reviewerPriority || "MEDIUM";
  const affectedSymbols = scene.affectedSymbols || [];

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 p-2 sm:p-4 flex flex-col">
      <div className="my-auto w-full max-w-4xl mx-auto flex flex-col gap-2 sm:gap-2.5 select-none py-1">
        <div className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  priority === "HIGH"
                    ? "bg-rose-500/25 text-rose-300 border border-rose-500/40"
                    : priority === "MEDIUM"
                    ? "bg-amber-500/25 text-amber-300 border border-amber-500/40"
                    : "bg-slate-700/50 text-slate-300 border border-slate-600/40"
                }`}
              >
                {priority === "HIGH" ? (
                  <Flame className="w-3 h-3 text-rose-400" />
                ) : (
                  <Layers className="w-3 h-3 text-amber-400" />
                )}
                <span>{priority} Priority Review</span>
              </span>

              {scene.changeKind && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    scene.changeKind === "dedicated"
                      ? "bg-indigo-500/25 text-indigo-300 border border-indigo-500/40"
                      : "bg-sky-500/25 text-sky-300 border border-sky-500/40"
                  }`}
                >
                  {scene.changeKind === "dedicated" ? "Key Change" : "Related Changes"}
                </span>
              )}

              {scene.isSecuritySensitive && (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950/40 text-rose-300 border border-rose-600/40 uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>Security Sensitive</span>
                </span>
              )}
            </div>

            {scene.evidenceId && (
              <button
                onClick={() => onSelectEvidence?.(scene.evidenceId!)}
                className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Inspect Code</span>
              </button>
            )}
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug"
          >
            {scene.title || "Key Code Implementation"}
          </motion.h2>

          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 bg-[#0b0e17] px-2.5 py-0.5 rounded-lg border border-white/10">
              <FileCode className="w-3 h-3 text-indigo-400 shrink-0" />
              {scene.filePath ? (
                <a
                  href={
                    prUrl
                      ? `${prUrl}/files#diff-${scene.filePath.replace(/[^a-zA-Z0-9]/g, "-")}`
                      : `https://github.com`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-100 hover:text-indigo-300 transition-colors truncate max-w-[220px] sm:max-w-md font-semibold underline-offset-2 hover:underline flex items-center gap-1"
                  title={`Open ${scene.filePath} on GitHub`}
                >
                  <span>{scene.filePath}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              ) : (
                <span className="text-slate-100 truncate max-w-[220px] sm:max-w-md">{scene.filePath}</span>
              )}
              <span className="text-[9px] uppercase bg-white/10 px-1.5 py-0.5 rounded text-slate-200 font-bold">
                {scene.language}
              </span>
            </div>

            {affectedSymbols.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Symbols:</span>
                {affectedSymbols.slice(0, 3).map((sym, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded"
                  >
                    <Code2 className="w-2.5 h-2.5 inline mr-0.5" />
                    {sym}
                  </span>
                ))}
                {affectedSymbols.length > 3 && (
                  <span className="text-[9px] text-slate-400 font-mono">+{affectedSymbols.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="w-full p-2.5 sm:p-3 rounded-2xl bg-[#0b0e17]/90 border border-white/10 text-slate-200 text-xs leading-relaxed shadow-xl space-y-2 backdrop-blur-md"
        >
          <div>
            <span className="font-bold text-indigo-300 mr-1.5 uppercase text-[10px] font-mono tracking-wider">
              How it works:
            </span>
            <span className="text-slate-100 leading-relaxed text-xs">{scene.explanation}</span>
          </div>

          {(scene.invariantChange || scene.designRationale) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5 border-t border-white/10 text-xs">
              {scene.invariantChange && (
                <div className="bg-black/40 p-2 rounded-xl border border-white/[0.08]">
                  <span className="text-emerald-400 font-bold block mb-0.5 uppercase tracking-wider text-[9px] sm:text-[10px] font-mono">
                    What&apos;s Guaranteed:
                  </span>
                  <span className="text-slate-200 leading-snug text-xs">{scene.invariantChange}</span>
                </div>
              )}
              {scene.designRationale && (
                <div className="bg-black/40 p-2 rounded-xl border border-white/[0.08]">
                  <span className="text-sky-400 font-bold block mb-0.5 uppercase tracking-wider text-[9px] sm:text-[10px] font-mono">
                    Why this approach:
                  </span>
                  <span className="text-slate-200 leading-snug text-xs">{scene.designRationale}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {scene.codeSnippet && lines.length > 0 && lines.some((l) => l.startsWith("+") || l.startsWith("-")) ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full rounded-2xl border border-white/10 bg-[#07090e] p-2.5 sm:p-3 shadow-2xl overflow-hidden font-mono text-xs max-h-[140px] flex flex-col"
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500/80" />
                <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                <span className="ml-1.5 text-[10px] sm:text-[11px] text-slate-300 font-sans font-semibold">
                  Key Code Changes
                </span>
              </div>
              {scene.evidenceId && (
                <button
                  onClick={() => onSelectEvidence?.(scene.evidenceId!)}
                  className="text-[9px] sm:text-[10px] text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 px-2 py-0.5 rounded-lg border border-indigo-500/30 font-sans font-semibold transition-colors cursor-pointer"
                >
                  View Full Diff
                </button>
              )}
            </div>

            <div className="space-y-0.5 overflow-y-auto overflow-x-auto pr-1 flex-1">
              {lines.slice(0, 10).map((line, idx) => {
                const isAdd = line.startsWith("+");
                const isRem = line.startsWith("-");
                return (
                  <div
                    key={idx}
                    className={`px-1.5 py-0.5 rounded flex items-center gap-2 min-w-max ${
                      isAdd
                        ? "bg-emerald-500/20 text-emerald-300 font-semibold border-l-2 border-emerald-500"
                        : isRem
                        ? "bg-rose-500/20 text-rose-300 opacity-85 border-l-2 border-rose-500"
                        : "text-slate-300"
                    }`}
                  >
                    <span className="w-5 text-right select-none text-slate-500 text-[9px] shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-[11px] whitespace-pre">{line}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          scene.evidenceId && (
            <div className="flex justify-center mt-0.5">
              <button
                onClick={() => onSelectEvidence?.(scene.evidenceId!)}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 px-3.5 py-1 rounded-xl border border-indigo-500/30 transition-all cursor-pointer shadow-md"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Inspect Code & Evidence</span>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
