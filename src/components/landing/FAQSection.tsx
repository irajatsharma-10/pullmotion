"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, ChevronDown, CheckCircle2 } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  highlight?: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Is PR Movie just a presentation or does it actually help me review code?",
    answer:
      "PR Movie is an active developer review accelerator. Rather than forcing you to click between 40 files in alphabetical order and reconstruct architecture in your head, it gives you the data flow mental model, isolates business logic from noise, and provides 1-click verifiable diff links to GitHub.",
    highlight: "Developer Review Tool",
  },
  {
    question: "How does PR Movie guarantee accuracy with zero AI hallucinations?",
    answer:
      "Every single diagram node, summary bullet, and code excerpt is built strictly from your actual GitHub diff lines and repository AST. We enforce evidence-only rules: if a claim cannot be verified against a line number in the PR, it is rejected.",
    highlight: "100% Evidence Grounded",
  },
  {
    question: "Is my private code safe and secure?",
    answer:
      "Yes. PR Movie uses a zero-storage memory execution model. Code diffs are processed in temporary memory to generate the movie and are never saved to disk or persistent databases. Your code is never used to train machine learning models.",
    highlight: "Zero Storage & No AI Training",
  },
  {
    question: "How does it handle massive 50+ file PRs?",
    answer:
      "PR Movie automatically filters out lockfiles (package-lock.json, yarn.lock, pnpm-lock), generated assets, and boilerplate. It spotlights the core files that actually mutated business logic, APIs, and state.",
    highlight: "Smart Signal vs Noise Filter",
  },
  {
    question: "Can I share movies in Slack or GitHub PR descriptions?",
    answer:
      "Yes! Every movie gives you a shareable canonical link plus a Markdown badge formatted specifically to paste directly into your GitHub PR description, code review comments, or Slack channels.",
    highlight: "Slack & GitHub Integration",
  },
  {
    question: "Do I need to install any CLI or local dependencies?",
    answer:
      "No. Everything runs directly in your web browser. Just paste any public or authorized GitHub pull request URL to generate and inspect the PR Movie immediately.",
    highlight: "100% Web-Based",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto select-none">
      <div className="text-center mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold mb-3 shadow-xs">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Got Questions?</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Quick, simple answers to common questions about PR Movie.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen
                  ? "bg-white dark:bg-[#0c0f18] border-purple-500/40 dark:border-purple-500/40 shadow-md"
                  : "bg-white dark:bg-[#0c0f18] border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 shrink-0">
                    0{idx + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {faq.question}
                  </h3>
                </div>
                <div
                  className={`p-1.5 rounded-lg border transition-transform duration-200 shrink-0 ${
                    isOpen
                      ? "rotate-180 bg-purple-600 text-white border-purple-600"
                      : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-white/[0.06] text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
                      <p className="mt-3.5">{faq.answer}</p>
                      {faq.highlight && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{faq.highlight}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
