"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import type { SceneComponentProps } from "./types";
import type { BeforeAfterSceneData, FlowNode } from "@/types/scenes";

interface ArchitectureNode {
  id: string;
  label: string;
  type: string;
  isNew?: boolean;
}

export function BeforeAfterScene({ scene, onSelectEvidence }: SceneComponentProps<BeforeAfterSceneData>) {
  const beforeNodes: ArchitectureNode[] =
    scene.before?.nodes && scene.before.nodes.length > 0
      ? scene.before.nodes.map((n: FlowNode) => ({ id: n.id, label: n.label, type: n.type, isNew: n.isNew }))
      : [
        { id: "input", label: "Client Request", type: "client" },
        { id: "handler", label: "Request Handler", type: "api" },
        { id: "core", label: "Core Module", type: "service" },
      ];

  const afterNodes: ArchitectureNode[] =
    scene.after?.nodes && scene.after.nodes.length > 0
      ? scene.after.nodes.map((n: FlowNode) => ({ id: n.id, label: n.label, type: n.type, isNew: n.isNew }))
      : beforeNodes.map((n, i) => (i === beforeNodes.length - 1 ? { ...n, label: `${n.label} (Updated)`, isNew: true } : n));

  const evidenceId: string | undefined = (scene as unknown as { evidenceId?: string }).evidenceId;

  const getNodeStyle = (node: ArchitectureNode) => {
    const type = (node.type || "").toLowerCase();

    if (node.isNew) {
      return "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] border-emerald-400 ring-2 ring-emerald-400/40 font-bold";
    }
    if (type === "client" || type === "user" || type === "external") {
      return "bg-indigo-900/60 text-indigo-200 border-indigo-500/40";
    }
    if (type === "api") {
      return "bg-sky-900/60 text-sky-200 border-sky-500/40";
    }
    if (type === "database" || type === "db") {
      return "bg-amber-900/60 text-amber-200 border-amber-500/40";
    }
    return "bg-slate-800/90 text-slate-200 border-slate-700/60";
  };

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 p-2 sm:p-4 flex flex-col">
      <div className="my-auto w-full max-w-4xl mx-auto flex flex-col gap-2.5 sm:gap-3 select-none py-1">
        <div className="text-center mb-0.5">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5"
          >
            <Workflow className="w-3.5 h-3.5 text-indigo-400" />
            <span>Review Stage 2 • Architecture & Data Flow</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug"
          >
            {scene.title || "How Data Flows: Before vs After"}
          </motion.h2>

          {scene.description && (
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto mt-1 leading-relaxed">
              {scene.description}
            </p>
          )}

          {scene.lifecycleDifference && (
            <div className="mt-2 max-w-2xl mx-auto p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 leading-relaxed text-left">
              <span className="font-bold text-emerald-400 mr-1.5 uppercase tracking-wider text-[10px] font-mono">Key Difference:</span>
              <span>{scene.lifecycleDifference}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3.5 rounded-2xl bg-[#0b0e17]/90 border border-white/10 shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
              <span className="text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase">
                Before (Old Flow)
              </span>
              <span className="text-[10px] font-mono text-slate-400">{beforeNodes.length} steps</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
              {beforeNodes.map((node, idx) => (
                <React.Fragment key={node.id + idx}>
                  <div
                    className={`px-2.5 py-1.5 rounded-xl border text-center text-[11px] font-semibold tracking-tight transition-transform shadow-sm ${getNodeStyle(
                      node
                    )}`}
                  >
                    {node.label}
                  </div>
                  {idx < beforeNodes.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="p-3.5 rounded-2xl bg-[#0b0e17]/90 border border-emerald-500/40 shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-emerald-500/20">
              <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>After (New Flow)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80">{afterNodes.length} steps</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
              {afterNodes.map((node, idx) => (
                <React.Fragment key={node.id + idx}>
                  <div
                    className={`px-2.5 py-1.5 rounded-xl border text-center text-[11px] font-semibold tracking-tight transition-transform shadow-sm ${getNodeStyle(
                      node
                    )}`}
                  >
                    {node.label}
                  </div>
                  {idx < afterNodes.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>

        {evidenceId && (
          <div className="flex justify-center mt-0.5">
            <button
              onClick={() => onSelectEvidence?.(evidenceId)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 px-3.5 py-1 rounded-xl border border-indigo-500/30 transition-all cursor-pointer shadow-md"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Inspect Code & Evidence</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
