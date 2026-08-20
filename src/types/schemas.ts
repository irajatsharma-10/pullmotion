import { z } from "zod";

export const ClaimTypeSchema = z.enum([
  "FACT",
  "INFERENCE",
  "RISK",
  "QUESTION",
  "UNKNOWN",
]);

export const ClaimConfidenceSchema = z.enum(["high", "medium", "low"]);

export const FlowNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["user", "client", "api", "service", "database", "cache", "queue", "external"]),
  isNew: z.boolean().optional(),
  isModified: z.boolean().optional(),
  isRemoved: z.boolean().optional(),
});

export const FlowEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  isNew: z.boolean().optional(),
  isModified: z.boolean().optional(),
});

export const FlowDiagramSchema = z.object({
  nodes: z.array(FlowNodeSchema),
  edges: z.array(FlowEdgeSchema),
});

export const FlowStepSchema = z.object({
  label: z.string(),
  isNew: z.boolean().optional(),
  evidenceId: z.string().optional(),
});

export const EvidenceRefSchema = z.object({
  file: z.string(),
  type: z.enum(["changed_file", "context_file", "dependency", "commit"]),
  startLine: z.number().optional(),
  endLine: z.number().optional(),
  commitSha: z.string().optional(),
  confidence: z.enum(["direct", "inferred"]).optional(),
  symbol: z.string().optional(),
});

export const SceneClaimSchema = z.object({
  text: z.string(),
  type: ClaimTypeSchema.optional(),
  confidence: ClaimConfidenceSchema.optional(),
  evidence: z.array(EvidenceRefSchema),
});

export const ReviewClaimSchema = z.object({
  id: z.string(),
  type: ClaimTypeSchema,
  text: z.string(),
  confidence: ClaimConfidenceSchema.optional(),
  evidence: z.array(EvidenceRefSchema),
  relatedFiles: z.array(z.string()),
  relatedSymbols: z.array(z.string()).optional(),
  category: z.string().optional(),
});

// Scene 1: Overview
export const OverviewSceneSchema = z.object({
  id: z.string().default("scene-overview"),
  type: z.literal("overview"),
  title: z.string(),
  duration: z.number().default(6),
  author: z.string(),
  stats: z.object({
    additions: z.number(),
    deletions: z.number(),
    filesChanged: z.number(),
    commits: z.number(),
  }),
  summary: z.string(),
  contractVerdict: z.string().optional(),
  problemStatement: z.string().optional(),
  architecturalImpact: z.string().optional(),
  testingRealityVerdict: z.string().optional(),
});

// Scene 2: Before / After
export const BeforeAfterSceneSchema = z.object({
  id: z.string().default("scene-before-after"),
  type: z.literal("before_after"),
  title: z.string().default("Architecture & Flow Transition"),
  duration: z.number().default(10),
  description: z.string().default("Visual flow before vs after this pull request"),
  before: FlowDiagramSchema.default({ nodes: [], edges: [] }),
  after: FlowDiagramSchema.default({ nodes: [], edges: [] }),
  beforeSteps: z.array(FlowStepSchema).default([]),
  afterSteps: z.array(FlowStepSchema).default([]),
  claims: z.array(SceneClaimSchema).default([]),
  codeSnippet: z.string().optional(),
  filePath: z.string().optional(),
  evidenceId: z.string().optional(),
  lifecycleDifference: z.string().optional(),
  criticalTransition: z.string().optional(),
});

// Scene 3: Code Changes
export const CodeSnippetSchema = z.object({
  before: z.string().optional(),
  after: z.string(),
  startLine: z.number(),
  endLine: z.number(),
  highlightLines: z.array(z.number()).optional(),
});

export const CodeChangeSceneSchema = z.object({
  id: z.string().default("scene-code-changes"),
  type: z.literal("code_changes"),
  title: z.string().default("Key Code Changes"),
  duration: z.number().default(10),
  filePath: z.string(),
  language: z.string().default("typescript"),
  codeSnippet: z.string(),
  explanation: z.string(),
  snippets: z.array(CodeSnippetSchema).default([]),
  evidenceId: z.string().optional(),
  claims: z.array(SceneClaimSchema).default([]),
  affectedSymbols: z.array(z.string()).optional(),
  reviewerPriority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  priorityReason: z.string().optional(),
  isSecuritySensitive: z.boolean().optional(),
  changeKind: z.enum(["dedicated", "grouped", "aggregate"]).optional(),
  relatedFiles: z.array(z.string()).optional(),
  invariantChange: z.string().optional(),
  designRationale: z.string().optional(),
  reviewerWatchOuts: z.array(z.string()).optional(),
  coordinatedImpact: z.string().optional(),
});

