"use client";

import React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  GitCompare,
  SlidersHorizontal,
  Compass,
  Cpu,
  CheckCircle2,
  Share2,
} from "lucide-react";

export function FeatureHighlights() {
  const features = [
    {
      icon: GitCompare,
      title: "Data & Execution Flow Mapping",
      description:
        "Instantly grasp how APIs, databases, and client components interact before vs after—no manual call-stack tracing.",
      badge: "Architecture First",
      color: "text-purple-700 dark:text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      icon: Compass,
      title: "Guided Cognitive Review Order",
      description:
        "Tells you what to review first: root architectural mutation -> API changes -> ripple effects -> test suites.",
      badge: "Optimal Review Path",
      color: "text-indigo-700 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      icon: Cpu,
      title: "Signal vs Noise Blast Radius",
      description:
        "Automatically isolates core business logic from lockfiles, auto-generated code, assets, and routine re-exports.",
      badge: "Zero Churn Noise",
      color: "text-sky-700 dark:text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      icon: ShieldCheck,
      title: "100% Code-Grounded Evidence",
      description:
        "Zero generic AI hallucinations. Every summary bullet and architecture node is hard-linked to GitHub line numbers.",
      badge: "Verifiable Citations",
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: SlidersHorizontal,
      title: "Interactive Inspection Controls",
      description:
        "Scrub through any scene, inspect diff snippets with syntax highlighting, adjust playback speed, or jump between layers.",
      badge: "Deep Scrubbing",
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      icon: Share2,
      title: "Asynchronous Alignment",
      description:
        "Embed Markdown badges directly in PR descriptions or share canonical links in Slack to eliminate 30-minute sync meetings.",
      badge: "Team Alignment",
      color: "text-pink-700 dark:text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
  ];

  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto select-none">
      <div className="text-center mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-400 text-xs font-bold mb-3 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Developer Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Engineering Superpowers for Faster Reviews
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Built specifically to eliminate reviewer cognitive overload and make complex diffs transparent.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06, duration: 0.35 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#0c0f18] border border-slate-200/80 dark:border-white/[0.08] shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className={`p-2.5 rounded-xl ${item.bg} border ${item.border} ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded border border-slate-200/80 dark:border-white/[0.06]">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Developer Superpower</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
