<div align="center">

# PullMotion

**Turn 40-file pull requests into animated, 6-scene review storyboards.**

Code review shouldn't feel like reconstructing an architectural blueprint from a pile of scattered bricks.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-8-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169e1?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Upstash Redis](https://img.shields.io/badge/Upstash-Redis-1dc468?style=flat-square&logo=redis)](https://upstash.com)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6c47ff?style=flat-square&logo=clerk)](https://clerk.com)
[![Vitest](https://img.shields.io/badge/Tests-69_Passed-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Live Demo](https://pullmotion.dev) · [How It Works](#how-it-works) · [The 6-Scene Storyboard](#the-6-scene-storyboard) · [Quickstart](#quickstart)

</div>

---

## The Problem

You open a GitHub pull request with 47 changed files.

GitHub sorts them alphabetically: an auto-generated type file first, a stylesheet second, a database migration in the middle, and the core business logic at the very bottom. You spend 45 minutes clicking back and forth between tabs, reconstructing the call chain in your head, and trying to figure out what actually changed.

We built **PullMotion** to fix that.

PullMotion analyzes the entire pull request, maps the execution flow, filters out boilerplate churn, and presents the diff as a **guided 6-scene storyboard**. Every claim and diagram node links directly to exact line numbers in the GitHub diff.

---

## How It Works

PullMotion doesn't just send raw diffs to an LLM. It runs a deterministic static analysis pipeline first: parsing AST symbols across 11+ languages, computing topological dependencies, scoring blast radius, and building an intermediate review model (`PRReviewModel`). When the AI generates a storyboard, our validation firewall deterministically verifies every referenced file, symbol, and line citation against the AST before rendering.

```mermaid
flowchart LR
    A[GitHub PR URL] --> B[Octokit Fetcher\nDiffs & Patches]
    B --> C[Polyglot AST &\nDependency Graph]
    C --> D[Review Model (IR)\nBlast Radius & Risks]
    D --> E[Multi-Key LLM Pool\nGemini / OpenAI]
    E --> F[Hallucination Firewall\nAST Verification]
    F --> G[🎬 Interactive Studio\nTimeline & Diffs]
```

---

## The 6-Scene Storyboard

Every pull request is automatically compiled into a structured 6-stage review experience:

| # | Scene | Value |
|:---:|:---|:---|
| **1** | **Executive Overview** | Problem statement, PR metrics, architectural impact summary, and contract verdict. |
| **2** | **Architecture & Data Flow** | Interactive Before/After node-edge diagram comparing system topologies. |
| **3** | **Code Walkthrough** | Reviewer-prioritized diffs (High/Med/Low), symbol shifts, invariant changes, and watch-outs. |
| **4** | **Domain Breakdown** | Categorized matrix across features, APIs, schemas, configs, and tests. |
| **5** | **File Manifest** | Complete file catalog with additions, deletions, and risk levels. |
| **6** | **Action Plan & Checklist** | Evidence-backed assertions (facts, risks, questions) with an automated review checklist. |

---

## Key Capabilities

### 🔬 Deterministic Static Analysis
- **Polyglot Symbol Extraction**: Lexical AST parsing across TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, C#, C++, Ruby, and SQL.
- **Topological Review Ordering**: Diffs are sequenced in logical dependency order (Schema → Core Logic → Endpoints → UI → Tests) instead of alphabetical sorting.
- **4-State Test Matrix**: Intelligently classifies test coverage as `TEST_EXISTS`, `TEST_MISSING`, `TEST_NOT_ANALYZED`, or `TEST_UNAVAILABLE` to eliminate false negatives.

### 🛡️ Zero-Hallucination Firewall
- **AST Grounding**: Validates that every file, function, and snippet cited by the AI actually exists in the PR.
- **Anti-Fabrication Filters**: Regex engines automatically reject ungrounded performance claims (*"improves speed by 40%"*) and phantom infrastructure (*Kafka, Redis, Kubernetes*) unless present in the codebase.
- **Self-Healing Retry Loop**: Any schema or semantic failure automatically triggers a targeted 1-step repair prompt.

### 🎬 Studio Review Workspace
- **Sub-Millisecond Timeline**: Smooth playback powered by `requestAnimationFrame` with 1x, 1.5x, and 2x speed multipliers.
- **Fullscreen Presentation Mode**: Built for team standups, sprint reviews, and architecture syncs with keyboard hotkeys (<kbd>Space</kbd>, <kbd>←</kbd>, <kbd>→</kbd>, <kbd>Esc</kbd>).
- **Line-Level Citations**: Click any node or assertion to open the evidence drawer with 1-click links to GitHub diff lines.
- **5 Accent Themes**: Purple, Blue, Teal, Amber, and Pink with full dark and light mode support.

### ⚡ Infrastructure & Privacy
- **Multi-Key Failover Pool**: Automatic round-robin cycling and failover across Google Gemini and OpenAI keys.
- **Two-Tier Caching**: High-speed Upstash Redis caching for PR diffs and PostgreSQL persistence for generated storyboards.
- **Zero-Storage Privacy**: Diffs are processed strictly in ephemeral RAM and never persisted to disk or used for AI training.

---

## Quickstart

### Prerequisites
- Node.js >= 20
- PostgreSQL >= 15
- GitHub Personal Access Token (`public_repo` scope)
- Upstash Redis & Clerk accounts

### 1. Clone & Install
```bash
git clone https://github.com/irajatsharma-10/pullmotion.git
cd pullmotion
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Add your credentials to `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prmovie"
GITHUB_TOKEN="ghp_your_token_here"
GEMINI_API_KEYS="AIzaSyA...,AIzaSyB..."
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize & Run
```bash
npm run contract:emit
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start reviewing.

---

## Testing

```bash
# Run unit & integration test suites (69 tests)
npm test

# Run tests in watch mode
npm run test:watch
```

---

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Motion
- **Database & Cache**: Prisma 8, PostgreSQL, Upstash Redis
- **Auth & Ingestion**: Clerk, Octokit (with retry and throttle plugins)
- **AI Engine**: Google Gemini (2.0 Flash / 1.5 Flash), OpenAI (GPT-4o), Zod

---

## License

Distributed under the [MIT License](LICENSE).

<div align="center">

Built for engineers who respect their own time.<br/>
**[pullmotion.dev](https://pullmotion.dev)**

</div>
