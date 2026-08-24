# PullMotion

PullMotion is an open-source developer review accelerator that transforms complex, multi-file GitHub pull requests into animated, evidence-grounded architectural storyboards.

Instead of navigating disconnected diffs in alphabetical order, PullMotion parses AST semantics, builds a topological dependency graph, identifies breaking changes, and generates an interactive 6-scene review flow with 100% line-level citations back to the source repository.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-8-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169e1?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Upstash Redis](https://img.shields.io/badge/Upstash-Redis-1dc468?style=flat-square&logo=redis)](https://upstash.com)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6c47ff?style=flat-square&logo=clerk)](https://clerk.com)
[![Vitest](https://img.shields.io/badge/Tests-69_Passed-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## Architectural Motivation

Reviewing pull requests containing dozens of modified files presents significant cognitive challenges:

- **Alphabetical file sorting obscures execution order**: Reviewers are forced to jump arbitrarily between configurations, views, and data models without understanding the root invocation paths.
- **Signal-to-noise ratio is degraded**: Structural refactors, lockfiles, and auto-generated boilerplate drown out core business logic and contract changes.
- **Blast radius is invisible**: Understanding which downstream consumers or APIs are impacted requires manual cross-referencing across the codebase.
- **Unverified AI generation introduces hallucinations**: Generic LLM review summaries frequently fabricate performance metrics, invent external infrastructure, or cite non-existent files.

PullMotion addresses these challenges by introducing a **deterministic static analysis pipeline** that builds an intermediate review representation (`PRReviewModel`) before generating narrative scenes, followed by a **deterministic validation firewall** that rejects ungrounded claims.

---

## End-to-End Analysis Pipeline

The following diagram illustrates how raw GitHub pull request data flows through PullMotion's ingestion, analysis, generation, validation, and presentation tiers:

```mermaid
flowchart TD
    subgraph Ingestion ["1. Ingestion & Cache Check"]
        PR_URL["GitHub PR URL"] --> URL_Parser["URL Parser & Validator"]
        URL_Parser --> SourceHash["Compute Source Hash (Head SHA + Diff)"]
        SourceHash --> DB_Check{"Exists in PostgreSQL\nor Upstash Redis?"}
    end

    subgraph StaticAnalysis ["2. Deterministic Static Analysis Engine"]
        DB_Check -- "Cache Miss" --> Octokit["Octokit Fetcher (Diffs, Commits, File Contents)"]
        Octokit --> Polyglot["Polyglot Lexical Scanner (11+ Languages)"]
        Polyglot --> DepGraph["Topological Dependency Graph Builder"]
        DepGraph --> RiskEngine["Blast Radius & Security Risk Analyzer"]
        RiskEngine --> TestEngine["4-State Test Existence Evaluator"]
        TestEngine --> ReviewModel["Canonical PRReviewModel (IR)"]
    end

    subgraph LLMOrchestration ["3. Grounded Story Planning & Validation"]
        ReviewModel --> StoryPlanner["LLM Story Planner (Multi-Key Pool)"]
        StoryPlanner --> RawOutput["Candidate JSON Storyboard"]
        RawOutput --> SchemaCheck{"Zod Schema Valid?"}
        SchemaCheck -- Yes --> ASTCheck{"Deterministic Semantic\nValidation (validatePRMovie)"}
        SchemaCheck -- No --> RepairLoop["1-Step Error-Feedback Self-Healing Loop"]
        ASTCheck -- "Hallucination Detected" --> RepairLoop
        RepairLoop --> StoryPlanner
    end

    subgraph Delivery ["4. Persistence & Studio Playback"]
        ASTCheck -- "100% Validated" --> DB_Write["Persist Movie to PostgreSQL"]
        DB_Check -- "Cache Hit" --> StudioViewer["Studio Presentation Workspace"]
        DB_Write --> StudioViewer
    end
```

---

## Pipeline Execution Stages

### 1. Ingestion & Deterministic Hashing
When a pull request URL is submitted, PullMotion computes a SHA-256 hash across the repository coordinates, the target pull request number, and the commit `headSha`. If a movie has previously been generated for this exact commit state, it is immediately served from PostgreSQL, eliminating redundant LLM round-trips.

### 2. Polyglot Static Analysis & AST Symbol Extraction
For uncached pull requests, PullMotion fetches raw unified diffs, commits, and base/head file patches via Octokit. The polyglot scanner performs lightweight lexical parsing across 11+ languages to extract:
- Symbol definitions (classes, functions, methods, structs, interfaces, enums).
- Export and import contracts.
- Invariant changes and modified function signatures.
- Cross-file dependency edges.

Supported languages include **TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, C#, C/C++, Ruby, and SQL**.

### 3. Reviewer Priority & Blast Radius Assessment
Modified files are classified into cognitive priority tiers:
- **`HIGH` Priority**: Core architectural components, schema migrations, security-sensitive paths (`auth`, `crypto`, `payment`, `middleware`), and breaking API contracts.
- **`MEDIUM` Priority**: Supporting business logic, internal controllers, and feature components.
- **`LOW` Priority**: Documentation, tests, formatting, and boilerplate configurations.

### 4. 4-State Test Existence Evaluation
To avoid converting missing test evidence into false negative assertions, PullMotion evaluates test coverage using a 4-state epistemological model:
- `TEST_EXISTS`: Verified test assertions covering modified symbols exist within the PR diff.
- `TEST_MISSING`: Critical business logic was modified with zero accompanying test changes.
- `TEST_NOT_ANALYZED`: Documentation, configs, or cosmetic modifications where unit tests are not applicable.
- `TEST_UNAVAILABLE`: The PR patch is partial or relies on test suites located outside the diff context.

### 5. Grounded Storyboard Generation
The canonical `PRReviewModel` is compiled into a structured prompt for the LLM Story Planner. PullMotion supports multi-key pools across **Google Gemini (`gemini-2.0-flash`, `gemini-1.5-flash`)** and **OpenAI (`gpt-4o`)** with automatic round-robin failover and rate-limit mitigation.

### 6. Hallucination Firewall & Self-Healing Loop
Candidate storyboards pass through a two-stage validation gate:
1. **Zod Runtime Schema Validation**: Verifies complete structure, scene types, durations, and field boundaries.
2. **Deterministic Semantic Validation (`validatePRMovie`)**:
   - Verifies that every referenced file exists in the actual PR diff.
   - Rejects ungrounded infrastructure terms (`kafka`, `rabbitmq`, `celery`, `dynamodb`, `k8s`) unless explicitly present in the AST or diff.
   - Rejects fabricated performance metric patterns (e.g., *"reduced latency by 40%"*, *"2x speedup"*) unless directly stated in PR commit metadata.
   - Ensures valid line ranges for all code citations.

If validation fails, an automated 1-step self-healing loop constructs a targeted correction prompt containing the precise validation errors, obtaining a compliant output before persistence.

---

## The 6-Scene Storyboard Framework

PullMotion outputs a standardized 6-stage storyboard designed for code review:

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   SCENE 1    │   SCENE 2    │   SCENE 3    │   SCENE 4    │   SCENE 5    │   SCENE 6    │
│  Executive   │ Before/After │     Code     │    Domain    │     File     │ Action Plan  │
│   Overview   │ Architecture │ Walkthrough  │  Breakdown   │   Manifest   │  & Checklist │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

| Scene | Identifier | Focus | Output Components |
|:---:|:---|:---|:---|
| **1** | `overview` | Executive Summary | Author metadata, +/- diff counts, problem statement, architectural impact summary, and contract verdict. |
| **2** | `before_after` | Data Flow & Topology | Interactive Before/After node-edge diagrams mapping clients, APIs, services, and databases with lifecycle steps. |
| **3** | `code_changes` | Prioritized Diffs | High/Medium/Low priority code snippets with affected symbols, invariant changes, security flags, and reviewer watch-outs. |
| **4** | `change_breakdown` | Domain Matrix | Categorized breakdown of changes across features, APIs, database schemas, dependencies, configs, and refactors. |
| **5** | `files_changed` | File Catalog | Complete file manifest showing additions, deletions, modification statuses, and priority flags. |
| **6** | `summary` | Reviewer Synthesis | Evidence-grounded assertions (`FACT`, `INFERENCE`, `RISK`, `QUESTION`), confidence levels, and automated verification checklist. |

---

## Studio Playback & Presentation Engine

PullMotion features an interactive review studio built with `motion` (Framer Motion) and custom React hooks:

- **Sub-Millisecond Timeline Synchronization**: Playback state is driven by a `requestAnimationFrame` loop with precise timestamp seeking and speed multipliers (`1x`, `1.5x`, `2x`).
- **Fullscreen Presentation Overlay**: Designed for engineering team standups, sprint reviews, and architectural reviews with dedicated keyboard controls.
- **Evidence Drawer**: Clicking any diagram node or claim slides out a citation drawer with direct links to line-specific GitHub diffs.
- **Accent Theming**: Supports 5 studio themes (`purple`, `blue`, `teal`, `amber`, `pink`) alongside system-level dark and light modes.

### Keyboard Shortcuts

| Shortcut | Action | Context |
|:---|:---|:---|
| <kbd>Space</kbd> | Toggle Play / Pause | Studio Workspace & Presentation Mode |
| <kbd>←</kbd> | Seek Backward (-5 seconds) | Studio Workspace & Presentation Mode |
| <kbd>→</kbd> | Seek Forward (+5 seconds) | Studio Workspace & Presentation Mode |
| <kbd>Esc</kbd> | Exit Fullscreen Mode | Presentation Overlay |
| <kbd>1</kbd> / <kbd>2</kbd> | Switch Playback Speed (1x / 2x) | Studio Timeline |

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **Web Framework** | [Next.js](https://nextjs.org) | `16.3.1` | App Router, Server Actions, streaming API routes |
| **UI Library** | [React](https://react.dev) | `19.2.8` | Concurrent UI rendering and component hierarchy |
| **Language** | [TypeScript](https://www.typescriptlang.org) | `5.x` | End-to-end type safety and static contracts |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | `v4` | Design tokens and responsive layout utilities |
| **Animation** | [Motion](https://motion.dev) | `^13.1.0` | Graph node layout transitions and timeline animations |
| **Database ORM** | [Prisma 8](https://www.prisma.io) | `^8.0.0-rc.4` | PostgreSQL contract definition and query client |
| **Database** | [PostgreSQL](https://www.postgresql.org) | `15+` | Relational storage for movies and cached PR metadata |
| **Caching & Limits** | [Upstash Redis](https://upstash.com) | `^1.38.2` | Serverless REST caching and sliding-window rate limiting |
| **Authentication** | [Clerk](https://clerk.com) | `^7.7.8` | User authentication, sessions, and route middleware |
| **GitHub Client** | [Octokit](https://github.com/octokit) | `^5.0.5` | GitHub REST & Diff APIs with retry and throttle plugins |
| **Schema Validation** | [Zod](https://zod.dev) | `^4.4.3` | Runtime schema enforcement for API payloads and LLM outputs |
| **Testing** | [Vitest](https://vitest.dev) | `^4.1.11` | Unit and integration test runner |

---

## Project Structure

```
pullmotion/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout with Clerk & Theme providers
│   │   ├── page.tsx                 # Marketing landing page
│   │   ├── [owner]/[repo]/[pr]/     # Dynamic PR review studio route
│   │   └── api/
│   │       ├── pr/                  # POST /api/pr (PR fetcher & diff cache)
│   │       └── movies/              # POST /api/movies & GET /api/movies/:movieId
│   ├── components/
│   │   ├── landing/                 # Landing page sections & showcases
│   │   ├── movie/                   # SceneRenderer & EvidencePanel
│   │   │   └── scenes/              # Scene components (Overview, Architecture, Diffs, etc.)
│   │   ├── studio/                  # StudioWorkspace, Timeline, PresentationOverlay
│   │   └── theme/                   # Theme toggle and color management
│   ├── hooks/
│   │   ├── useMoviePlayback.ts      # RAF playback loop, seeking, speed control
│   │   └── useMovieGeneration.ts    # PR fetch state and analysis pipeline hooks
│   ├── lib/
│   │   ├── ai/                      # LLM Planner, Prompt Builder, Multi-Key Pool
│   │   ├── analysis/                # Polyglot Scanner, Dependency Graph, Risk Analyzer
│   │   ├── cache/                   # Upstash Redis PR caching layer
│   │   ├── db/                      # Prisma query helpers
│   │   ├── github/                  # Octokit client with retry & error handling
│   │   ├── movie/                   # URL parser, deterministic source hash, fixtures
│   │   └── rate-limit/              # IP-based sliding window rate limiter
│   ├── prisma/
│   │   ├── contract.prisma          # Database schema (Movie & CachedPR models)
│   │   └── db.ts                    # Prisma client instance
│   └── types/                       # Shared TypeScript interfaces & Zod schemas
│       ├── review-model.ts          # Canonical PRReviewModel definition
│       ├── scenes.ts                # Scene payload interfaces
│       └── schemas.ts               # Runtime validation schemas
├── tests/
│   ├── integration/                 # Octokit and API integration tests
│   └── unit/                        # AST, Polyglot, Diff, Validator, & Rate-limit tests
├── prisma.config.ts                 # Prisma 8 contract and migration config
├── vitest.config.ts                 # Test suite configuration
├── next.config.ts                   # Next.js configuration
└── package.json
```

---

## Quickstart

### Prerequisites

- **Node.js**: `v20.0.0` or higher
- **PostgreSQL**: `v15.0` or higher (local or managed via Supabase / Neon)
- **GitHub Token**: Personal Access Token with `public_repo` scope
- **Upstash Redis**: Serverless Redis database
- **Clerk**: Authentication project keys

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/irajatsharma-10/pullmotion.git
cd pullmotion
npm install
```

### 2. Configure Environment Variables

Create a `.env` file based on the template:

```bash
cp .env.example .env
```

Configure your credentials in `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prmovie"

# GitHub API
GITHUB_TOKEN="ghp_your_github_token_here"

# AI Story Engine (comma-separated keys for automatic round-robin failover)
GEMINI_API_KEYS="AIzaSyA...,AIzaSyB..."
OPENAI_API_KEYS="sk-proj-..."

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize the Database

Emit the Prisma contract and apply migrations:

```bash
npm run contract:emit
```

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Quality Assurance

PullMotion includes 18 test suites covering unit and integration scenarios:

```bash
# Execute all test suites once
npm test

# Run tests in interactive watch mode
npm run test:watch
```

### Tested Domains
- **Polyglot AST Scanners**: Syntax parsing across TypeScript, Python, Go, Rust, Java, C#, and Ruby.
- **Topological Dependency Graph**: Graph traversal, root-to-leaf ordering, and symbol resolution.
- **Hallucination Firewall**: Rejection of uncited infrastructure keywords, phantom metrics, and missing file citations.
- **Diff & Patch Processing**: Unified git diff chunk parsing, binary file filtering, and hunk line mapping.
- **Rate Limiting & Caching**: Sliding window IP quotas and deterministic SHA-256 source hash generation.
- **Playback Controls**: RequestAnimationFrame stepping, time boundary clamping, and hotkey actions.

---

## Security & Privacy

- **Zero-Storage Execution**: Source code diffs and file patches are processed exclusively in ephemeral memory and are never written to disk or used for machine learning training.
- **Deterministic Deduplication**: Storyboards are cached against a SHA-256 hash of the PR `headSha` and diff content, preventing unnecessary external LLM calls.
- **Sliding-Window Rate Limiting**: Upstash Redis sliding-window limiters protect all public ingestion endpoints against abuse.

---

## Contributing

1. Fork the repository on GitHub.
2. Create a feature branch (`git checkout -b feat/my-feature`).
3. Ensure all tests pass (`npm test`).
4. Commit your changes (`git commit -m 'feat: add support for Elixir AST parsing'`).
5. Push to your fork (`git push origin feat/my-feature`).
6. Submit a Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE).
