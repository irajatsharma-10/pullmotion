import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemVsSolution } from "@/components/landing/ProblemVsSolution";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SceneExplorer } from "@/components/landing/SceneExplorer";
import { ShowcaseGallery } from "@/components/landing/ShowcaseGallery";
import { EnterpriseTrust } from "@/components/landing/EnterpriseTrust";
import { FeatureHighlights } from "@/components/landing/FeatureHighlights";
import { FAQSection } from "@/components/landing/FAQSection";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://prmovie.dev/#website",
        "url": "https://prmovie.dev",
        "name": "PR Movie",
        "description": "Developer review accelerator and architectural execution flow copilot for GitHub pull requests.",
        "publisher": {
          "@type": "Organization",
          "name": "PR Movie",
          "url": "https://prmovie.dev"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://prmovie.dev/#software",
        "name": "PR Movie",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Transforms complex 40-file code diffs into animated, evidence-backed 6-scene storyboards with architecture flow diagrams and 100% verified GitHub line citations.",
        "featureList": [
          "Architecture & Data Flow Mapping",
          "Guided Cognitive Review Order",
          "Signal vs Noise Blast Radius Filtering",
          "100% Verified Line-Level Evidence Citations",
          "Zero-Storage Memory Execution"
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://prmovie.dev/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is PR Movie just a presentation or does it actually help me review code?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PR Movie is an active developer review accelerator. Rather than forcing you to click between 40 files in alphabetical order and reconstruct architecture in your head, it gives you the data flow mental model, isolates business logic from noise, and provides 1-click verifiable diff links to GitHub."
            }
          },
          {
            "@type": "Question",
            "name": "How does PR Movie guarantee accuracy with zero AI hallucinations?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Every single diagram node, summary bullet, and code excerpt is built strictly from your actual GitHub diff lines and repository AST. We enforce evidence-only rules: if a claim cannot be verified against a line number in the PR, it is rejected."
            }
          },
          {
            "@type": "Question",
            "name": "Is my private code safe and secure?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. PR Movie uses a zero-storage memory execution model. Code diffs are processed in temporary memory to generate the movie and are never saved to disk or persistent databases. Your code is never used to train machine learning models."
            }
          },
          {
            "@type": "Question",
            "name": "How does it handle massive 50+ file PRs?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PR Movie automatically filters out lockfiles, generated assets, and boilerplate. It spotlights the core files that actually mutated business logic, APIs, and state."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need to install any CLI or local dependencies?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Everything runs directly in your web browser. Just paste any public or authorized GitHub pull request URL to generate and inspect the PR Movie immediately."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNavbar />
      <main className="flex-1 flex flex-col items-center w-full">
        <HeroSection />
        <ProblemVsSolution />
        <HowItWorks />
        <SceneExplorer />
        <ShowcaseGallery />
        <EnterpriseTrust />
        <FeatureHighlights />
        <FAQSection />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
