/**
 * @file claims.ts
 * @description Type definitions for evidence-backed review claims and confidence ratings.
 */

import type { EvidenceRef } from "./evidence";

export type ClaimType = "FACT" | "INFERENCE" | "RISK" | "QUESTION" | "UNKNOWN";

export type ClaimConfidence = "high" | "medium" | "low";

export interface ReviewClaim {
  id: string;
  type: ClaimType;
  text: string;
  confidence?: ClaimConfidence;
  evidence: EvidenceRef[];
  relatedFiles: string[];
  relatedSymbols?: string[];
  category?: string;
}


