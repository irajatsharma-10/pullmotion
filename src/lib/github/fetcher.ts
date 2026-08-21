/**
 * @file fetcher.ts
 * @description Concurrent data fetcher aggregating pull request metadata, changed files, and commits from GitHub.
 */

import { Octokit } from "octokit";

import type { PRData, PRFile, CommitInfo } from "@/types/pr-data";

/**
 * Fetches complete PR data from GitHub with resilient pagination.
 *
 * Key properties:
 * - Fetches metadata, files, and commits concurrently
 * - Individual pagination pages fail gracefully (partial results + warning)
 * - Populates fetchMetadata so downstream code can detect incomplete data
 * - Per-request timeouts are handled by the Octokit client configuration
 */
export async function fetchPRData(

  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<PRData> {
  // Fetch PR metadata, changed files, and commits concurrently in parallel
  const [prResult, filesResult, commitsResult] = await Promise.all([
    octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    }),
    fetchAllPRFiles(octokit, owner, repo, pullNumber),
    fetchAllPRCommits(octokit, owner, repo, pullNumber),
  ]);

  const pr = prResult.data;
  const { files, warnings: fileWarnings, isComplete: filesComplete } = filesResult;
  const { commits, warnings: commitWarnings, isComplete: commitsComplete } = commitsResult;

  const allWarnings = [...fileWarnings, ...commitWarnings];
  const isComplete = filesComplete && commitsComplete;

  // Extract labels safely
  const labels: string[] = Array.isArray(pr.labels)
    ? pr.labels.map((l) => (typeof l === "string" ? l : l.name || "")).filter(Boolean)
    : [];

  const milestone = pr.milestone ? (pr.milestone.title || null) : null;

  return {
    repository: {
      owner,
      name: repo,
      fullName: `${owner}/${repo}`,
      url: pr.base?.repo?.html_url || `https://github.com/${owner}/${repo}`,
      defaultBranch: pr.base?.repo?.default_branch || "main",
    },
    pullRequest: {
      number: pr.number,
      title: pr.title || `Pull Request #${pullNumber}`,
      description: pr.body || "",
      author: pr.user?.login || "unknown",
      authorAvatarUrl: pr.user?.avatar_url,
      url: pr.html_url || `https://github.com/${owner}/${repo}/pull/${pullNumber}`,
      baseBranch: pr.base?.ref || "main",
      headBranch: pr.head?.ref || "unknown",
      baseSha: pr.base?.sha || "",
      headSha: pr.head?.sha || "",
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      changedFiles: pr.changed_files || files.length,
      createdAt: pr.created_at || new Date().toISOString(),
      updatedAt: pr.updated_at || new Date().toISOString(),
      mergedAt: pr.merged_at || undefined,
      labels,
      milestone,
    },
    commits,
    files,
    fetchMetadata: {
      fetchedAt: new Date().toISOString(),
      isComplete,
      warnings: allWarnings,
      filesFetched: files.length,
      filesTotal: pr.changed_files || files.length,
      commitsFetched: commits.length,
      commitsTotal: commits.length, // GitHub doesn't expose total commit count separately
    },
  };
}

type PaginatedFilesResult = {
  files: PRFile[];
  warnings: string[];
  isComplete: boolean;
};

async function fetchAllPRFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<PaginatedFilesResult> {
  const files: PRFile[] = [];
  const warnings: string[] = [];
  let page = 1;
  const perPage = 100;
  let isComplete = true;

  while (true) {
    try {
      const { data } = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
        per_page: perPage,
        page,
      });

      if (!data || data.length === 0) break;

      for (const file of data) {
        files.push({
          path: file.filename,
          status: normalizeStatus(file.status),
          additions: file.additions,
          deletions: file.deletions,
          previousPath: file.previous_filename || undefined,
          patch: file.patch || undefined,
          patchStatus: file.patch ? "available" : "unavailable",
        });
      }

      if (data.length < perPage || files.length >= 3000) break;
      page++;
    } catch (error) {
      // Partial result: keep what we have, record the warning
      const msg = error instanceof Error ? error.message : "Unknown error";
      warnings.push(`File pagination failed at page ${page}: ${msg}. ${files.length} files fetched before failure.`);
      isComplete = false;
      break;
    }
  }

  return { files, warnings, isComplete };
}

function normalizeStatus(status: string): "added" | "modified" | "deleted" | "renamed" {
  switch (status) {
    case "added":
      return "added";
    case "removed":
      return "deleted";
    case "renamed":
      return "renamed";
    default:
      return "modified";
  }
}

type PaginatedCommitsResult = {
  commits: CommitInfo[];
  warnings: string[];
  isComplete: boolean;
};

async function fetchAllPRCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<PaginatedCommitsResult> {
  const commits: CommitInfo[] = [];
  const warnings: string[] = [];
  let page = 1;
  const perPage = 100;
  let isComplete = true;

  while (true) {
    try {
      const { data } = await octokit.rest.pulls.listCommits({
        owner,
        repo,
        pull_number: pullNumber,
        per_page: perPage,
        page,
      });

      if (!data || data.length === 0) break;

      for (const c of data) {
        commits.push({
          sha: c.sha,
          message: c.commit.message,
          author: c.commit.author?.name || c.author?.login || "unknown",
          date: c.commit.author?.date || new Date().toISOString(),
        });
      }

      if (data.length < perPage || commits.length >= 500) break;
      page++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      warnings.push(`Commit pagination failed at page ${page}: ${msg}. ${commits.length} commits fetched before failure.`);
      isComplete = false;
      break;
    }
  }

  return { commits, warnings, isComplete };
}
