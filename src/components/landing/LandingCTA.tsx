"use client";

import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { PRUrlInput } from "./PRUrlInput";

export function LandingCTA() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-16 sm:py-20 sm:px-6 lg:px-8 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="
          relative
          flex flex-col items-center
          overflow-hidden
          rounded-3xl
          p-6 sm:p-12
          text-center
          bg-white dark:bg-[#0c0f1b]
          border border-slate-200/90 dark:border-white/[0.12]
          shadow-xl
        "
      >
        <div
          className="
            relative
            mb-4
            inline-flex items-center gap-2
            rounded-full
            border border-purple-200/80
            bg-purple-50
            px-3.5 py-1.5
            text-xs font-bold
            text-purple-700
            shadow-xs
            dark:border-purple-500/30
            dark:bg-purple-500/15
            dark:text-purple-300
          "
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>Free to Use • No Account Needed</span>
        </div>

        <h2
          className="
            relative
            mb-3
            max-w-xl
            text-2xl
            font-black
            leading-tight
            tracking-tight
            text-slate-900
            sm:text-4xl
            dark:text-white
          "
        >
          Ready to Accelerate Your{" "}
          <span className="text-purple-600 dark:text-purple-400">
            PR Reviews?
          </span>
        </h2>

        <p
          className="
            relative
            mb-7
            mx-auto
            max-w-lg
            text-xs
            leading-relaxed
            text-slate-600
            sm:text-sm
            dark:text-slate-300
          "
        >
          Paste any public or private GitHub pull request URL below to get instant architectural clarity and verified code inspection.
        </p>

        <div className="relative w-full max-w-xl">
          <PRUrlInput size="large" />
        </div>
      </motion.div>
    </section>
  );
}