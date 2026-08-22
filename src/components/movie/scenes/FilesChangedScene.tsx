"use client";

import React from "react";
import { motion } from "motion/react";
import { Plus, Minus, Edit3, ExternalLink, ShieldAlert, FolderGit2 } from "lucide-react";
import type { SceneComponentProps } from "./types";
import type { FilesChangedSceneData } from "@/types/scenes";

export function FilesChangedScene({ scene, prUrl }: SceneComponentProps<FilesChangedSceneData>) {
  const files = scene.files || [];

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 p-2 sm:p-4 flex flex-col">
      <div className="my-auto w-full max-w-4xl mx-auto flex flex-col gap-2 sm:gap-2.5 select-none py-1">
        <div className="text-center mb-0.5">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Review Stage 5 • Files Changed & Review Order</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug"
          >
            Files Changed (Recommended Review Order)
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2.5 text-xs font-mono bg-[#0b0e17] px-3.5 py-0.5 rounded-full border border-white/10 mt-1.5"
          >
            <span className="text-emerald-400 font-bold">+{scene.totalAdditions} additions</span>
            <span className="text-slate-500">•</span>
            <span className="text-rose-400 font-bold">-{scene.totalDeletions} deletions</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-200 font-semibold">{files.length} files total</span>
          </motion.div>
        </div>

        <div className="w-full space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {files.map((file, idx) => {
            const isHighFocus = file.reviewPriority === "HIGH";
            const fileGithubUrl = prUrl
              ? `${prUrl}/files#diff-${file.filename.replace(/[^a-zA-Z0-9]/g, "-")}`
              : undefined;

            return (
              <motion.div
                key={file.filename + idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.25 }}
                className={`flex items-center justify-between p-2.5 rounded-xl border font-mono text-xs shadow-md transition-all ${
                  isHighFocus
                    ? "bg-rose-950/20 border-rose-500/40 hover:border-rose-400/60"
                    : "bg-[#0b0e17]/90 border-white/10 hover:border-indigo-500/30"
                }`}
              >
                <div className="flex items-center gap-2 truncate max-w-xl min-w-0">
                  {file.status === "added" && <Plus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {file.status === "modified" && <Edit3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  {file.status === "removed" && <Minus className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                  {file.status === "renamed" && <Edit3 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}

                  {fileGithubUrl ? (
                    <a
                      href={fileGithubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-100 hover:text-indigo-300 transition-colors truncate font-semibold underline-offset-2 hover:underline flex items-center gap-1"
                      title={`Open ${file.filename} on GitHub`}
                    >
                      <span className="truncate">{file.filename}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-100 truncate">{file.filename}</span>
                  )}

                  {file.category && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">
                      {file.category}
                    </span>
                  )}
                  {isHighFocus && (
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-300 border border-rose-500/40 shrink-0 font-bold">
                      <ShieldAlert className="w-2.5 h-2.5" />
                      <span>HIGH PRIORITY</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-xs font-bold">
                  <span className="text-emerald-400">+{file.additions}</span>
                  <span className="text-rose-400">-{file.deletions}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
