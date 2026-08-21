import type { PRFile } from "@/types/pr-data";
import type { SemanticFileInfo } from "./semantic-analyzer";
import type { AnalyzedDiff } from "./diff-analyzer";
import type { DependencyGraph } from "./dependency-graph";
import type { EvidenceRef } from "@/types/evidence";

export type RiskCategory =
  | "confirmed_issue"
  | "risk"
  | "missing_validation"
  | "question"
  | "unknown";

export interface ReviewRisk {
  id: string;
  category: RiskCategory;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  evidence: EvidenceRef[];
  relatedFiles: string[];
  relatedChangeGroupId?: string;
}

/**
 * Analyzes potential architectural, security, and behavioral risks grounded in code evidence.
 * Never outputs generic speculation; every risk is tied to concrete diff or dependency evidence.
 */
export function analyzeReviewRisks(
  files: PRFile[],
  semanticFiles: SemanticFileInfo[],
  analyzedDiffs: AnalyzedDiff[],
  dependencyGraph: DependencyGraph
): ReviewRisk[] {
  const risks: ReviewRisk[] = [];
  let riskIndex = 1;

  const semanticMap = new Map<string, SemanticFileInfo>();
  semanticFiles.forEach((sf) => semanticMap.set(sf.path, sf));

  const diffMap = new Map<string, AnalyzedDiff>();
  analyzedDiffs.forEach((ad) => diffMap.set(ad.path, ad));

  // 1. Check for Schema / Migration Risk
  const schemaFiles = files.filter(
    (f) =>
      f.path.includes("prisma") ||
      f.path.includes("migration") ||
      f.path.includes("schema") ||
      f.path.endsWith(".sql")
  );

  if (schemaFiles.length > 0) {
    const totalSchemaLines = schemaFiles.reduce((sum, f) => sum + f.additions + f.deletions, 0);
    const hasMigrationFile = files.some((f) => f.path.includes("migration") || f.path.endsWith(".sql"));

    if (schemaFiles.some((f) => f.path.includes("schema")) && !hasMigrationFile && totalSchemaLines > 10) {
      risks.push({
        id: `risk-${riskIndex++}-schema-migration`,
        category: "question",
        title: "Schema modified without accompanying migration file",
        description: "Data model definitions were updated, but no SQL or Prisma migration file was identified in the PR.",
        severity: "MEDIUM",
        evidence: schemaFiles.map((f) => ({
          file: f.path,
          type: "changed_file" as const,
          startLine: 1,
          endLine: Math.min(40, f.additions + f.deletions),
          confidence: "direct" as const,
        })),
        relatedFiles: schemaFiles.map((f) => f.path),
      });
    }
  }

  // 2. Check for High Blast Radius Module modifications
  for (const [filePath, inDeg] of Object.entries(dependencyGraph.inDegree)) {
    if (inDeg >= 3) {
      const fileObj = files.find((f) => f.path === filePath);
      const sem = semanticMap.get(filePath);

      risks.push({
        id: `risk-${riskIndex++}-blast-radius`,
        category: "risk",
        title: `High Blast Radius: ${filePath.split("/").pop()} impacts ${inDeg} files`,
        description: `Modifications in ${filePath} directly affect ${inDeg} other changed modules in this PR: verify backward compatibility of exported symbols.`,
        severity: "HIGH",
        evidence: [
          {
            file: filePath,
            type: "changed_file",
            startLine: 1,
            endLine: Math.min(50, (fileObj?.additions || 0) + (fileObj?.deletions || 0)),
            confidence: "direct",
            symbol: sem?.modifiedSymbols[0]?.name,
          },
        ],
        relatedFiles: [
          filePath,
          ...dependencyGraph.edges.filter((e) => e.to === filePath).map((e) => e.from),
        ],
      });
    }
  }

  // 3. Check for Security & Auth modifications without accompanying test
  const authFiles = files.filter(
    (f) =>
      f.path.toLowerCase().includes("auth") ||
      f.path.toLowerCase().includes("permission") ||
      f.path.toLowerCase().includes("middleware")
  );
  const testFiles = files.filter((f) => f.path.includes("test") || f.path.includes("spec"));

  if (authFiles.length > 0 && testFiles.length === 0) {
    risks.push({
      id: `risk-${riskIndex++}-auth-tests`,
      category: "missing_validation",
      title: "Security-sensitive changes without dedicated test coverage",
      description: "Authentication or authorization logic was modified, but no corresponding test files were modified in this PR surface.",
      severity: "HIGH",
      evidence: authFiles.map((f) => ({
        file: f.path,
        type: "changed_file" as const,
        startLine: 1,
        endLine: Math.min(30, f.additions + f.deletions),
        confidence: "direct" as const,
      })),
      relatedFiles: authFiles.map((f) => f.path),
    });
  }

  // 4. Check for Breaking Signature Changes in Public Entrypoints
  for (const diff of analyzedDiffs) {
    const sem = semanticMap.get(diff.path);
    if (diff.hasSignatureChanges && sem?.isEntrypoint) {
      risks.push({
        id: `risk-${riskIndex++}-signature-break`,
        category: "risk",
        title: `Public API signature updated in ${diff.path.split("/").pop()}`,
        description: "Function or endpoint signatures were changed in an entrypoint file.",
        severity: "MEDIUM",
        evidence: [
          {
            file: diff.path,
            type: "changed_file",
            startLine: diff.hunks[0]?.newStart || 1,
            endLine: (diff.hunks[0]?.newStart || 1) + (diff.hunks[0]?.newCount || 10),
            confidence: "direct",
          },
        ],
        relatedFiles: [diff.path],
      });
    }
  }

  return risks;
}
