import type { PRFile } from "@/types/pr-data";
import type { SemanticFileInfo } from "./semantic-analyzer";
import type { AnalyzedDiff } from "./diff-analyzer";
import type { DependencyGraph } from "./dependency-graph";
import type { EvidenceRef } from "@/types/evidence";

export type PrioritySignal =
  | "security_sensitive"
  | "data_mutation"
  | "public_api"
  | "changed_contract"
  | "critical_path"
  | "high_blast_radius"
  | "complex_logic"
  | "production_config"
  | "shared_module"
  | "missing_test_coverage"
  | "dependency_update";

export interface ReviewerFocusItem {
  id: string;
  file: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  signals: PrioritySignal[];
  evidence: EvidenceRef[];
  changeGroupId?: string;
}

const SIGNAL_WEIGHTS: Record<PrioritySignal, number> = {
  security_sensitive: 10,
  data_mutation: 9,
  public_api: 8,
  changed_contract: 7,
  critical_path: 7,
  high_blast_radius: 6,
  complex_logic: 5,
  production_config: 5,
  shared_module: 4,
  missing_test_coverage: 4,
  dependency_update: 2,
};

/**
 * Computes evidence-backed reviewer priority for every changed file in the PR.
 * Never outputs a priority without cited signals and evidence lines.
 */
export function evaluateReviewerPriority(
  files: PRFile[],
  semanticFiles: SemanticFileInfo[],
  analyzedDiffs: AnalyzedDiff[],
  dependencyGraph: DependencyGraph
): ReviewerFocusItem[] {
  const semanticMap = new Map<string, SemanticFileInfo>();
  semanticFiles.forEach((sf) => semanticMap.set(sf.path, sf));

  const diffMap = new Map<string, AnalyzedDiff>();
  analyzedDiffs.forEach((ad) => diffMap.set(ad.path, ad));

  const focusItems: ReviewerFocusItem[] = [];
  let itemIndex = 1;

  for (const file of files) {
    const sem = semanticMap.get(file.path);
    const diff = diffMap.get(file.path);
    const lowerPath = file.path.toLowerCase();
    const signals: PrioritySignal[] = [];
    const reasons: string[] = [];

    // 1. Security Sensitivity
    if (
      lowerPath.includes("auth") ||
      lowerPath.includes("permission") ||
      lowerPath.includes("token") ||
      lowerPath.includes("secret") ||
      lowerPath.includes("security") ||
      lowerPath.includes("jwt") ||
      lowerPath.includes("oauth") ||
      lowerPath.includes("middleware")
    ) {
      signals.push("security_sensitive");
      reasons.push("Modifies authentication/authorization or security controls");
    }

    // 2. Data Mutation & Database Schema
    if (
      diff?.hasSchemaChanges ||
      lowerPath.includes("prisma") ||
      lowerPath.includes("migration") ||
      lowerPath.includes("schema") ||
      lowerPath.endsWith(".sql")
    ) {
      signals.push("data_mutation");
      reasons.push("Modifies database schema or data persistence model");
    }

    // 3. Public API / Route Handlers
    if (
      diff?.hasApiChanges ||
      lowerPath.includes("api/") ||
      lowerPath.includes("routes/") ||
      lowerPath.endsWith("route.ts") ||
      lowerPath.endsWith("server.ts")
    ) {
      signals.push("public_api");
      reasons.push("Changes public API contract or route handler behavior");
    }

    // 4. Changed Contract / Types
    if (
      diff?.hasSignatureChanges ||
      (sem && sem.exports.some((e) => e.kind === "interface" || e.kind === "type"))
    ) {
      signals.push("changed_contract");
      reasons.push("Alters exported type or function signature contracts");
    }

    // 5. Critical Execution Path
    if (sem?.isEntrypoint) {
      signals.push("critical_path");
      reasons.push("Key execution entrypoint or application root");
    }

    // 6. High Blast Radius / Shared Module
    const inDegree = dependencyGraph.inDegree[file.path] || 0;
    if (inDegree >= 3) {
      signals.push("high_blast_radius");
      signals.push("shared_module");
      reasons.push(`Directly depended upon by ${inDegree} other changed files in this PR`);
    } else if (inDegree >= 1) {
      signals.push("shared_module");
    }

    // 7. Complex Logic (high branch count)
    if (diff?.hasBranchChanges && (diff.totalAdded > 30 || diff.hunks.length > 2)) {
      signals.push("complex_logic");
      reasons.push("Introduces multiple new conditional branches and execution paths");
    }

    // 8. Production Configuration
    if (
      lowerPath.endsWith("dockerfile") ||
      lowerPath.includes("docker-compose") ||
      lowerPath.startsWith(".github/workflows") ||
      lowerPath.endsWith(".env.example")
    ) {
      signals.push("production_config");
      reasons.push("Modifies production deployment or CI/CD workflow configuration");
    }

    // 9. Dependency updates
    if (
      lowerPath.endsWith("package.json") ||
      lowerPath.endsWith("cargo.toml") ||
      lowerPath.endsWith("go.mod")
    ) {
      signals.push("dependency_update");
      reasons.push("Alters package dependencies");
    }

    // Calculate total score
    const totalScore = signals.reduce((sum, sig) => sum + SIGNAL_WEIGHTS[sig], 0);

    let priority: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    if (totalScore >= 12 || signals.includes("security_sensitive") || signals.includes("data_mutation")) {
      priority = "HIGH";
    } else if (totalScore >= 6 || file.additions + file.deletions >= 50) {
      priority = "MEDIUM";
    }

    const startLine = diff && diff.hunks.length > 0 ? diff.hunks[0].newStart : 1;
    const endLine = diff && diff.hunks.length > 0
      ? diff.hunks[0].newStart + diff.hunks[0].newCount
      : Math.min(60, file.additions + file.deletions + 1);

    const evidence: EvidenceRef[] = [
      {
        file: file.path,
        type: "changed_file",
        startLine,
        endLine,
        confidence: "direct",
        symbol: sem?.modifiedSymbols[0]?.name,
      },
    ];

    const reason = reasons.length > 0
      ? reasons.join("; ")
      : `${file.status.toUpperCase()} (+${file.additions}/-${file.deletions} lines)`;

    focusItems.push({
      id: `focus-${itemIndex++}-${file.path.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 25)}`,
      file: file.path,
      priority,
      reason,
      signals,
      evidence,
    });
  }

  // Sort by priority (HIGH -> MEDIUM -> LOW), then by impact
  return focusItems.sort((a, b) => {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.signals.length - a.signals.length;
  });
}