// Scene 4: Change Breakdown
export const ChangeCategoryItemSchema = z.object({
  category: z.enum(["feature", "dependency", "api", "schema", "tests", "config", "refactor"]),
  summary: z.string(),
  fileCount: z.number(),
  files: z.array(z.string()).default([]),
  impact: z.string().optional(),
  riskLevel: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
});

export const ChangeBreakdownSceneSchema = z.object({
  id: z.string().default("scene-breakdown"),
  type: z.literal("change_breakdown"),
  title: z.string().default("Change Breakdown"),
  duration: z.number().default(8),
  categories: z.array(ChangeCategoryItemSchema),
});

// Scene 5: Files Changed
export const FileChangeItemSchema = z.object({
  filename: z.string(),
  status: z.enum(["added", "modified", "removed", "renamed"]),
  additions: z.number(),
  deletions: z.number(),
  category: z.string().optional(),
  reviewPriority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  isSecuritySensitive: z.boolean().optional(),
});

export const FilesChangedSceneSchema = z.object({
  id: z.string().default("scene-files"),
  type: z.literal("files_changed"),
  title: z.string().default("Files Changed"),
  duration: z.number().default(6),
  files: z.array(FileChangeItemSchema),
  totalAdditions: z.number(),
  totalDeletions: z.number(),
});

// Scene 6: Summary
export const SummaryBulletItemSchema = z.object({
  text: z.string(),
  type: ClaimTypeSchema.optional(),
  confidence: ClaimConfidenceSchema.optional(),
  evidenceId: z.string().optional(),
  evidence: z.array(EvidenceRefSchema).optional(),
});

export const SummarySceneSchema = z.object({
  id: z.string().default("scene-summary"),
  type: z.literal("summary"),
  title: z.string().default("Summary & Takeaways"),
  duration: z.number().default(8),
  bullets: z.array(SummaryBulletItemSchema),
  nextSteps: z.array(z.string()).optional(),
  reviewerChecklist: z.array(z.string()).optional(),
  riskVerdict: z.string().optional(),
  contractSummary: z.string().optional(),
  validationSummary: z.string().optional(),
  actionSummary: z.string().optional(),
});

// Discriminated Scene Union
export const SceneSchema = z.discriminatedUnion("type", [
  OverviewSceneSchema,
  BeforeAfterSceneSchema,
  CodeChangeSceneSchema,
  ChangeBreakdownSceneSchema,
  FilesChangedSceneSchema,
  SummarySceneSchema,
]);

// Full PRMovie Schema
export const PRMovieSchema = z.object({
  version: z.literal(1).default(1),
  movieId: z.string(),
  sourceHash: z.string(),
  pr: z.object({
    url: z.string(),
    owner: z.string(),
    repo: z.string(),
    number: z.number(),
    title: z.string(),
    author: z.string(),
    createdAt: z.string(),
  }),
  overview: z.object({
    title: z.string(),
    summary: z.string(),
    totalDuration: z.number().default(48),
    stats: z.object({
      additions: z.number(),
      deletions: z.number(),
      filesChanged: z.number(),
      commits: z.number(),
    }),
  }),
  scenes: z.array(SceneSchema),
  evidence: z.array(
    z.object({
      id: z.string(),
      file: z.string(),
      type: z.enum(["changed_file", "context_file", "dependency", "commit"]),
      githubUrl: z.string(),
      excerpt: z.string().optional(),
      startLine: z.number().optional(),
      endLine: z.number().optional(),
      commitSha: z.string().optional(),
      symbol: z.string().optional(),
      confidence: z.enum(["direct", "inferred"]).optional(),
    })
  ).default([]),
  createdAt: z.string(),
});
