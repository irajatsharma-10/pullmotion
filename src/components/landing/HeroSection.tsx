"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Film,
  Play,
  Pause,
  ArrowRight,
  GitPullRequest,
  Layers,
  Code2,
  GitCompare,
  FileCode2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { PRUrlInput } from "./PRUrlInput";

export function HeroSection() {
  const [activeSceneIndex, setActiveSceneIndex] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const sceneTabs = [
    { id: 0, name: "1. Overview", icon: Film },
    { id: 1, name: "2. Architecture", icon: GitCompare },
    { id: 2, name: "3. Code Diff", icon: Code2 },
    { id: 3, name: "4. Breakdown", icon: Layers },
    { id: 4, name: "5. Files", icon: FileCode2 },
    { id: 5, name: "6. Summary", icon: CheckCircle2 },
  ];

  const featuredPRs = [
    { name: "vercel/next.js", pr: "#49258", label: "Redis Caching" },
    { name: "facebook/react", pr: "#28000", label: "Server Actions" },
    { name: "tailwindlabs/tailwindcss", pr: "#12890", label: "Compiler Engine" },
    { name: "prisma/prisma", pr: "#104", label: "Data Layer" },
  ];

  return (
    <section className="relative w-full pt-10 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-6 shadow-xs"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Developer Review Accelerator • Not Just a Slideshow</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl leading-[1.08] mb-4"
      >
        Stop Mentally Compiling Diffs.{" "}
        <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-indigo-300 dark:to-pink-400">
          Review with Structural Clarity.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8"
      >
        Not just a passive presentation. PR Movie isolates logic blast radius, animates architectural data flows, and maps your review path so you inspect 40-file PRs in 30 seconds with 100% verified GitHub line citations.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="w-full mb-8"
      >
        <PRUrlInput size="large" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-10"
      >
        <div className="p-3 rounded-xl bg-white dark:bg-[#0c0f18] border border-slate-200/80 dark:border-white/[0.08] text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>-85% Cognitive Load</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Visual Flow vs Mental Tracing</p>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-[#0c0f18] border border-slate-200/80 dark:border-white/[0.08] text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-purple-600 dark:text-purple-400 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Guided Review Path</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Root Mutations Inspected First</p>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-[#0c0f18] border border-slate-200/80 dark:border-white/[0.08] text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero Hallucinations</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">100% Line-Level Citations</p>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-[#0c0f18] border border-slate-200/80 dark:border-white/[0.08] text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-sky-600 dark:text-sky-400 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>30-Sec Review Speed</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Noise & Lockfiles Filtered</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        className="
          relative
          w-full max-w-4xl
          overflow-hidden
          rounded-2xl
          border border-slate-200/90
          bg-white
          p-3 sm:p-4
          text-left
          shadow-2xl shadow-purple-500/5
          dark:border-white/[0.12]
          dark:bg-[#090c14]
        "
      >
        <div
          className="
            mb-3
            flex flex-col items-start justify-between gap-2.5
            rounded-xl
            border border-slate-200/80
            bg-slate-50
            px-3.5 py-2.5
            dark:border-white/[0.06]
            dark:bg-white/[0.03]
            sm:flex-row sm:items-center
          "
        >
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="
                flex items-center gap-1.5
                rounded-lg
                border border-slate-200 dark:border-white/10
                bg-white dark:bg-black/50
                px-2.5 py-1
                text-xs font-mono font-semibold
                text-slate-900 dark:text-white
              "
            >
              <GitPullRequest className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>vercel/next.js #49258</span>
            </div>

            <div
              className="
                flex items-center gap-1
                rounded-lg
                border border-emerald-200
                bg-emerald-50
                px-2 py-0.5
                text-[11px] font-semibold
                text-emerald-700
                dark:border-emerald-500/30
                dark:bg-emerald-500/15
                dark:text-emerald-400
              "
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>100% Verified Citations</span>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <div
              className="
                flex items-center gap-1
                rounded-lg
                border border-slate-200
                bg-slate-100
                p-1
                dark:border-white/[0.08]
                dark:bg-black/50
              "
            >
              <button
                onClick={() => setActiveSceneIndex((prev) => (prev === 0 ? 5 : prev - 1))}
                className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                title="Previous Scene"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex cursor-pointer items-center gap-1 rounded bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs transition-colors"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3 w-3 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-current" />
                    <span>Auto Play</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveSceneIndex((prev) => (prev + 1) % 6)}
                className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                title="Next Scene"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <Link
              href="/vercel/next.js/pull/49258"
              className="flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>Launch Studio</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {sceneTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSceneIndex === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSceneIndex(tab.id);
                  setIsPlaying(false);
                }}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                    : "border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span className="truncate text-[11px]">{tab.name}</span>
              </button>
            );
          })}
        </div>

        <div
          className="
            relative
            flex min-h-[290px] sm:min-h-[330px] flex-col justify-between
            overflow-hidden
            rounded-xl
            border border-slate-200/90
            bg-slate-50
            p-4 sm:p-6
            text-slate-900
            dark:border-white/[0.08]
            dark:bg-[#06080e]
            dark:text-slate-100
          "
        >
          <AnimatePresence mode="wait">
            {activeSceneIndex === 0 && (
              <motion.div
                key="scene-0"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="flex h-full flex-col justify-between space-y-4"
              >
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-mono text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <span>Scene 1 of 6: Overview & Scope</span>
                  </div>

                  <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                    Add Redis caching layer to reduce database load
                  </h3>

                  <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    This pull request introduces a distributed Redis caching layer in the primary data fetching flow to intercept high-frequency queries, prevent database connection pool exhaustion, and reduce latency.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.04]">
                    <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">Author</div>
                    <div className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white">@timneutkens</div>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <div className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400">Additions</div>
                    <div className="mt-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">+1,247 lines</div>
                  </div>

                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/20 dark:bg-rose-500/10">
                    <div className="text-[10px] font-mono uppercase text-rose-700 dark:text-rose-400">Deletions</div>
                    <div className="mt-0.5 text-xs font-bold text-rose-700 dark:text-rose-300">-312 lines</div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.04]">
                    <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">Impact</div>
                    <div className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white">18 files, 6 commits</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSceneIndex === 1 && (
              <motion.div
                key="scene-1"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="flex h-full flex-col justify-between space-y-4"
              >
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-mono text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <span>Scene 2 of 6: Architecture Transition</span>
                  </div>

                  <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                    Direct DB Query → Redis Edge Cache Interceptor
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                  <div className="rounded-xl border border-rose-200 bg-white p-3.5 dark:border-rose-500/20 dark:bg-slate-900/90">
                    <div className="mb-2.5 flex items-center justify-between text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400">
                      <span>BEFORE (Direct Lookup)</span>
                      <span className="text-[10px] text-rose-500/80">Legacy Flow</span>
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                      <div className="flex-1 rounded border border-slate-200 bg-slate-50 p-2 text-center dark:border-white/10 dark:bg-black/60">
                        Web UI
                      </div>
                      <span className="text-slate-400">→</span>
                      <div className="flex-1 rounded border border-slate-200 bg-slate-50 p-2 text-center dark:border-white/10 dark:bg-black/60">
                        API Node
                      </div>
                      <span className="text-rose-500">→</span>
                      <div className="flex-1 rounded border border-rose-300 bg-rose-50 p-2 text-center font-bold text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-300">
                        Database
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500 dark:text-rose-400" />
                      <span>High database latency under spike traffic</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-white p-3.5 shadow-xs dark:border-emerald-500/30 dark:bg-slate-900/90">
                    <div className="mb-2.5 flex items-center justify-between text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      <span>AFTER (Cached Lookup)</span>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                        NEW
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                      <div className="flex-1 rounded border border-slate-200 bg-slate-50 p-2 text-center dark:border-white/10 dark:bg-black/60">
                        Web UI
                      </div>
                      <span className="text-slate-400">→</span>
                      <div className="flex-1 rounded border border-indigo-300 bg-indigo-50 p-2 text-center font-bold text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/20 dark:text-indigo-300">
                        Redis Cache
                      </div>
                      <span className="text-emerald-600">→</span>
                      <div className="flex-1 rounded border border-slate-200 bg-slate-50 p-2 text-center dark:border-white/10 dark:bg-black/60">
                        Database
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>Serves cached payload with 60s TTL; DB hit only on miss</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSceneIndex === 2 && (
              <motion.div
                key="scene-2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="flex h-full flex-col justify-between space-y-3"
              >
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-mono text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <span>Scene 3 of 6: Code Changes</span>
                  </div>

                  <div className="mb-1 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-900 dark:text-white">src/lib/getData.ts</span>
                    <span className="text-indigo-600 dark:text-indigo-400">TypeScript</span>
                  </div>
                </div>

                <div className="space-y-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-3 font-mono text-xs dark:border-white/10 dark:bg-black/80">
                  <div className="rounded bg-rose-100 px-2 py-0.5 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400/90">
                    - export async function getData(key: string) &#123;
                  </div>
                  <div className="rounded bg-rose-100 px-2 py-0.5 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400/90">
                    - return await db.query(&quot;SELECT * FROM items WHERE key = ?&quot;, [key]);
                  </div>
                  <div className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400/90">
                    + export async function getData(key: string) &#123;
                  </div>
                  <div className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400/90">
                    + const cached = await redis.get(key);
                  </div>
                  <div className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400/90">
                    + if (cached) return JSON.parse(cached);
                  </div>
                  <div className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400/90">
                    + const result = await db.query(&quot;SELECT * FROM items WHERE key = ?&quot;, [key]);
                  </div>
                  <div className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400/90">
                    + await redis.set(key, JSON.stringify(result), &quot;EX&quot;, 60);
                  </div>
                </div>
              </motion.div>
            )}

            {activeSceneIndex === 3 && (
              <motion.div
                key="scene-3"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="flex h-full flex-col justify-between space-y-4"
              >
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-mono text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <span>Scene 4 of 6: Change Breakdown</span>
                  </div>

                  <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                    Automated Scope Classification
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-3.5 dark:border-white/10 dark:bg-white/5">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                      FEATURE
                    </span>
                    <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Redis Client Setup</div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">7 files • Core cache wrapper</div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-3.5 dark:border-white/10 dark:bg-white/5">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                      DEPENDENCY
                    </span>
                    <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">ioredis & types</div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">2 files • package.json update</div>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-500/25 dark:bg-emerald-500/10">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-300">
                      TESTS
                    </span>
                    <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Cache Hit/Miss Mocking</div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">5 files • 100% path coverage</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSceneIndex === 4 && (
              <motion.div
                key="scene-4"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="flex h-full flex-col justify-between space-y-3"
              >
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-mono text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <span>Scene 5 of 6: Files Changed Matrix</span>
                  </div>

                  <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                    18 Files Impacted (+1,247 / -312)
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 dark:border-white/5 dark:bg-black/60">
                    <span className="text-slate-700 dark:text-slate-300">src/lib/cache.ts</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+420</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 dark:border-white/5 dark:bg-black/60">
                    <span className="text-slate-700 dark:text-slate-300">src/lib/getData.ts</span>
                    <span className="font-bold text-slate-900 dark:text-white">+180 / -95</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 dark:border-white/5 dark:bg-black/60">
                    <span className="text-slate-700 dark:text-slate-300">tests/cache.test.ts</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+310</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSceneIndex === 5 && (
              <motion.div
                key="scene-6"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="flex h-full flex-col justify-between space-y-4"
              >
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-mono text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <span>Scene 6 of 6: Summary & Citations</span>
                  </div>

                  <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                    Verified Key Takeaways
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/5 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Introduces Redis client with automatic fallback
                      </span>
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:bg-white/10 dark:text-slate-300">
                      lib/cache.ts#L12
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/5 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Sets 60-second default TTL on database queries
                      </span>
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:bg-white/10 dark:text-slate-300">
                      src/lib/getData.ts#L45
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/5 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Added full test suite verifying mock assertions
                      </span>
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:bg-white/10 dark:text-slate-300">
                      tests/cache.test.ts#L1-L80
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="w-full mt-10 pt-6 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold font-mono uppercase tracking-wider text-[11px]">
          Featured Open Source Pull Requests:
        </span>
        <div className="flex items-center gap-2 flex-wrap justify-center text-xs font-mono">
          {featuredPRs.map((repo) => (
            <Link
              key={repo.name}
              href={`/${repo.name}/pull/${repo.pr.replace("#", "")}`}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 transition-colors font-medium"
            >
              <span>{repo.name}</span> <span className="text-slate-500 dark:text-slate-400">{repo.pr}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
