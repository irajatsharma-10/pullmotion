"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Link2,
  Sparkles,
  PlayCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "1",
      icon: Link2,
      title: "Paste a PR Link",
      description:
        "Just paste any GitHub pull request URL. Works instantly with zero configuration or local tooling.",
      accent: "bg-purple-600",
      pill: "Step 1",
    },
    {
      step: "2",
      icon: Sparkles,
      title: "Isolate Pure Signal",
      description:
        "PR Movie analyzes ASTs & diffs, stripping out lockfile noise, re-exports, and generated boilerplate.",
      accent: "bg-indigo-600",
      pill: "Step 2",
    },
    {
      step: "3",
      icon: PlayCircle,
      title: "Generate Mental Model",
      description:
        "Maps execution flows, root logic mutations, and blast radius into 6 structured developer inspection scenes.",
      accent: "bg-sky-600",
      pill: "Step 3",
    },
    {
      step: "4",
      icon: CheckCircle,
      title: "Review & Verify",
      description:
        "Review in 30 seconds, click any assertion to verify on GitHub, and use presentation mode for team walkthroughs.",
      accent: "bg-emerald-600",
      pill: "Step 4",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto select-none">
      <div className="text-center mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>4-Step Review Acceleration</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          How PR Movie Accelerates Reviews
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
          From a raw GitHub PR to full architectural comprehension in under 30 seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07, duration: 0.35 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#0c0f18] border border-slate-200/80 dark:border-white/[0.08] shadow-md flex flex-col justify-between relative group hover:-translate-y-1 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${s.accent} text-white shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xl font-black font-mono text-slate-300 dark:text-slate-700">
                    0{s.step}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{s.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{s.pill}</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
