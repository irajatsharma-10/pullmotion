"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import React, { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";
import { clerkAppearance } from "@/lib/clerk-theme";

function SignUpContent() {
  return (
    <div className="min-h-screen w-full bg-[#07090e] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 flex flex-col items-center mb-5">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="w-8 h-8" />
          <span className="font-extrabold text-lg tracking-tight text-white">PR Movie</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md flex justify-center">
        <SignUp
          fallbackRedirectUrl="/"
          appearance={clerkAppearance}
        />
      </div>

      <div className="relative z-10 mt-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#07090e] flex items-center justify-center">
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/10 shadow-2xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-xs text-slate-300 font-medium">Loading Sign Up...</span>
          </div>
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
