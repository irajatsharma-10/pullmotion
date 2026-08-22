"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import React, { Suspense } from "react";
import { clerkAppearance } from "@/lib/clerk-theme";

function SignInContent() {
  const searchParams = useSearchParams();
  const isSSOCallback =
    searchParams.has("__clerk_status") ||
    (typeof window !== "undefined" && window.location.pathname.includes("sso-callback"));

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
        {isSSOCallback ? (
          <div className="w-full max-w-sm p-8 rounded-2xl bg-[#0e111a] border border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col items-center gap-4 text-center">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Authenticating...</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Verifying your credentials and completing sign in.
              </p>
            </div>
            <div className="opacity-0 absolute pointer-events-auto h-0 overflow-hidden">
              <SignIn fallbackRedirectUrl="/" appearance={clerkAppearance} />
            </div>
          </div>
        ) : (
          <SignIn
            fallbackRedirectUrl="/"
            appearance={clerkAppearance}
          />
        )}
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

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#07090e] flex items-center justify-center">
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/10 shadow-2xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-xs text-slate-300 font-medium">Loading Sign In...</span>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
