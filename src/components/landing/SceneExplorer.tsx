"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Film,
  GitCompare,
  Code2,
  Layers,
  FileCode2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";

interface SceneDefinition {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  preview: React.ReactNode;
}

export function SceneExplorer() {
  const SCENE_DEFINITIONS: SceneDefinition[] = [
    {
      id: 0,
      title: "1. Scope & PR Sizing",
      subtitle: "Instant context & churn density",
      description:
        "Quickly size up the PR: author, total line churn (+1,247 / -312), commit count, and a clear architectural summary.",
      icon: Film,
      badge: "PR Sizing",
      preview: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase">
              Pull Request #49258
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Add Redis caching layer to speed up queries
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Adds a distributed cache fallback to handle traffic spikes and prevent database overloads.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
              +1,247 lines
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 font-bold">
              -312 lines
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold">
              18 files
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      title: "2. Architecture & Data Flow",
      subtitle: "Visual execution path transition",
      description:
        "Animated flow diagram showing data movement before vs now, spotlighting new services, caches, and state mutations.",
      icon: GitCompare,
      badge: "System Flow",
      preview: (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase block mb-1.5">
              Before (Direct DB Query)
            </span>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="bg-white dark:bg-black/60 px-2.5 py-1 rounded border border-slate-200 dark:border-white/10">App</span>
              <span className="text-slate-400">→</span>
              <span className="bg-white dark:bg-black/60 px-2.5 py-1 rounded border border-slate-200 dark:border-white/10">Server</span>
              <span className="text-rose-500">→</span>
              <span className="bg-rose-100 dark:bg-rose-500/30 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded font-bold border border-rose-300 dark:border-rose-500/40">Database</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-1.5">
              After (Redis Edge Cache)
            </span>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="bg-white dark:bg-black/60 px-2.5 py-1 rounded border border-slate-200 dark:border-white/10">App</span>
              <span className="text-slate-400">→</span>
              <span className="bg-purple-100 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded font-bold border border-purple-300 dark:border-purple-500/40">Redis</span>
              <span className="text-emerald-600">→</span>
              <span className="bg-white dark:bg-black/60 px-2.5 py-1 rounded border border-slate-200 dark:border-white/10">Database</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "3. Root Logic Spotlight",
      subtitle: "The exact code lines that matter",
      description:
        "Highlights the core semantic diffs driving the change, filtering out repetitive imports, renames, and noise.",
      icon: Code2,
      badge: "Root Diff",
      preview: (
        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-1 overflow-x-auto border border-white/10">
          <div className="text-[11px] text-slate-400 pb-1 border-b border-white/10 flex justify-between font-sans">
            <span>src/lib/getData.ts</span>
            <span className="text-purple-400">TypeScript</span>
          </div>
          <div className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded pt-1">- return await db.query(sql);</div>
          <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">+ const cached = await redis.get(key);</div>
          <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">+ if (cached) return JSON.parse(cached);</div>
          <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">+ await redis.set(key, result, 60);</div>
        </div>
      ),
    },
    {
      id: 3,
      title: "4. Blast Radius Breakdown",
      subtitle: "Layer-by-layer mutation categories",
      description:
        "Classifies the exact scope: feature logic, external dependencies, API contracts, database schema, and test fixtures.",
      icon: Layers,
      badge: "Blast Radius",
      preview: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">Feature</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">Redis Client</div>
            <div className="text-[11px] text-slate-500 mt-1">7 files touched</div>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400">Package</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">ioredis</div>
            <div className="text-[11px] text-slate-500 mt-1">2 files touched</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Tests</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">Cache Hit/Miss</div>
            <div className="text-[11px] text-slate-500 mt-1">5 files touched</div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "5. Impacted Files Matrix",
      subtitle: "Prioritized file list with churn stats",
      description:
        "Readable list of modified files with additions/deletions, helping reviewers know which files to inspect first.",
      icon: FileCode2,
      badge: "File Priority",
      preview: (
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10">
            <span className="text-slate-800 dark:text-slate-200">src/lib/cache.ts</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">+420 lines</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10">
            <span className="text-slate-800 dark:text-slate-200">src/lib/getData.ts</span>
            <span className="font-bold text-slate-900 dark:text-white">+180 / -95</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10">
            <span className="text-slate-800 dark:text-slate-200">tests/cache.test.ts</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">+310 lines</span>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "6. Summary & Evidence Proof",
      subtitle: "Reviewer checklist with GitHub links",
      description:
        "Concrete takeaways backed 100% by GitHub diff evidence. Click any item to jump to the exact source lines.",
      icon: CheckCircle2,
      badge: "Verified Proof",
      preview: (
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-lg bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Adds Redis client with automatic fallback to database</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>60-second default expiration time on all queries</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Full test coverage for cache hits and misses</span>
          </div>
        </div>
      ),
    },
  ];

  const [selectedSceneIndex, setSelectedSceneIndex] = useState(1);
  const activeScene = SCENE_DEFINITIONS[selectedSceneIndex];

  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto select-none">
      <div className="text-center mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>6 Canonical Scenes</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          6 Developer Inspection Modes
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Not random slides. Each scene is an engineered review tool designed to answer a specific question about the PR.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-2">
          {SCENE_DEFINITIONS.map((scene, idx) => {
            const Icon = scene.icon;
            const isSelected = selectedSceneIndex === idx;

            return (
              <button
                key={scene.id}
                onClick={() => setSelectedSceneIndex(idx)}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white dark:bg-[#0f131e] border-purple-500/50 shadow-md ring-1 ring-purple-500/20"
                    : "bg-white dark:bg-[#0c0f18] border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      className={`text-xs font-bold ${
                        isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {scene.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{scene.subtitle}</p>
                  </div>
                </div>

                <ArrowRight
                  className={`w-4 h-4 transition-transform ${
                    isSelected ? "text-purple-600 dark:text-purple-400 translate-x-1" : "text-slate-400 opacity-40"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#0c0f18] border border-slate-200/90 dark:border-white/[0.1] shadow-lg p-5 sm:p-6 flex flex-col justify-between min-h-[360px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScene.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {activeScene.badge}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeScene.title}
                  </h3>
                </div>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <activeScene.icon className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeScene.description}
              </p>

              <div className="pt-2">{activeScene.preview}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
