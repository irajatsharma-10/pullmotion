export type ParsedPRUrl = {
  isValid: true;
  owner: string;
  repo: string;
  pullNumber: number;
  canonicalUrl: string;
};

export type InvalidPRUrl = {
  isValid: false;
  error: string;
};

export type PRUrlParseResult = ParsedPRUrl | InvalidPRUrl;

const GITHUB_PR_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/pull\/(\d+)(?:[/?#].*)?$/i;

export function parseGitHubPRUrl(input: string): PRUrlParseResult {
  if (!input || typeof input !== "string") {
    return {
      isValid: false,
      error: "Please enter a valid GitHub Pull Request URL.",
    };
  }

  const trimmed = input.trim();
  const match = trimmed.match(GITHUB_PR_REGEX);

  if (!match) {
    return {
      isValid: false,
      error: "Invalid URL. Expected format: https://github.com/owner/repo/pull/123",
    };
  }

  const [, owner, repo, pullNumberStr] = match;
  const pullNumber = parseInt(pullNumberStr, 10);

  if (isNaN(pullNumber) || pullNumber <= 0) {
    return {
      isValid: false,
      error: "Invalid PR number.",
    };
  }

  return {
    isValid: true,
    owner,
    repo,
    pullNumber,
    canonicalUrl: `https://github.com/${owner}/${repo}/pull/${pullNumber}`,
  };
}
