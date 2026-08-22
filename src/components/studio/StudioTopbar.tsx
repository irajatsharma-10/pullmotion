import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserProfileMenu } from "./UserProfileMenu";
import { Logo } from "@/components/ui/Logo";

interface StudioTopbarProps {
  activeTab: "create" | "my-movies" | "examples" | "pricing";
  setActiveTab: (tab: "create" | "my-movies" | "examples" | "pricing") => void;
  setIsMyMoviesOpen: (open: boolean) => void;
  setIsExamplesOpen: (open: boolean) => void;
  setIsPricingOpen: (open: boolean) => void;
}

export function StudioTopbar({
  activeTab,
  setActiveTab,
  setIsMyMoviesOpen,
  setIsExamplesOpen,
  setIsPricingOpen,
}: StudioTopbarProps) {
  return (
    <header className="w-full px-6 py-3 border-b border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-[#0a0d14]/90 backdrop-blur-xl flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
      <Link href="/" className="flex items-center gap-2.5 group">
        <Logo className="w-6 h-6" />
        <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">PR Movie</span>
      </Link>

      <nav className="flex items-center gap-1 bg-slate-100/80 dark:bg-black/40 p-1 rounded-2xl border border-slate-200/80 dark:border-white/5 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-1.5 rounded-xl transition-all ${activeTab === "create"
              ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
        >
          Create
        </button>
        <button
          onClick={() => {
            setActiveTab("my-movies");
            setIsMyMoviesOpen(true);
          }}
          className="px-4 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          My Movies
        </button>
        <button
          onClick={() => {
            setActiveTab("examples");
            setIsExamplesOpen(true);
          }}
          className="px-4 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          Examples
        </button>
        <button
          onClick={() => {
            setActiveTab("pricing");
            setIsPricingOpen(true);
          }}
          className="px-4 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          Pricing
        </button>
      </nav>

      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        <UserProfileMenu onOpenPricing={() => setIsPricingOpen(true)} />
      </div>
    </header>
  );
}
