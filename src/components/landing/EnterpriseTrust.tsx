"use client";

import React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  KeyRound,
  FileCheck2,
  CheckCircle2,
} from "lucide-react";

export function EnterpriseTrust() {
  const trustPoints = [
    {
      icon: Lock,
      title: "Your Code is Never Stored",
      description:
        "We analyze code diffs in temporary memory only. Your repository files are never saved on our disks or stored in databases.",
      badge: "Zero-Storage",
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: EyeOff,
      title: "Never Used for AI Training",
      description:
        "Your private code belongs to you. It is never used to train, fine-tune, or improve public machine learning models.",
      badge: "No Model Training",
      color: "text-purple-700 dark:text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      icon: KeyRound,
      title: "Safe & Private Tokens",
      description:
        "Your GitHub credentials stay securely on the server. No client exposure, no leaking, and full support for private repos.",
      badge: "Server-Side Vault",
      color: "text-sky-700 dark:text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      icon: FileCheck2,
      title: "100% Backed by Code",
      description:
        "No hallucinated summaries. Every single diagram node and bullet point links straight to verified line numbers on GitHub.",
      badge: "Clickable Citations",
      color: "text-indigo-700 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
  ];

  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto select-none">
      <div className="text-center mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-3 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy & Security First</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Safe for Private Repositories
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Built for teams where source code privacy is non-negotiable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {trustPoints.map((point, idx) => {
          const Icon = point.icon;
          return (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07, duration: 0.35 }}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0c0f18] border border-slate-200/80 dark:border-white/[0.08] shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className={`p-2.5 rounded-xl ${point.bg} border ${point.border} ${point.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-white/[0.06]">
                    {point.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{point.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {point.description}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Verified Protection</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
