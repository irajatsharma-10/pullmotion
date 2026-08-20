import { EvidenceRef, SceneClaim } from "./evidence";

export type SceneType =
  | "overview"
  | "before_after"
  | "code_changes"
  | "change_breakdown"
  | "files_changed"
  | "summary";

export interface BaseScene {
  id: string;
  type: SceneType;
  title: string;
  duration: number; // in seconds
}

export interface OverviewSceneData extends BaseScene {
  type: "overview";
  author: string;
  stats: {
    additions: number;
    deletions: number;
    filesChanged: number;
    commits: number;
  };
  summary: string;
  contractVerdict?: string;
  problemStatement?: string;
  architecturalImpact?: string;
  testingRealityVerdict?: string;
}

export interface FlowNode {
  id: string;
  label: string;
  type: "user" | "client" | "api" | "service" | "database" | "cache" | "queue" | "external";
  isNew?: boolean;
  isModified?: boolean;
  isRemoved?: boolean;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  isNew?: boolean;
  isModified?: boolean;
}

export interface FlowDiagram {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowStep {
  label: string;
  isNew?: boolean;
  evidenceId?: string;
}

export interface BeforeAfterSceneData extends BaseScene {
  type: "before_after";
  description: string;
  before: FlowDiagram;
  after: FlowDiagram;
  beforeSteps: FlowStep[];
  afterSteps: FlowStep[];
  claims: SceneClaim[];
  codeSnippet?: string;
  filePath?: string;
  evidenceId?: string;
  lifecycleDifference?: string;
  criticalTransition?: string;
}

export interface CodeSnippet {
  before?: string;
  after: string;
  startLine: number;
  endLine: number;
  highlightLines?: number[];
}

export interface CodeChangeSceneData extends BaseScene {
  type: "code_changes";
  filePath: string;
  language: string;
  codeSnippet: string;
  explanation: string;
  snippets: CodeSnippet[];
  evidenceId?: string;
  claims: SceneClaim[];
  affectedSymbols?: string[];
  reviewerPriority?: "HIGH" | "MEDIUM" | "LOW";
  priorityReason?: string;
  isSecuritySensitive?: boolean;
  changeKind?: "dedicated" | "grouped" | "aggregate";
  relatedFiles?: string[];
  invariantChange?: string;
  designRationale?: string;
  reviewerWatchOuts?: string[];
  coordinatedImpact?: string;
}

export type CategoryKind =
  | "feature"
  | "dependency"
  | "api"
  | "schema"
  | "tests"
  | "config"
  | "refactor";

export interface ChangeCategoryItem {
  category: CategoryKind;
  summary: string;
  fileCount: number;
  files: string[];
  impact?: string;
  riskLevel?: "HIGH" | "MEDIUM" | "LOW";
}

export interface ChangeBreakdownSceneData extends BaseScene {
  type: "change_breakdown";
  categories: ChangeCategoryItem[];
}

export interface FileChangeItem {
  filename: string;
  status: "added" | "modified" | "removed" | "renamed";
  additions: number;
  deletions: number;
  category?: string;
  reviewPriority?: "HIGH" | "MEDIUM" | "LOW";
  isSecuritySensitive?: boolean;
}

export interface FilesChangedSceneData extends BaseScene {
  type: "files_changed";
  files: FileChangeItem[];
  totalAdditions: number;
  totalDeletions: number;
}

export interface SummaryBulletItem {
  text: string;
  type?: "FACT" | "INFERENCE" | "RISK" | "QUESTION" | "UNKNOWN";
  confidence?: "high" | "medium" | "low";
  evidenceId?: string;
  evidence?: EvidenceRef[];
}

export interface SummarySceneData extends BaseScene {
  type: "summary";
  bullets: SummaryBulletItem[];
  nextSteps?: string[];
  reviewerChecklist?: string[];
  riskVerdict?: string;
  contractSummary?: string;
  validationSummary?: string;
  actionSummary?: string;
}

export type Scene =
  | OverviewSceneData
  | BeforeAfterSceneData
  | CodeChangeSceneData
  | ChangeBreakdownSceneData
  | FilesChangedSceneData
  | SummarySceneData;
