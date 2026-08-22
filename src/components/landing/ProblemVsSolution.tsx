"use client";

import React from "react";
import { motion } from "motion/react";
import {
  XCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  EyeOff,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function ProblemVsSolution() {
  const problems = [
    {
      title: "Mental call-stack tracing across 40+ files",
      desc: "Alphabetical file lists force you to reconstruct data flows in your head, clicking between 15 tabs.",
      badge: "Cognitive Fatigue",
    },
    {
      title: "Missing subtle side-effects & state breaks",
      desc: "Raw diffs only show added/deleted lines, not how databases, APIs, and client state interact.",
      badge: "Blind Spots",
    },
    {
      title: "Review fatigue & rubber-stamped 'LGTM'",
      desc: "Huge diffs are mentally exhausting, leading to rushed approvals that let architectural bugs slip through.",
      badge: "Risk",
    },
    {
      title: "Stale or unhelpful PR descriptions",
      desc: "Written summaries are often outdated or vague, forcing reviewers to guess the author's real intent.",
      badge: "Context Loss",
    },
  ];

  const solutions = [
    {
      title: "Visual Before & After execution flows",
      desc: "Animated architecture diagrams show exactly how data moved before vs now in 10 seconds.",
      badge: "Instant Mental Model",
    },
    {
      title: "Guided review navigation & priority",
      desc: "Inspect root mutations first, then dependency changes, then test coverage—not alphabetical noise.",
      badge: "Cognitive Order",
    },
    {
      title: "Automated signal vs noise filtering",
      desc: "Auto-isolates core logic mutations from lockfiles, re-exports, generated code, and boilerplate.",
      badge: "Clean Signal",
    },
    {
      title: "100% Code-grounded evidence citations",
      desc: "Zero AI hallucinations. Every single claim and diagram node links directly to verified GitHub diff lines.",
      badge: "1-Click Proof",
    },
  ];

  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto select-none">
      <div className="text-center mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-bold mb-3 shadow-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>The Code Review Bottleneck</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Mental Diff Tracing vs{" "}
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-300">
            Structural Acceleration
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Reading raw text diffs forces your brain to act as a compiler. PR Movie gives you the architectural mental model first, so you inspect code with 10x clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-6 sm:p-7 bg-white dark:bg-[#0c0e17] border border-rose-500/20 shadow-md relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/[0.08] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Traditional Code Review</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Mental diff compilation</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                ~45 mins / PR
              </span>
            </div>

            <div className="space-y-3.5">
              {problems.map((p, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="p-0.5 rounded-full text-rose-500 mt-0.5 shrink-0">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.title}</h4>
                      <span className="text-[9px] font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium">
            <span>Result: Exhausted reviewers & missed regressions</span>
            <EyeOff className="w-4 h-4" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-6 sm:p-7 bg-white dark:bg-[#0c0f1b] border border-purple-500/30 dark:border-purple-500/40 shadow-lg relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/[0.08] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">With PR Movie</h3>
                  <p className="text-xs text-purple-600 dark:text-purple-300 font-medium">Architectural review copilot</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>30 seconds / PR</span>
              </span>
            </div>

            <div className="space-y-3.5">
              {solutions.map((s, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="p-0.5 rounded-full text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{s.title}</h4>
                      <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        {s.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs text-purple-600 dark:text-purple-300 font-semibold">
            <span>Result: Confident reviews & instant architecture alignment</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
