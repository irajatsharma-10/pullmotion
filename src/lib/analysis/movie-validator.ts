import type { PRMovie } from "@/types/pr-movie";
import type { PRReviewModel } from "@/types/review-model";
import type {
  CodeChangeSceneData,
  BeforeAfterSceneData,
  FilesChangedSceneData,
  ChangeBreakdownSceneData,
  SummarySceneData,
} from "@/types/scenes";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Known external services / infrastructure keywords to guard against hallucination
const INFRASTRUCTURE_KEYWORDS = [
  "kafka",
  "rabbitmq",
  "redis",
  "memcached",
  "dynamodb",
  "cassandra",
  "elasticsearch",
  "opensearch",
  "kubernetes",
  "docker",
  "graphql",
  "grpc",
  "temporal",
  "celery",
];

// Hallucination patterns for fabricated performance metrics & unwarranted guarantees
const FABRICATED_METRIC_PATTERNS = [
  // 1. Verb + Dimension by Percentage: e.g. "reduced/reduces/reducing latency by 40%", "improves/improved performance by 35%", "lowers response time by 50%"
  /(?:reduc(?:ed|es|ing|e)|decreas(?:ed|es|ing|e)|improv(?:ed|es|ing|e)|increas(?:ed|es|ing|e)|lower(?:ed|s|ing)?|boost(?:ed|s|ing)?|cut(?:s|ting)?|drop(?:ped|s|ping)?|shrink(?:s|ing)?|shrank|grow(?:s|ing)?|grew)\s+(?:latency|response\s+time|cpu(?:\s+usage)?|memory(?:\s+usage)?|bandwidth|throughput|load|database\s+load|query\s+time|execution\s+time|performance)\s+by\s+\d+%/i,

  // 2. Dimension + Verb by Percentage (Subject first): e.g. "Database load decreased by 30%", "Latency is reduced by 40%"
  /(?:latency|response\s+time|cpu(?:\s+usage)?|memory(?:\s+usage)?|bandwidth|throughput|load|database\s+load|query\s+time|execution\s+time|performance)\s+(?:(?:was|is|are|were)\s+)?(?:reduc(?:ed|es|ing|e)|decreas(?:ed|es|ing|e)|improv(?:ed|es|ing|e)|increas(?:ed|es|ing|e)|lower(?:ed|s|ing)?|boost(?:ed|s|ing)?|cut(?:s|ting)?|drop(?:ped|s|ping)?|shrink(?:s|ing)?|shrank)\s+by\s+\d+%/i,

  // 3. Percentage + Noun in Dimension: e.g. "40% reduction in latency", "30% improvement in throughput"
  /\b\d+%\s+(?:reduction|improvement|increase|decrease|faster|drop|boost|gain|savings|cut)\s+(?:in|of|on)\s+(?:latency|performance|cpu(?:\s+usage)?|memory(?:\s+usage)?|throughput|load|database\s+load|response\s+time|query\s+time)/i,

  // 4. Multiplier Performance Gains: e.g. "2x performance improvement", "10x faster", "5x more throughput"
  /\b(?:\d+(?:\.\d+)?x|\d+X)\s+(?:faster|speedup|speed-up|more\s+throughput|performance\s+(?:gain|improvement|boost)|throughput\s+increase)\b/i,

  // 5. Resulting in Multiplier / Percentage Improvement: e.g. "results in a 2x performance improvement", "leads to 40% speedup"
  /(?:results?\s+in|leads?\s+to|achieves?|delivers?)\s+(?:a\s+)?(?:\d+(?:\.\d+)?x|\d+%)\s+(?:faster|speedup|improvement|reduction|increase|gain|boost)/i,

  // 6. Unwarranted Absolutes / Guarantees: e.g. "guarantees 100% uptime", "zero vulnerabilities"
  /\bguarantees?\s+(?:100%|zero\s+downtime|zero\s+vulnerabilities|complete\s+security|flawless|no\s+bugs)\b/i,
];

/**
 * Checks if a quantitative metric or performance statement is directly grounded
 * in PR metadata, commit messages, or verified review claims.
 */
function isMetricClaimSupported(text: string, reviewModel: PRReviewModel): boolean {
  const corpus = [
    reviewModel.pr.pullRequest.title,
    reviewModel.pr.pullRequest.description || "",
    ...reviewModel.pr.commits.map((c) => c.message),
    ...reviewModel.claims.map((c) => c.text),
  ].join(" ").toLowerCase();

  // Extract percentage (e.g. "40%"), multiplier (e.g. "2x"), or ratio
  const match = text.match(/(\d+%\b|\b\d+(?:\.\d+)?x\b)/i);
  if (match) {
    const token = match[1].toLowerCase();
    return corpus.includes(token);
  }
  return false;
}

/**
 * Deterministic Validator & Hallucination Firewall
 * 
 * Enforces the core architectural principle:
 * CODE DETERMINES TRUTH.
 * LLM DETERMINES EXPLANATION.
 * VALIDATOR DETERMINES WHAT CAN BE SHOWN.
 * 
 * Verifies that all files, symbols, claims, citations, dependencies, and services
 * in a candidate PRMovie exist in and are supported by the canonical PRReviewModel.
 */
