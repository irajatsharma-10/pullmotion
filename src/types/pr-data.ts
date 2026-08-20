export type NormalizedPRData = {
  repository: {
    owner: string;
    name: string;
    fullName: string;
    url: string;
    defaultBranch?: string;
  };
  pullRequest: {
    number: number;
    title: string;
    description: string | null;
    author: string;
    authorAvatarUrl?: string;
    url: string;
    baseBranch: string;
    headBranch: string;
    baseSha: string;
    headSha: string;
    additions: number;
    deletions: number;
    changedFiles: number;
    createdAt: string;
    updatedAt: string;
    mergedAt?: string | null;
    labels: string[];
    milestone?: string | null;
  };
  commits: CommitInfo[];
  files: PRFile[];

  /**
   * Tracks data completeness and fetch diagnostics.
   * Optional for backward compat with cached/persisted PRData that predates this field.
   */
  fetchMetadata?: {
    fetchedAt: string;
    isComplete: boolean;
    warnings: string[];
    filesFetched: number;
    filesTotal: number;
    commitsFetched: number;
    commitsTotal: number;
  };
};

export type PRData = NormalizedPRData;

export type CommitInfo = {
  sha: string;
  message: string;
  author: string;
  date: string;
};

export type NormalizedCommit = CommitInfo;

export type PRFile = {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  additions: number;
  deletions: number;
  previousPath?: string;
  patch?: string;
  patchStatus: "available" | "unavailable";
};

export type NormalizedPRFile = PRFile;

