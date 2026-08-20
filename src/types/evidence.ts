/**
 * @file evidence.ts
 * @description Types for source evidence items, line ranges, and GitHub deep links.
 */

export type EvidenceType = "changed_file" | "context_file" | "dependency" | "commit";

export type EvidenceConfidence = "direct" | "inferred";

export type EvidenceRef = {
  file: string;
  type: EvidenceType;
  startLine?: number;
  endLine?: number;
  commitSha?: string;
  confidence?: EvidenceConfidence;
  symbol?: string;
};

export type SceneClaim = {
  text: string;
  type?: "FACT" | "INFERENCE" | "RISK" | "QUESTION" | "UNKNOWN";
  confidence?: "high" | "medium" | "low";
  evidence: EvidenceRef[];
};

export type EvidenceItem = {
  id: string;
  file: string;
  type: EvidenceType;
  githubUrl: string;
  excerpt?: string;
  startLine?: number;
  endLine?: number;
  commitSha?: string;
  symbol?: string;
  confidence?: EvidenceConfidence;
};


