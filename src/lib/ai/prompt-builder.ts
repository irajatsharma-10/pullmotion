import type { StoryPlannerInput } from "./types";

export function buildStoryPrompt(input: StoryPlannerInput): { systemPrompt: string; userPrompt: string } {
  const { reviewModel, plan, context } = input;
  const prData = reviewModel.pr;
  const analysis = reviewModel.analysis;
  const plannedTypes = plan.targetSceneTypes.join(", ");

  const systemPrompt = `You are a Senior Staff Software Engineer writing a PR review walkthrough for other developers.
Your job is NOT to recreate GitHub's diff viewer. Code snippets are supporting evidence, not the primary story.
Your job is to explain the changes in clear, developer-friendly language so any engineer can immediately understand:
1. WHAT problem this PR solves and what it changes in the app.
2. HOW data and control flow changed (Before vs After).
3. HOW the key code changes work, why this technical approach was chosen, and how errors are handled.
4. WHICH related changes were made across modules.
5. HOW the changes are tested and verified.
6. WHAT specific edge cases, failure modes, or things to watch out for reviewers should check.

GOLDEN RULE: Keep language practical, clear, and developer-friendly. A developer should never need a dictionary to understand your slides.

DEVELOPER-FRIENDLY TONE & CLARITY MANDATE:
- Avoid dense academic jargon or robotic buzzwords (NEVER use terms like "invariant delta", "ontological mutations", "blast radius heuristics", "epistemological", or overly complex philosophical vocabulary).
- Use natural, straightforward software engineering English (e.g. "How data flows", "What changed", "Why this approach was chosen", "Key behaviors guaranteed", "Edge cases to check").
- Reject superficial 1-liners (e.g. don't just say "Updated auth to add token" or "Added retry logic" — explain what the code actually does and how callers use it).
- Scene Titles MUST be intuitive, human-friendly titles (e.g. "Webhook Retry with Exponential Backoff" instead of raw file paths or abstract buzzwords).

HUMAN-READABLE & SUBSTANTIVE CONTENT MANDATE:
- Every slide MUST deliver practical, useful insights for the code review. No fluff, no filler.
- Explanations MUST explain what the code does, why it was implemented this way, and what edge cases to test.

DYNAMIC COVERAGE RULES:
- Generate exactly the ${plan.plannedScenes.length} planned scenes in the exact sequence specified.
- Dedicated scenes: Important standalone conceptual changes. Focus on the invariant change, design rationale, and reviewer watch-outs.
- Grouped scenes: Coordinated changes across multiple files. Explain the common pattern once with representative evidence and cross-file ripple.
- Aggregate changes: Low-signal noise (lockfiles, generated files, snapshots) summarized cleanly without dedicated scenes.
- Evidence-First: Do not invent file names, symbols, or metrics not present in the PRReviewModel evidence. Use files as proof points.

EXACT PLANNED SCENE SEQUENCE (${plan.plannedScenes.length} scenes):
${plan.plannedScenes
      .map(
        (s, idx) =>
          `${idx + 1}. [${s.type.toUpperCase()}] "${s.title}" (target: ${s.targetFilePath || "PR level"})${s.changeKind ? ` [${s.changeKind.toUpperCase()}]` : ""}: ${s.reason}`
      )
      .join("\n")}

EXACT SCENE SHAPES:
1. "overview":
   {
     "id": string,
     "type": "overview",
     "title": string,
     "duration": 6,
     "author": string,
     "stats": { "additions": number, "deletions": number, "filesChanged": number, "commits": number },
     "summary": string, // Detailed 2-3 sentence executive briefing
     "contractVerdict": string, // e.g. "BREAKING PUBLIC API", "SCHEMA & MIGRATION UPDATE", "INTERNAL RUNTIME REFACTOR"
     "problemStatement": string, // Root engineering problem or business driver
     "architecturalImpact": string, // Macro system impact across services/storage/consumers
     "testingRealityVerdict": string // Assessment of validation depth vs coverage gaps
   }

2. "before_after" (ONLY IF PLANNED):
   {
     "id": string,
     "type": "before_after",
     "title": string,
     "duration": 8,
     "description": string,
     "lifecycleDifference": string, // Conceptual breakdown of the execution delta between before vs after
     "before": { "nodes": [{ "id": string, "label": string, "type": "user"|"client"|"api"|"service"|"database"|"cache"|"queue"|"external" }], "edges": [{ "from": string, "to": string, "label": string }] },
     "after": { "nodes": [...], "edges": [...] },
     "beforeSteps": [{ "label": string }],
     "afterSteps": [{ "label": string, "isNew": boolean }],
     "claims": [{ "text": string, "evidence": [{ "file": string, "type": "changed_file" }] }]
   }

3. "code_changes":
   {
     "id": string,
     "type": "code_changes",
     "title": string, // Conceptual change title (e.g. "Idempotent Webhook Retry State Machine")
     "duration": 7,
     "filePath": string,
     "language": string,
     "codeSnippet": string,
     "explanation": string, // Comprehensive 2-3 sentence technical explanation of the mechanism
     "invariantChange": string, // Precise invariant or state guarantee altered
     "designRationale": string, // Architectural reason for choosing this approach
     "reviewerWatchOuts": [string, string], // 2-3 concrete edge cases/concurrency/testing landmines to inspect
     "coordinatedImpact": string, // Ripple effect across dependent files
     "snippets": [{ "startLine": number, "endLine": number, "after": string }],
     "claims": [{ "text": string, "evidence": [{ "file": string, "type": "changed_file" }] }],
     "affectedSymbols": string[],
     "reviewerPriority": "HIGH"|"MEDIUM"|"LOW",
     "priorityReason": string,
     "isSecuritySensitive": boolean,
     "changeKind": "dedicated"|"grouped",
     "relatedFiles": string[]
   }

4. "summary":
   {
     "id": string,
     "type": "summary",
     "title": string,
     "duration": 7,
     "contractSummary": string, // Mental Model Pillar 1: High-level architectural & contract transition
     "validationSummary": string, // Mental Model Pillar 2: Testing reality, verification status & safety
     "actionSummary": string, // Mental Model Pillar 3: Where the reviewer should start & key watchpoints
     "riskVerdict": string, // Synthesis of system risk posture
     "reviewerChecklist": [string, string, string], // 3 concrete verification steps for reviewer
     "bullets": [{ "text": string, "type": "FACT"|"INFERENCE"|"RISK"|"QUESTION"|"UNKNOWN", "confidence": "high"|"medium"|"low", "evidence": [{ "file": string, "type": "changed_file" }] }]
   }

ROOT PRMOVIE OBJECT STRUCTURE:
{
  "version": 1,
  "movieId": "${input.movieId}",
  "sourceHash": "${input.sourceHash}",
  "pr": {
    "url": "${prData.pullRequest.url}",
    "owner": "${prData.repository.owner}",
    "repo": "${prData.repository.name}",
    "number": ${prData.pullRequest.number},
    "title": "${escapeJson(prData.pullRequest.title)}",
    "author": "${prData.pullRequest.author}",
    "createdAt": "${prData.pullRequest.createdAt}"
  },
  "overview": {
    "title": "${escapeJson(prData.pullRequest.title)}",
    "summary": "Detailed 2-3 sentence executive briefing of this PR",
    "totalDuration": ${plan.totalDuration},
    "contractVerdict": "${plan.contractVerdict}",
    "stats": {
      "additions": ${prData.pullRequest.additions},
      "deletions": ${prData.pullRequest.deletions},
      "filesChanged": ${prData.pullRequest.changedFiles},
      "commits": ${prData.commits.length}
    }
  },
  "scenes": [ ... array of the ${plan.plannedScenes.length} planned scenes in exact order ... ],
  "evidence": [
    ${plan.evidenceSlots
      .map(
        (e, idx) =>
          `{ "id": "ev-${idx + 1}", "file": "${e.file}", "type": "${e.type}", "githubUrl": "${prData.pullRequest.url}/files#diff-${e.file.replace(/[^a-zA-Z0-9]/g, "-")}" }`
      )
      .join(",\n    ")}
  ],
  "createdAt": "${new Date().toISOString()}"
}`;

  const userPrompt = `<CANONICAL_PR_REVIEW_MODEL>
### 1. PR METADATA & SCOPE
Repository: ${prData.repository.fullName}
PR Number: #${prData.pullRequest.number}
Title: ${prData.pullRequest.title}
Author: @${prData.pullRequest.author}
PR Description:
${prData.pullRequest.description || "No PR description provided."}

Stats: +${prData.pullRequest.additions} / -${prData.pullRequest.deletions} across ${prData.pullRequest.changedFiles} files, ${prData.commits.length} commits
Archetype: ${analysis.archetype}
Architectural Transition: ${analysis.supportsBeforeAfterFlow ? "YES" : "NO"} (${analysis.supportsBeforeAfterReason})

### 2. SEMANTIC CHANGE GROUPS (Subsystems)
${reviewModel.analysis.changeGroups
      .map(
        (g, idx) =>
          `${idx + 1}. [${g.category.toUpperCase()}] ${g.title} (${g.files.length} files: ${g.primaryFile.path}) — ${g.description}`
      )
      .join("\n")}

### 3. HIGH REVIEWER PRIORITY FILES
${reviewModel.reviewerFocus.slice(0, 5)
      .map(
        (f, idx) =>
          `${idx + 1}. [${f.priority}] ${f.file} — ${f.reason} (Signals: ${f.signals.join(", ")})`
      )
      .join("\n")}

### 4. RISKS DETECTED
${reviewModel.risks.length > 0
      ? reviewModel.risks
        .map(
          (r, idx) =>
            `${idx + 1}. [${r.severity}] ${r.title}: ${r.description} (Files: ${r.relatedFiles.join(", ")})`
        )
        .join("\n")
      : "No high-risk architectural regressions or migration gaps detected."}

### 5. VALIDATION & TEST COVERAGE SUMMARY
Test Files in PR: ${reviewModel.validation.totalTestFiles} | Coverage: ${Math.round(reviewModel.validation.coverageRatio * 100)}%
${reviewModel.validation.fileTestCoverages.slice(0, 10)
      .map((tc) => `- ${tc.file}: [${tc.status}] ${tc.reason}`)
      .join("\n")}

### 6. DIFF EXCERPTS (Semantic Core Files)
${(() => {
      const targetPaths = new Set(plan.plannedScenes.map((s) => s.targetFilePath).filter(Boolean));
      const prioritized = [...context.patches].sort((a, b) => {
        const aIsTarget = targetPaths.has(a.path) ? 1 : 0;
        const bIsTarget = targetPaths.has(b.path) ? 1 : 0;
        if (aIsTarget !== bIsTarget) return bIsTarget - aIsTarget;
        return (b.additions + b.deletions) - (a.additions + a.deletions);
      });

      const maxPatches = Math.min(prioritized.length, 30);
      const maxPatchChars = 2000;

      return prioritized
        .slice(0, maxPatches)
        .filter((p) => p.patchStatus === "available" || targetPaths.has(p.path))
        .map(
          (p) => `--- File: ${p.path} (${p.status}, +${p.additions}, -${p.deletions}) ---
${p.patch.slice(0, maxPatchChars)}${p.patch.length > maxPatchChars ? "\n... (truncated)" : ""}`
        )
        .join("\n\n");
    })()}
</CANONICAL_PR_REVIEW_MODEL>

Generate the complete, validated 6-scene PRMovie JSON object. Adhere strictly to the 6 planned scenes (${plannedTypes}).`;

  return { systemPrompt, userPrompt };
}

function escapeJson(str: string): string {
  return (str || "").replace(/"/g, '\\"').replace(/\n/g, " ");
}

