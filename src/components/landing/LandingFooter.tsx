"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ShieldCheck } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#07090e] py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 select-none transition-colors">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="space-y-2.5 md:col-span-1">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6" />
            <span className="font-extrabold text-base text-slate-900 dark:text-white">PR Movie</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
            Turn complex GitHub pull requests into short, animated visual stories. Understand code changes in 30 seconds.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
            Example Videos
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/vercel/next.js/pull/49258" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Next.js Redis Caching
              </Link>
            </li>
            <li>
              <Link href="/facebook/react/pull/28000" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                React 19 Server Actions
              </Link>
            </li>
            <li>
              <Link href="/tailwindlabs/tailwindcss/pull/12890" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Tailwind Rust Engine
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
            Privacy & Trust
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Your code is never stored</span>
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Never used for AI model training</span>
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% verified with GitHub code</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <span>© {new Date().getFullYear()} PR Movie. All rights reserved.</span>
        <span>Made for developers who value their time.</span>
      </div>
    </footer>
  );
}
