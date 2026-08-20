import type { PRData } from "@/types/pr-data";
import type { PRAnalysis } from "@/lib/analysis/pr-analyzer";
import type { SemanticFileInfo } from "@/lib/analysis/semantic-analyzer";
import type { DependencyGraph } from "@/lib/analysis/dependency-graph";
import type { AnalyzedDiff } from "@/lib/analysis/diff-analyzer";
import type { ReviewClaim } from "@/types/claims";
import type { ReviewerFocusItem } from "@/lib/analysis/reviewer-priority";
import type { ReviewRisk } from "@/lib/analysis/risk-analyzer";
import type { ValidationSummary } from "@/lib/analysis/validation-analyzer";

/**
 * Strict 4-state test existence model.
 * Prevents converting missing evidence into false negative assertions.
 */
export type TestStatus =
  | "TEST_EXISTS"
  | "TEST_MISSING"
  | "TEST_NOT_ANALYZED"
  | "TEST_UNAVAILABLE";

export interface FileTestCoverage {
  file: string;
  status: TestStatus;
  coveringTestFiles: string[];
  testedSymbols: string[];
  reason: string;
}

/**
 * Preserves uncertainty when analysis is partial due to unavailable patches,
 * non-code files, AST fallback parsing, or truncated context.
 */
export interface PartialAnalysisState {
  hasUnavailablePatches: boolean;
  unavailablePatchFiles: string[];
  hasAstFallback: boolean;
  astFallbackFiles: string[];
  isTruncated: boolean;
  truncationWarnings: string[];
  unresolvedDependenciesCount: number;
  summary: string;
}

/**
 * Canonical Reviewer-First Intermediate Representation.
 * Unifies AST semantics, dependency graph, structured diffs,
 * evidence-backed claims, review priorities, risks, validation coverage,
 * and explicit partial analysis diagnostics.
 */
export interface PRReviewModel {
  pr: PRData;
  analysis: PRAnalysis;

  // Semantic & Diff Models
  semanticFiles: SemanticFileInfo[];
  dependencyGraph: DependencyGraph;
  analyzedDiffs: AnalyzedDiff[];

  // Reviewer Intelligence
  claims: ReviewClaim[];
  reviewerFocus: ReviewerFocusItem[];
  risks: ReviewRisk[];
  validation: ValidationSummary;
  openQuestions: ReviewClaim[];

  // Partial Data & Completeness Diagnostics
  partialAnalysis: PartialAnalysisState;

  // Metadata
  modelVersion: string;
  generatedAt: string;
}

