import { Clapperboard, GitPullRequest } from "lucide-react";
import React from "react";

export function Logo({ className = "w-5 h-5", noBg = false }: { className?: string, noBg?: boolean }) {
  if (noBg) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <Clapperboard className="w-full h-full text-white" />
        <GitPullRequest className="w-[55%] h-[55%] absolute text-indigo-300 -bottom-1 -right-1 bg-[#0a0d14] rounded-full p-[2px]" />
      </div>
    );
  }
  return (
    <div className={`p-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform relative flex items-center justify-center ${className}`}>
      <Clapperboard className="w-full h-full" />
      <GitPullRequest className="w-[55%] h-[55%] absolute text-indigo-200 -bottom-0.5 -right-0.5 drop-shadow-md" />
    </div>
  );
}
