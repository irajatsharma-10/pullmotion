"use client";

import React from "react";
import type { EvidenceItem } from "@/types/evidence";
import { ExternalLink, X, ShieldCheck, FileCode, Check } from "lucide-react";

interface EvidencePanelProps {
  evidence: EvidenceItem[];
  selectedId: string | null;
  onClose: () => void;
}

export function EvidencePanel({ evidence, selectedId, onClose }: EvidencePanelProps) {
  if (!selectedId) return null;

  const activeItem = evidence.find((e) => e.id === selectedId);

  return (
    <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-80 md:w-96 h-full border-l border-white/[0.08] bg-[#0a0d14]/95 backdrop-blur-2xl p-4 sm:p-5 flex flex-col z-30 shadow-2xl transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Evidence Citation</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close evidence panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {activeItem ? (
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span>Source File</span>
            </div>
            <div className="text-xs font-mono text-purple-300 break-all bg-black/50 p-2.5 rounded-xl border border-white/[0.06]">
              {activeItem.file}
            </div>
          </div>

          {activeItem.excerpt && (
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Code Excerpt</span>
              </div>
              <pre className="p-3 bg-black/70 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto border border-white/[0.06] leading-relaxed max-h-60">
                {activeItem.excerpt}
              </pre>
            </div>
          )}

          <div className="pt-2">
            <a
              href={activeItem.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition-all hover:border-purple-400"
            >
              <span>Inspect on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-400 mt-6 text-center">
          Select an evidence badge in the movie to view verified citations.
        </div>
      )}
    </aside>
  );
}
