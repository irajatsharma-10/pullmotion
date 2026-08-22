"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Sparkles } from "lucide-react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const features = [
    "Unlimited PR storyboard generations",
    "Interactive architecture & data flow diagrams",
    "100% verified GitHub diff line citations",
    "Zero-storage memory execution for total code privacy",
    "Presentation mode",
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0d14]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                PR Movie Access
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/30 dark:to-[#0e111a] border border-purple-500/30 shadow-lg relative">
              <span className="absolute -top-3 left-6 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-0.5 rounded-full shadow-md">
                100% Free Public Beta
              </span>

              <div className="flex items-baseline gap-1 mt-1 mb-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">$0</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ forever during beta</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                PR Movie is completely free while in active public beta. Enjoy all features with no credit card required.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
            >
              Get Started for Free
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
