"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Menu, X, Film, Layers, Tag } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { UserProfileMenu } from "@/components/studio/UserProfileMenu";
import { PricingModal } from "@/components/studio/PricingModal";
import { ExamplesModal } from "@/components/studio/ExamplesModal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useRouter } from "next/navigation";
import type { PRMovie } from "@/types/pr-movie";

export function LandingNavbar() {
  const router = useRouter();
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSelectExample = (movie: PRMovie) => {
    router.push(`/${movie.pr.owner}/${movie.pr.repo}/pull/${movie.pr.number}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="w-full px-4 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-[#07090e]/90 backdrop-blur-xl flex items-center justify-between sticky top-0 z-40 select-none transition-colors duration-200">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo className="w-6 h-6" />
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              PR Movie
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Beta V1</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-white/[0.04] p-1 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] text-xs font-semibold">
          <Link
            href="/create"
            className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-all flex items-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Create Movie</span>
          </Link>
          <button
            onClick={() => setIsExamplesOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Examples</span>
          </button>
          <button
            onClick={() => setIsPricingOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Pricing</span>
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            href="/create"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Movie</span>
          </Link>

          <UserProfileMenu onOpenPricing={() => setIsPricingOpen(true)} />

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[57px] left-0 w-full bg-white/95 dark:bg-[#07090e]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 z-30 p-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            <Link
              href="/create"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-purple-600/10 dark:bg-purple-600/15 border border-purple-500/25 text-purple-700 dark:text-purple-300 font-bold text-xs"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Create New Movie</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-purple-500/20 px-2 py-0.5 rounded">Instant</span>
            </Link>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsExamplesOpen(true);
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-semibold text-xs text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                <span>Explore Showcase Examples</span>
              </div>
              <span className="text-[10px] text-slate-400">4 Open Source PRs</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsPricingOpen(true);
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-semibold text-xs text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-500" />
                <span>Pricing Plans</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Free Beta</span>
            </button>
          </div>
        </div>
      )}

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      <ExamplesModal
        isOpen={isExamplesOpen}
        onClose={() => setIsExamplesOpen(false)}
        onSelectExample={handleSelectExample}
      />
    </>
  );
}