export function validatePRMovie(
  movie: PRMovie,
  reviewModel: PRReviewModel
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Index valid files from PRReviewModel
  const validFiles = new Set(reviewModel.pr.files.map((f) => f.path));
  reviewModel.semanticFiles.forEach((sf) => validFiles.add(sf.path));

  // Index valid symbols per file
  const validSymbolsByFile = new Map<string, Set<string>>();
  for (const sf of reviewModel.semanticFiles) {
    const symSet = new Set<string>();
    sf.symbols.forEach((s) => symSet.add(s.name));
    sf.modifiedSymbols.forEach((s) => symSet.add(s.name));
    validSymbolsByFile.set(sf.path, symSet);
  }
  for (const diff of reviewModel.analyzedDiffs) {
    const existing = validSymbolsByFile.get(diff.path) || new Set<string>();
    diff.modifiedSymbols.forEach((s) => existing.add(s));
    diff.hunks.forEach((h) => {
      if (h.enclosingSymbol) existing.add(h.enclosingSymbol);
    });
    validSymbolsByFile.set(diff.path, existing);
  }

  // Index verified evidence IDs
  const validEvidenceIds = new Set(
    (movie.evidence || []).map((e) => e.id)
  );

  // Index allowed external technologies/dependencies mentioned in imports or package files
  const allowedTechSet = new Set<string>();
  reviewModel.pr.files.forEach((f) => {
    const lower = f.path.toLowerCase();
    INFRASTRUCTURE_KEYWORDS.forEach((kw) => {
      if (lower.includes(kw)) allowedTechSet.add(kw);
    });
  });
  reviewModel.semanticFiles.forEach((sf) => {
    sf.imports.forEach((imp) => {
      const lowerSource = imp.source.toLowerCase();
      INFRASTRUCTURE_KEYWORDS.forEach((kw) => {
        if (lowerSource.includes(kw)) allowedTechSet.add(kw);
      });
    });
  });

  // 1. Movie-level Metadata Validation
  if (!movie.movieId || typeof movie.movieId !== "string") {
    errors.push("Movie must have a valid non-empty movieId.");
  }
  if (!movie.sourceHash || typeof movie.sourceHash !== "string" || !movie.sourceHash.trim()) {
    errors.push("Movie sourceHash is missing or invalid.");
  }

  // 2. Evidence Array Validation
  for (const ev of movie.evidence || []) {
    if (!validFiles.has(ev.file)) {
      errors.push(`Evidence item "${ev.id}" references non-existent file: "${ev.file}"`);
    }
  }

  // 3. Scene-by-Scene Semantic Verification
  if (!movie.scenes || movie.scenes.length === 0) {
    errors.push("Movie must contain at least one scene.");
  }

  for (const scene of movie.scenes || []) {
    // 3A. Files Validation
    if (scene.type === "code_changes") {
      const codeScene = scene as CodeChangeSceneData;
      if (!codeScene.filePath) {
        errors.push(`Code change scene "${scene.id}" has no filePath specified.`);
      } else if (!validFiles.has(codeScene.filePath)) {
        errors.push(
          `Code change scene "${scene.id}" references hallucinated file: "${codeScene.filePath}"`
        );
      }

      // Check Symbols if specified
      if (codeScene.affectedSymbols && codeScene.affectedSymbols.length > 0) {
        const fileSyms = validSymbolsByFile.get(codeScene.filePath) || new Set<string>();
        for (const sym of codeScene.affectedSymbols) {
          if (!sym || typeof sym !== "string") continue;

          // 1. Direct match in target file's AST / diff symbols
          if (fileSyms.has(sym)) {
            continue;
          }

          // 2. Cross-file match: Check if symbol exists in any other changed file in the PR
          let existsElsewhere = false;
          for (const [, symSet] of validSymbolsByFile.entries()) {
            if (symSet.has(sym)) {
              existsElsewhere = true;
              break;
            }
          }

          if (!existsElsewhere) {
            const isAstFallback = reviewModel.partialAnalysis.astFallbackFiles.includes(codeScene.filePath);
            const reason = isAstFallback
              ? `symbol analysis for "${codeScene.filePath}" was partial/fallback and symbol "${sym}" is unverified`
              : `symbol "${sym}" was not found in "${codeScene.filePath}" or any analyzed PR file`;

            errors.push(
              `Code change scene "${scene.id}" references unverified/hallucinated symbol "${sym}": ${reason}.`
            );
          }
        }
      }

      // Check Code Snippet presence
      if (!codeScene.codeSnippet || codeScene.codeSnippet.trim() === "") {
        errors.push(`Code change scene "${scene.id}" must provide a non-empty code snippet.`);
      }
    }

    if (scene.type === "files_changed") {
      const filesScene = scene as FilesChangedSceneData;
      for (const f of filesScene.files || []) {
        if (!validFiles.has(f.filename)) {
          errors.push(
            `Files changed scene "${scene.id}" lists non-existent file: "${f.filename}"`
          );
        }
      }
    }

    if (scene.type === "change_breakdown") {
      const breakdownScene = scene as ChangeBreakdownSceneData;
      for (const cat of breakdownScene.categories || []) {
        for (const f of cat.files || []) {
          if (!validFiles.has(f)) {
            errors.push(
              `Change breakdown scene "${scene.id}" lists non-existent file: "${f}" in category "${cat.category}"`
            );
          }
        }
      }
    }

    if (scene.type === "before_after") {
      const flowScene = scene as BeforeAfterSceneData;
      // If PRAnalysis explicitly stated that Before/After flow is unsupported, flag error
      if (!reviewModel.analysis.supportsBeforeAfterFlow) {
        errors.push(
          `Before/After flow diagram is not supported for archetype "${reviewModel.analysis.archetype}" (${reviewModel.analysis.supportsBeforeAfterReason}).`
        );
      }

      // Check Nodes in Flow Diagram against hallucinated services
      const allNodes = [...(flowScene.before?.nodes || []), ...(flowScene.after?.nodes || [])];
      for (const node of allNodes) {
        const labelLower = node.label.toLowerCase();
        for (const kw of INFRASTRUCTURE_KEYWORDS) {
          if (labelLower.includes(kw) && !allowedTechSet.has(kw)) {
            errors.push(
              `Before/After diagram node "${node.label}" introduces unsupported service "${kw}" without supporting evidence in PR.`
            );
          }
        }
      }
    }

    // 3B. Evidence Citations & Claims Verification
    if ("evidenceId" in scene && scene.evidenceId) {
      if (!validEvidenceIds.has(scene.evidenceId)) {
        errors.push(
          `Scene "${scene.id}" references unindexed evidenceId: "${scene.evidenceId}".`
        );
      }
    }

    if ("claims" in scene && Array.isArray(scene.claims)) {
      for (const claim of scene.claims) {
        if (claim.type === "FACT" && (!claim.evidence || claim.evidence.length === 0)) {
          errors.push(
            `Scene "${scene.id}" contains FACT claim "${claim.text}" without supporting evidence.`
          );
        }
        for (const ev of claim.evidence || []) {
          if (ev.file && !validFiles.has(ev.file)) {
            errors.push(
              `Claim in scene "${scene.id}" references non-existent evidence file: "${ev.file}".`
            );
          }
        }
      }
    }

    if (scene.type === "summary") {
      const summaryScene = scene as SummarySceneData;
      for (const bullet of summaryScene.bullets || []) {
        if (bullet.evidenceId && !validEvidenceIds.has(bullet.evidenceId)) {
          errors.push(
            `Summary bullet "${bullet.text.slice(0, 30)}..." references unindexed evidenceId: "${bullet.evidenceId}".`
          );
        }
        if (bullet.evidence) {
          for (const ev of bullet.evidence) {
            if (ev.file && !validFiles.has(ev.file)) {
              errors.push(
                `Summary bullet references non-existent evidence file: "${ev.file}".`
              );
            }
          }
        }
      }
    }

    // 3C. Hallucination Firewall Text Scanning (Metrics & Unsupported Services)
    const textBlocks: string[] = [scene.title];
    if (scene.type === "overview") {
      textBlocks.push(scene.summary);
    } else if (scene.type === "code_changes") {
      textBlocks.push(scene.explanation);
      scene.claims?.forEach((c) => textBlocks.push(c.text));
    } else if (scene.type === "before_after") {
      textBlocks.push(scene.description);
      scene.claims?.forEach((c) => textBlocks.push(c.text));
    } else if (scene.type === "summary") {
      scene.bullets?.forEach((b) => textBlocks.push(b.text));
    }

    for (const text of textBlocks) {
      if (!text) continue;

      // 1. Metric check
      for (const pattern of FABRICATED_METRIC_PATTERNS) {
        if (pattern.test(text)) {
          if (!isMetricClaimSupported(text, reviewModel)) {
            errors.push(
              `Hallucination Firewall violation in scene "${scene.id}": Unverified performance/metric claim detected in "${text.slice(0, 60)}...".`
            );
          }
        }
      }

      // 2. Keyword check for unevidenced external infra
      const lower = text.toLowerCase();
      for (const kw of INFRASTRUCTURE_KEYWORDS) {
        const wordRegex = new RegExp(`\\b${kw}\\b`, "i");
        if (wordRegex.test(lower) && !allowedTechSet.has(kw)) {
          const inPrMeta =
            reviewModel.pr.pullRequest.title.toLowerCase().includes(kw) ||
            (reviewModel.pr.pullRequest.description || "").toLowerCase().includes(kw);

          if (!inPrMeta) {
            errors.push(
              `Hallucination Firewall violation in scene "${scene.id}": Claim asserts unevidenced infrastructure/service "${kw}" in "${text.slice(0, 60)}...".`
            );
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
