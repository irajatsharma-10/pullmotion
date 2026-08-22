"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Play,
  Layers,
  GitPullRequest,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface ShowcaseItem {
  id: string;
  repoName: string;
  prNumber: number;
  title: string;
  summary: string;
  additions: number;
  deletions: number;
  filesCount: number;
  url: string;
  tags: string[];
}

const FEATURED_MOVIES: ShowcaseItem[] = [
  {
    id: "nextjs-redis",
    repoName: "vercel/next.js",
    prNumber: 49258,
    title: "Add Redis caching layer to reduce database load",
    summary: "Replaces direct database lookups with a distributed Redis cache and automatic 60s expiration.",
    additions: 1247,
    deletions: 312,
    filesCount: 18,
    url: "/vercel/next.js/pull/49258",
    tags: ["Next.js", "Redis Cache", "Performance"],
  },
  {
    id: "react-actions",
    repoName: "facebook/react",
    prNumber: 28000,
    title: "React 19 Server Actions & useActionState",
    summary: "Connects form submissions directly into React transitions without needing useEffect boilerplate.",
    additions: 940,
    deletions: 185,
    filesCount: 12,
    url: "/facebook/react/pull/28000",
    tags: ["React 19", "Server Actions", "Forms"],
  },
  {
    id: "tailwind-oxide",
    repoName: "tailwindlabs/tailwindcss",
    prNumber: 12890,
    title: "Rust High-Performance Compiler Engine",
    summary: "Replaces JavaScript CSS parser with native Rust compiler binary for 10x faster builds.",
    additions: 4120,
    deletions: 1890,
    filesCount: 34,
    url: "/tailwindlabs/tailwindcss/pull/12890",
    tags: ["Tailwind v4", "Rust Engine", "Compiler"],
  },
  {
    id: "prisma-contract",
    repoName: "prisma/prisma",
    prNumber: 104,
    title: "Contract-first Data Layer & Typed Middleware",
    summary: "Adds contract compilation pipeline with schema verification and zero-overhead queries.",
    additions: 830,
    deletions: 240,
    filesCount: 9,
    url: "/prisma/prisma/pull/104",
    tags: ["Prisma", "PostgreSQL", "Data Layer"],
  },
];

export function ShowcaseGallery() {
  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto select-none">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive PR Library</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Real PR Architecture Deconstructions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl leading-relaxed">
            Click any featured pull request below to inspect its data flow transitions and line-level code citations.
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          <span>Create Your Own</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {FEATURED_MOVIES.map((movie, idx) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="group relative rounded-2xl bg-white dark:bg-[#0c0f18] border border-slate-200/80 dark:border-white/[0.08] hover:border-purple-500/50 dark:hover:border-purple-500/50 shadow-md overflow-hidden p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-black/60 border border-slate-200/80 dark:border-white/[0.08] text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  <GitPullRequest className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>
                    {movie.repoName} #{movie.prNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                {movie.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {movie.summary}
              </p>

              <div className="flex items-center gap-1.5 flex-wrap mb-5">
                {movie.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.06]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">+{movie.additions}</span>
                <span className="text-rose-700 dark:text-rose-400 font-bold">-{movie.deletions}</span>
                <span className="text-slate-500">{movie.filesCount} files</span>
              </div>

              <Link
                href={movie.url}
                onClick={() => toast.success(`Loading video for ${movie.repoName} #${movie.prNumber}`)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Watch</span>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
