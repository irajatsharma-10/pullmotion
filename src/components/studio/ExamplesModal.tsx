"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Layers, Play } from "lucide-react";
import type { PRMovie } from "@/types/pr-movie";
import { SHOWCASE_EXAMPLES } from "@/lib/movie/fixture";

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (movie: PRMovie) => void;
}

export function ExamplesModal({
  isOpen,
  onClose,
  onSelectExample,
}: ExamplesModalProps) {
  React.useEffect(() => {
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

  if (!isOpen) return null;

  const examples = [
    {
      key: "vercel/next.js/49258",
      title: "Add Redis caching layer to reduce database load",
      repo: "vercel/next.js #49258",
      author: "@timneutkens",
      category: "Performance & Caching",
      stats: "+1,247 / -312 (18 files)",
      description: "Architecture flow adding an edge Redis cache layer with 60s TTL before PostgreSQL database fallback.",
    },
    {
      key: "facebook/react/28000",
      title: "Implement Server Actions Async Transition Dispatcher",
      repo: "facebook/react #28000",
      author: "@acdlite",
      category: "React 19 Core Engine",
      stats: "+940 / -185 (14 files)",
      description: "Unified async action queuing during Server Component transitions with progressive streaming.",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0d14]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-600 dark:text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Curated PR Movie Examples</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Instantly inspect production-grade pull requests</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {examples.map((item) => (
              <div
                key={item.key}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-500/40 hover:bg-slate-100/80 dark:hover:bg-white/[0.08] transition-all flex flex-col gap-3 group shadow-sm dark:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      {item.repo}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{item.author}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase bg-slate-200/70 dark:bg-black/40 px-2 py-0.5 rounded border border-slate-300/60 dark:border-white/5">
                    {item.category}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/5">
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {item.stats}
                  </span>

                  <button
                    onClick={() => {
                      const movie = SHOWCASE_EXAMPLES[item.key];
                      if (movie) {
                        onSelectExample(movie);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Load Movie</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
