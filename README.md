<div align="center">

# PullMotion

### The Visual Pull Request Studio & Architectural Review Accelerator

Turn complex multi-file pull requests into interactive, evidence-backed review storyboards.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-8-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169e1?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Upstash Redis](https://img.shields.io/badge/Upstash-Redis-1dc468?style=flat-square&logo=redis)](https://upstash.com)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6c47ff?style=flat-square&logo=clerk)](https://clerk.com)
[![Vitest](https://img.shields.io/badge/Tests-69_Passed-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Live Demo](https://pullmotion.dev) &bull; [Overview](#overview) &bull; [Architecture](#architecture) &bull; [Review Framework](#the-6-scene-review-framework) &bull; [Capabilities](#key-capabilities) &bull; [Quickstart](#getting-started) &bull; [Configuration](#configuration)

</div>

---

## Overview

Modern code review is bottlenecked by cognitive fragmentation. In large pull requests, GitHub displays files in alphabetical order, forcing reviewers to manually reconstruct dependency graphs, trace data flows across layers, and distinguish critical logic from routine boilerplate.

**PullMotion** resolves this by introducing a deterministic static analysis and visualization pipeline:

- **Dependency-First Reviewing**: Sequences diffs in topological execution order (Schema &rarr; Core Logic &rarr; API Endpoints &rarr; UI &rarr; Tests) rather than alphabetical order.
- **100% Line-Level Citations**: Every claim, diagram node, and code snippet links directly to line numbers in the GitHub diff.
- **Deterministic Hallucination Firewall**: Validates generated storyboards against AST symbol extractions, automatically rejecting phantom infrastructure or ungrounded assertions.
- **Zero-Storage Architecture**: Processes diffs purely in ephemeral memory with zero persistence of repository source code.

---

## Architecture

PullMotion couples lightweight static analysis with a multi-key AI orchestration layer and a deterministic validation gate:

```mermaid
flowchart LR
    A[GitHub PR URL] --> B[Octokit Fetcher\nUnified Diffs & Patches]
    B --> C[Polyglot Lexical Scanner\nAST Symbols & Contracts]
    C --> D[Topological Dependency Graph\nBlast Radius & Priorities]
    D --> E[Canonical PRReviewModel\nStructured Review IR]
    E --> F[Multi-Key LLM Pool\nGemini / OpenAI]
    F --> G[Deterministic Firewall\nAST Grounding & Schema]
    G --> H[Interactive Studio\nTimeline & Evidence Drawer]
```

### Pipeline Lifecycle

1. **Ingestion & Cache Verification**: Calculates a SHA-256 source hash across repository coordinates, pull number, and commit `headSha`. Cached records in PostgreSQL/Upstash are returned instantly.
2. **Polyglot Lexical Parsing**: Scans diffs across 11+ languages to extract functions, classes, structs, interfaces, imports, exports, and invariant shifts.
3. **Blast Radius & Priority Scoring**: Classifies files into `HIGH`, `MEDIUM`, and `LOW` review priorities based on architectural criticality (e.g., auth, migrations, breaking APIs).
4. **4-State Test Evaluation**: Distinguishes between `TEST_EXISTS`, `TEST_MISSING`, `TEST_NOT_ANALYZED`, and `TEST_UNAVAILABLE` to preserve epistemological certainty.
5. **Grounded AI Generation**: Compiles the `PRReviewModel` into structured storyboard scenes using low-temperature LLM generation with multi-key failover.
6. **Deterministic Validation Gate**: Rejects unbacked infrastructure keywords, regex-filters fabricated performance metrics, verifies line ranges, and executes automated self-healing if needed.

---

## The 6-Scene Review Framework

PullMotion synthesizes code changes into a standardized 6-stage narrative:

| # | Scene | Reviewer Deliverables |
|:---:|:---|:---|
| **1** | **Executive Overview** | Problem statement, PR metrics, architectural impact summary, and contract verdict. |
| **2** | **Architecture & Data Flow** | Interactive Before/After node-edge diagrams mapping client, API, service, and database interactions. |
| **3** | **Code Walkthrough** | Prioritized diff walkthrough (High/Med/Low) with symbol shifts, invariant changes, and watch-outs. |
| **4** | **Domain Breakdown** | Categorized change matrix across features, APIs, database schemas, configurations, and tests. |
| **5** | **File Manifest** | Complete catalog of affected files with addition/deletion counts and risk ratings. |
| **6** | **Action Plan & Checklist** | Evidence-grounded assertions (facts, risks, questions) paired with an automated verification checklist. |

---

## Key Capabilities

### Deterministic Static Analysis
- **Polyglot Symbol Extraction**: Fast lexical scanning for TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, C#, C++, Ruby, and SQL.
- **Topological Ordering**: Reconstructs true call chains so reviewers evaluate root dependencies before dependent UI components.
- **Signal vs. Noise Separation**: Automatically isolates business logic from lockfiles, minified bundles, and generated artifacts.

### Validation Firewall & Grounding
- **AST Cross-Referencing**: Ensures every file, symbol, and code snippet cited in the storyboard exists in the source diff.
- **Anti-Hallucination Regex Engine**: Automatically rejects fabricated performance claims (*"reduces latency by 40%"*) and phantom services unless present in commit metadata.
- **1-Step Self-Healing Loop**: Feeds validation diagnostics back to the LLM for immediate schema and semantic correction.

### Studio Playback Engine
- **Sub-Millisecond Timeline**: Synchronized playback powered by a `requestAnimationFrame` loop with 1x, 1.5x, and 2x speed multipliers.
- **Presentation Overlay**: Fullscreen presentation mode with keyboard navigation (<kbd>Space</kbd>, <kbd>&larr;</kbd>, <kbd>&rarr;</kbd>, <kbd>Esc</kbd>) for team reviews.
- **Evidence Drawer**: Slide-out panel providing direct 1-click links to GitHub diff line numbers.
- **Accent Theming**: 5 studio color palettes (Purple, Blue, Teal, Amber, Pink) with full dark and light mode support.

### High Availability & Security
- **Multi-Key Failover**: Round-robin pooling and automatic failover across Google Gemini (`gemini-2.0-flash`, `gemini-1.5-flash`) and OpenAI (`gpt-4o`).
- **Two-Tier Caching**: High-speed Upstash Redis caching for PR diffs and PostgreSQL persistence for generated storyboards.
- **Zero-Storage Guarantee**: Ephemeral processing ensures repository code is never persisted to disk or used for model training.

---

## Getting Started

### Prerequisites
- Node.js &gt;= 20.0.0
- PostgreSQL &gt;= 15.0
- GitHub Personal Access Token (`public_repo` scope)
- Upstash Redis &amp; Clerk accounts

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

Edit `.env` and provide your credentials (see [Configuration](#configuration)).

### 3. Initialize Database & Start Server
```bash
npm run contract:emit
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration

| Parameter | Required | Description | Example |
|:---|:---:|:---|:---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/prmovie` |
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token (5,000 req/hr) | `ghp_xxxxxxxxxxxxxxxxxxxx` |
| `GEMINI_API_KEYS` | Yes | Comma-separated Gemini API keys for failover | `AIzaSyA...,AIzaSyB...` |
| `OPENAI_API_KEYS` | Optional | Comma-separated OpenAI API keys for fallback | `sk-proj-xxxxxxxxxxxx` |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST endpoint URL | `https://your-instance.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis REST token | `your_upstash_token` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key | `pk_test_xxxxxxxxxxxxxxxx` |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key | `sk_test_xxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public application URL | `http://localhost:3000` |

---

## Testing & Quality Assurance

PullMotion includes 18 unit and integration test suites:

```bash
# Execute test suite (69 tests)
npm test

# Run tests in watch mode
npm run test:watch
```

### Coverage Scope
- **Polyglot AST Scanners**: Syntax parsing across 11+ programming languages.
- **Topological Dependency Graph**: Acyclic traversal and symbol resolution.
- **Hallucination Firewall**: Rejection of uncited infrastructure keywords and phantom metrics.
- **Playback Controls**: RequestAnimationFrame stepping, boundary clamping, and hotkey listeners.

---

## Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org) (App Router), [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [Motion](https://motion.dev)
- **Database & Cache**: [Prisma 8](https://www.prisma.io), [PostgreSQL](https://www.postgresql.org), [Upstash Redis](https://upstash.com)
- **Authentication**: [Clerk](https://clerk.com)
- **GitHub Integration**: [Octokit](https://github.com/octokit) (with retry and throttle plugins)
- **AI Engine**: Google Gemini (2.0 Flash / 1.5 Flash), OpenAI (GPT-4o), [Zod](https://zod.dev)
- **Testing**: [Vitest](https://vitest.dev)

---

## License

Distributed under the [MIT License](LICENSE).

<div align="center">

Built for engineering teams that prioritize thorough, efficient, and architectural code reviews.<br/>
**[pullmotion.dev](https://pullmotion.dev)**

</div>
