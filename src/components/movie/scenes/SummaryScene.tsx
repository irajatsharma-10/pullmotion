"use client";

import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, ShieldCheck, AlertTriangle, HelpCircle, FileCheck, ShieldAlert, ExternalLink, FileCode, TestTube2, Sparkles } from "lucide-react";
import type { SceneComponentProps } from "./types";
import type { SummarySceneData } from "@/types/scenes";

export function SummaryScene({ scene, onSelectEvidence, prUrl }: SceneComponentProps<SummarySceneData>) {
  const bullets = (scene.bullets || []).filter((b) => b && b.text && b.text.trim().length > 0);
  const checklist = scene.reviewerChecklist || [];
  const isLowRisk = (scene.riskVerdict || "").toLowerCase().includes("low");

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 p-2 sm:p-4 flex flex-col">
      <div className="my-auto w-full max-w-4xl mx-auto flex flex-col gap-2.5 select-none py-1">
        <div className="text-center shrink-0 w-full mb-0.5">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 shadow-xs"
          >
            <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Summary & Reviewer Takeaways</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug"
          >
            {scene.title || "PR Summary & Reviewer Checklist"}
          </motion.h2>
        </div>

        {(scene.riskVerdict || scene.contractSummary || scene.validationSummary || scene.actionSummary) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="w-full bg-[#0b0e17]/90 border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-xl shrink-0 space-y-2 backdrop-blur-md"
          >
            {scene.riskVerdict && (
              <div
                className={`flex items-center justify-center gap-2 p-1.5 rounded-xl border text-center text-xs font-medium transition-colors ${
                  isLowRisk
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                    : "bg-rose-950/40 border-rose-500/30 text-rose-200"
                }`}
              >
                {isLowRisk ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                <span
                  className={`font-bold uppercase tracking-wider text-[10px] font-mono ${
                    isLowRisk ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  Risk Level:
                </span>
                <span className="text-slate-100 font-semibold">{scene.riskVerdict}</span>
              </div>
            )}

            {(scene.contractSummary || scene.validationSummary || scene.actionSummary) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {scene.contractSummary && (
                  <div className="bg-black/40 border border-white/[0.08] p-2.5 rounded-xl text-left hover:border-indigo-500/30 transition-colors">
                    <span className="text-indigo-300 font-bold uppercase text-[9px] sm:text-[10px] font-mono tracking-wider flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>1. Architecture & API Changes</span>
                    </span>
                    <span className="text-slate-200 text-xs leading-relaxed block">{scene.contractSummary}</span>
                  </div>
                )}
                {scene.validationSummary && (
                  <div className="bg-black/40 border border-white/[0.08] p-2.5 rounded-xl text-left hover:border-emerald-500/30 transition-colors">
                    <span className="text-emerald-300 font-bold uppercase text-[9px] sm:text-[10px] font-mono tracking-wider flex items-center gap-1.5 mb-0.5">
                      <TestTube2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>2. Tests & Verification</span>
                    </span>
                    <span className="text-slate-200 text-xs leading-relaxed block">{scene.validationSummary}</span>
                  </div>
                )}
                {scene.actionSummary && (
                  <div className="bg-black/40 border border-white/[0.08] p-2.5 rounded-xl text-left hover:border-sky-500/30 transition-colors">
                    <span className="text-sky-300 font-bold uppercase text-[9px] sm:text-[10px] font-mono tracking-wider flex items-center gap-1.5 mb-0.5">
                      <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />
                      <span>3. Recommended Review Steps</span>
                    </span>
                    <span className="text-slate-200 text-xs leading-relaxed block">{scene.actionSummary}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {bullets.length > 0 && (
          <div className="w-full space-y-2 shrink-0">
            {bullets.map((bullet, idx) => {
              const type = bullet.type || "FACT";
              const isRisk = type === "RISK";
              const isQuestion = type === "QUESTION";
              const evidenceList = bullet.evidence || [];

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 + 0.08, duration: 0.2 }}
                  className={`flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border shadow-md transition-all ${
                    isRisk
                      ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-400/50"
                      : isQuestion
                      ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-400/50"
                      : "bg-[#0b0e17]/80 border-white/10 hover:border-indigo-500/30"
                  }`}
                >
                  {isRisk ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : isQuestion ? (
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isRisk
                            ? "bg-rose-500/25 text-rose-300 border border-rose-500/40"
                            : isQuestion
                            ? "bg-amber-500/25 text-amber-300 border border-amber-500/40"
                            : "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        {type}
                      </span>

                      {bullet.evidenceId && (
                        <button
                          onClick={() => onSelectEvidence?.(bullet.evidenceId!)}
                          className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-indigo-300 hover:text-white uppercase bg-indigo-500/20 hover:bg-indigo-500/35 px-2 py-0.5 rounded-lg border border-indigo-500/40 transition-all cursor-pointer font-bold shadow-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Inspect Citation</span>
                        </button>
                      )}
                    </div>

                    <p className="text-slate-100 text-xs leading-relaxed mb-1">{bullet.text}</p>

                    {evidenceList.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
                        <span className="text-[9px] uppercase font-mono text-slate-400 font-semibold">Referenced Files:</span>
                        {evidenceList.map((ev, evIdx) => {
                          const fileGithubUrl = prUrl
                            ? `${prUrl}/files#diff-${ev.file.replace(/[^a-zA-Z0-9]/g, "-")}${
                                ev.startLine ? `R${ev.startLine}` : ""
                              }`
                            : undefined;

                          return fileGithubUrl ? (
                            <a
                              key={evIdx}
                              href={fileGithubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-200 hover:text-indigo-300 bg-black/50 hover:bg-indigo-950/40 px-1.5 py-0.5 rounded-md border border-white/10 transition-colors"
                              title={`Open ${ev.file} on GitHub`}
                            >
                              <FileCode className="w-3 h-3 text-indigo-400 shrink-0" />
                              <span className="truncate max-w-[180px] font-semibold">{ev.file.split("/").pop()}</span>
                              {ev.startLine && (
                                <span className="text-slate-400 text-[9px]">
                                  :{ev.startLine}{ev.endLine && ev.endLine !== ev.startLine ? `-${ev.endLine}` : ""}
                                </span>
                              )}
                              <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            </a>
                          ) : (
                            <span
                              key={evIdx}
                              className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-300 bg-black/50 px-1.5 py-0.5 rounded-md border border-white/10"
                            >
                              <FileCode className="w-3 h-3 text-indigo-400 shrink-0" />
                              <span>{ev.file.split("/").pop()}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {checklist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="w-full p-2.5 sm:p-3 bg-[#0b0e17]/90 border border-white/10 rounded-2xl text-left shrink-0 shadow-xl backdrop-blur-md"
          >
            <div className="text-[10px] sm:text-[11px] font-bold uppercase font-mono tracking-wider text-indigo-300 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Checklist for Reviewers</span>
            </div>
            <div
              className={`grid gap-1.5 text-xs text-slate-200 ${
                checklist.length === 1
                  ? "grid-cols-1"
                  : checklist.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
              }`}
            >
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-black/40 p-2 rounded-xl border border-white/[0.08] flex items-start gap-2 hover:border-emerald-500/30 transition-colors"
                >
                  <span className="text-emerald-400 font-bold shrink-0 font-mono text-xs mt-0.5">{idx + 1}.</span>
                  <span className="leading-snug text-slate-200 text-xs">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
