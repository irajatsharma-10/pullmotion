"use client";

import React from "react";
import { motion } from "motion/react";
import { Code2, Layers, ShieldCheck, Database, TestTube2, Settings, Wrench, LucideIcon } from "lucide-react";
import type { SceneComponentProps } from "./types";
import type { ChangeBreakdownSceneData } from "@/types/scenes";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  feature: Code2,
  dependency: Layers,
  api: ShieldCheck,
  schema: Database,
  tests: TestTube2,
  config: Settings,
  refactor: Wrench,
};

export function ChangeBreakdownScene({ scene }: SceneComponentProps<ChangeBreakdownSceneData>) {
  const categories = scene.categories || [];
  const totalFiles = categories.reduce((sum, c) => sum + (c.fileCount || 0), 0);

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 p-2 sm:p-4 flex flex-col">
      <div className="my-auto w-full max-w-4xl mx-auto flex flex-col gap-2 sm:gap-2.5 select-none py-1">
        <div className="text-center mb-0.5">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Review Stage 4 • Affected Subsystems</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug"
          >
            {scene.title || "Where Changes Happened"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-300 text-xs mt-0.5"
          >
            {categories.length} change categories across {totalFiles} files
          </motion.p>
        </div>

        {categories.length > 0 && totalFiles > 0 && (
          <div className="w-full flex h-2 rounded-full overflow-hidden bg-black/60 p-0.5 gap-1 my-0.5">
            {categories.map((cat, idx) => {
              const widthPct = Math.max(8, Math.round((cat.fileCount / totalFiles) * 100));
              const colors = [
                "from-indigo-500 to-purple-500",
                "from-sky-500 to-blue-500",
                "from-emerald-500 to-teal-500",
                "from-amber-500 to-orange-500",
                "from-rose-500 to-pink-500",
              ];
              const color = colors[idx % colors.length];

              return (
                <div
                  key={idx}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full bg-gradient-to-r ${color} rounded-full`}
                  title={`${cat.category}: ${cat.fileCount} files`}
                />
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
          {categories.map((cat, idx) => {
            const IconComponent = CATEGORY_ICONS[cat.category.toLowerCase()] || Layers;

            return (
              <motion.div
                key={cat.category + idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.3 }}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#0b0e17]/90 border border-white/10 flex items-start gap-3 hover:border-indigo-500/40 transition-all shadow-xl backdrop-blur-md"
              >
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 shrink-0">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white capitalize text-xs sm:text-sm">{cat.category}</h4>
                    <span className="text-[9px] sm:text-[10px] font-mono font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                      {cat.fileCount} {cat.fileCount === 1 ? "file" : "files"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed mb-2">{cat.summary}</p>
                  {cat.files && cat.files.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cat.files.slice(0, 4).map((f, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[9px] sm:text-[10px] font-mono text-slate-300 bg-black/50 px-1.5 py-0.5 rounded-md border border-white/10 truncate max-w-[180px]"
                          title={f}
                        >
                          {f.split("/").pop()}
                        </span>
                      ))}
                      {cat.files.length > 4 && (
                        <span className="text-[9px] text-slate-400 font-mono self-center">
                          +{cat.files.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
