import { createHash } from "crypto";
import type { PRData } from "@/types/pr-data";

export function computeSourceHash(prData: PRData): string {
  const normalizedPayload = {
    plannerVersion: "v2-coverage-driven",
    owner: prData.repository.owner.toLowerCase(),
    repo: prData.repository.name.toLowerCase(),
    pullNumber: prData.pullRequest.number,
    baseSha: prData.pullRequest.baseSha,
    headSha: prData.pullRequest.headSha,
    files: prData.files
      .map((f) => ({
        path: f.path,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
      }))
      .sort((a, b) => a.path.localeCompare(b.path)),
  };

  const jsonString = JSON.stringify(normalizedPayload);
  const hash = createHash("sha256").update(jsonString).digest("hex");

  return `sha256:${hash}`;
}
