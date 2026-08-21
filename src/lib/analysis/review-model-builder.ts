import type { PRData } from "@/types/pr-data";
import { analyzePR } from "./pr-analyzer";
import { evaluateReviewerPriority } from "./reviewer-priority";
import { analyzeReviewRisks } from "./risk-analyzer";
import { analyzeValidationCoverage } from "./validation-analyzer";
import type { PRReviewModel, PartialAnalysisState } from "@/types/review-model";
import type { ReviewClaim } from "@/types/claims";

/**
 * Builds the canonical PRReviewModel for a Pull Request by composing:
 * 1. AST Semantic Analysis (imports, exports, symbols, line boundaries)
 * 2. Structured Diff Analysis (hunks, branch/signature/API changes)
 * 3. Cross-file Dependency Graph (directed edges, clusters, blast radius)
 * 4. Reviewer Priority Engine (security, data mutations, APIs, critical paths)
 * 5. Risk Analyzer (schema migrations, breaking signatures, unverified auth)
 * 6. Validation Coverage Analyzer (test mappings, 4-state test existence modeling)
 * 7. Evidence-backed Typed Claims (FACT, INFERENCE, RISK, QUESTION, UNKNOWN)
 * 8. Explicit Partial Analysis Diagnostics (preserving uncertainty without speculation)
 */
export function buildPRReviewModel(
  prData: PRData,
  keyFiles?: Array<{ path: string; content: string }>
): PRReviewModel {
  // 1. Run Core PR Analysis with AST & Dependency Graph
  const analysis = analyzePR(prData, keyFiles);
  const semanticFiles = analysis.semanticFiles || [];
  const dependencyGraph = analysis.dependencyGraph || {
    edges: [],
    entryPoints: [],
    leafNodes: [],
    isolatedFiles: [],
    inDegree: {},
    outDegree: {},
    clusters: [],
  };
  const analyzedDiffs = analysis.analyzedDiffs || [];
  const files = prData.files || [];

  // 2. Evaluate Evidence-Backed Reviewer Priority
  const reviewerFocus = evaluateReviewerPriority(
    files,
    semanticFiles,
    analyzedDiffs,
    dependencyGraph
  );

  // 3. Analyze Concrete Risks
  const risks = analyzeReviewRisks(
    files,
    semanticFiles,
    analyzedDiffs,
    dependencyGraph
  );

  // 4. Analyze Test Validation Coverage (Strict 4-State Model)
  const validation = analyzeValidationCoverage(
    files,
    semanticFiles,
    dependencyGraph
  );

  // 5. Synthesize Grounded Review Claims
  const claims: ReviewClaim[] = [];
  const openQuestions: ReviewClaim[] = [];
  let claimIndex = 1;

  // 5A. Change Group Claims (FACT)
  for (const group of analysis.changeGroups) {
    const symbolText = group.affectedSymbols && group.affectedSymbols.length > 0
      ? ` (modifying ${group.affectedSymbols.slice(0, 3).join(", ")})`
      : "";

    claims.push({
      id: `claim-${claimIndex++}-group-${group.id}`,
      type: "FACT",
      text: `${group.title}: ${group.description}${symbolText}`,
      confidence: "high",
      evidence: group.evidence.map((e) => ({
        file: e.file,
        type: e.type,
        startLine: e.startLine,
        endLine: e.endLine,
        confidence: "direct",
      })),
      relatedFiles: group.files,
      relatedSymbols: group.affectedSymbols,
      category: group.category,
    });
  }

  // 5B. High-Priority Reviewer Claims (FACT / INFERENCE)
  for (const focus of reviewerFocus.filter((f) => f.priority === "HIGH")) {
    claims.push({
      id: `claim-${claimIndex++}-focus-${focus.id}`,
      type: "FACT",
      text: `High Review Priority: ${focus.file} — ${focus.reason}`,
      confidence: "high",
      evidence: focus.evidence,
      relatedFiles: [focus.file],
      category: focus.signals.join(", "),
    });
  }

  // 5C. Risk Claims (RISK / QUESTION)
  for (const risk of risks) {
    const claimType = risk.category === "question" ? "QUESTION" : "RISK";
    const claimItem: ReviewClaim = {
      id: `claim-${claimIndex++}-risk-${risk.id}`,
      type: claimType,
      text: `${risk.title}: ${risk.description}`,
      confidence: risk.severity === "HIGH" ? "high" : "medium",
      evidence: risk.evidence,
      relatedFiles: risk.relatedFiles,
      category: risk.category,
    };

    claims.push(claimItem);

    if (claimType === "QUESTION") {
      openQuestions.push(claimItem);
    }
  }

  // 5D. Untested Behavior Claims (RISK)
  for (const untested of validation.untestedChanges.slice(0, 3)) {
    const symText = untested.symbols.length > 0 ? ` (${untested.symbols.join(", ")})` : "";
    claims.push({
      id: `claim-${claimIndex++}-untested-${untested.file.replace(/[^a-zA-Z0-9]/g, "-")}`,
      type: "RISK",
      text: `Untested change in ${untested.file}${symText}: ${untested.reason}`,
      confidence: "medium",
      evidence: untested.evidence,
      relatedFiles: [untested.file],
      relatedSymbols: untested.symbols,
      category: "validation",
    });
  }

  // 6. Compute Explicit Partial Analysis State & Diagnostics
  const keyFilesSet = new Set((keyFiles || []).map((kf) => kf.path));
  const unavailablePatchFiles = analysis.unavailablePatchFiles.map((f) => f.path);
  const astFallbackFiles = files
    .filter((f) => !keyFilesSet.has(f.path) && f.patchStatus === "available")
    .map((f) => f.path);

  const truncationWarnings: string[] = [];
  if (prData.fetchMetadata?.warnings) {
    truncationWarnings.push(...prData.fetchMetadata.warnings);
  }
  if (unavailablePatchFiles.length > 0) {
    truncationWarnings.push(
      `${unavailablePatchFiles.length} file(s) have unavailable diff patches (binary or oversized)`
    );
  }

  let totalImports = 0;
  semanticFiles.forEach((sf) => (totalImports += sf.imports.length));
  const resolvedInternalEdges = dependencyGraph.edges.length;
  const unresolvedDependenciesCount = Math.max(0, totalImports - resolvedInternalEdges);

  const partialAnalysis: PartialAnalysisState = {
    hasUnavailablePatches: unavailablePatchFiles.length > 0,
    unavailablePatchFiles,
    hasAstFallback: astFallbackFiles.length > 0,
    astFallbackFiles,
    isTruncated: truncationWarnings.length > 0,
    truncationWarnings,
    unresolvedDependenciesCount,
    summary:
      unavailablePatchFiles.length > 0 || truncationWarnings.length > 0
        ? `Partial analysis active: ${files.length - unavailablePatchFiles.length}/${files.length} patches parsed; ${keyFilesSet.size} full source files indexed.`
        : `Complete semantic analysis: ${files.length} files parsed with full AST and dependency resolution.`,
  };

  return {
    pr: prData,
    analysis,
    semanticFiles,
    dependencyGraph,
    analyzedDiffs,
    claims,
    reviewerFocus,
    risks,
    validation,
    openQuestions,
    partialAnalysis,
    modelVersion: "1.0",
    generatedAt: new Date().toISOString(),
  };
}

