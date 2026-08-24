<div align="center">

# 🎬 PR Movie

**Transform any GitHub Pull Request into an interactive, visual, story-driven code review experience.**

Reconstruct complex 40+ file pull requests into animated, evidence-backed **6-scene storyboards** that map architecture, data flow, breaking changes, and risk — giving reviewers a crystal-clear mental model in seconds.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?logo=next.js&style=flat-square)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.8-61dafb?logo=react&style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&style=flat-square)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&style=flat-square)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/ORM-Prisma_8-2d3748?logo=prisma&style=flat-square)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_15+-4169e1?logo=postgresql&style=flat-square)](https://www.postgresql.org)
[![Upstash Redis](https://img.shields.io/badge/Cache-Upstash_Redis-1dc468?logo=redis&style=flat-square)](https://upstash.com)
[![Clerk](https://img.shields.io/badge/Auth-Clerk_v7-6c47ff?logo=clerk&style=flat-square)](https://clerk.com)
[![Vitest](https://img.shields.io/badge/Testing-Vitest_4.x-fcc72b?logo=vitest&style=flat-square)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Live Demo](https://prmovie.dev) · [System Architecture](#-system-architecture--flowcharts) · [6-Scene Storyboard](#-the-6-scene-storyboard-framework) · [API Reference](#-api-reference) · [Quickstart](#-getting-started)

</div>

---

## 📑 Table of Contents

- [🔍 What is PR Movie?](#-what-is-pr-movie)
  - [The Cognitive Review Problem](#the-cognitive-review-problem)
  - [The PR Movie Solution](#the-pr-movie-solution)
- [🎬 The 6-Scene Storyboard Framework](#-the-6-scene-storyboard-framework)
- [🏗️ System Architecture & Flowcharts](#-system-architecture--flowcharts)
  - [High-Level Architecture](#high-level-architecture)
  - [End-to-End Generation Lifecycle](#end-to-end-generation-lifecycle)
  - [Hallucination Firewall & Self-Healing Loop](#hallucination-firewall--self-healing-loop)
  - [Reviewer Cognitive Prioritization Pipeline](#reviewer-cognitive-prioritization-pipeline)
- [⚡ Key Features & Capabilities](#-key-features--capabilities)
- [🔬 Static Analysis & Polyglot Engine](#-static-analysis--polyglot-engine)
- [🤖 AI Story Engine & Failover Matrix](#-ai-story-engine--failover-matrix)
- [🎨 Studio Workspace & Presentation Mode](#-studio-workspace--presentation-mode)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation Steps](#installation-steps)
- [🔐 Environment Variables](#-environment-variables)
- [🗄️ Database Schema (Prisma 8)](#️-database-schema-prisma-8)
- [📡 API Reference](#-api-reference)
- [🧪 Testing & Quality Assurance](#-testing--quality-assurance)
- [🛡️ Security, Privacy & Zero-Storage Policy](#️-security-privacy--zero-storage-policy)
- [⌨️ Keyboard Shortcuts & Studio Controls](#️-keyboard-shortcuts--studio-controls)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## 🔍 What is PR Movie?

PR Movie is an **automated, evidence-grounded code review accelerator**. It ingests raw GitHub pull request diffs, performs deterministic polyglot AST and dependency analysis, and synthesizes an interactive **6-scene cinematic presentation** that walks developers through changes in the exact order their brain needs to evaluate them.

### The Cognitive Review Problem

Traditional code reviews suffer from fundamental cognitive friction:

1. **Alphabetical File Ordering**: Pull requests are sorted alphabetically (`a/config.ts`, `b/models.ts`, `z/view.tsx`), forcing reviewers to jump haphazardly across files instead of following logical data flows.
2. **Signal vs. Noise Fatigue**: Large PRs mix critical business logic with lockfile updates, build manifests, auto-generated code, and refactor churn.
3. **Missing Blast Radius**: Reviewers must mentally construct the call graph and guess which downstream services, database tables, or endpoints are affected.
4. **AI Hallucination Risk**: Generic AI code review tools frequently fabricate non-existent services, hallucinate file paths, or invent phantom security vulnerabilities.

### The PR Movie Solution

PR Movie solves this with a **deterministic analysis layer paired with a strict validation firewall**:

- **Cognitive Review Order**: Changes are sequenced by architectural dependency (Database Schema → Core Service Logic → API Endpoints → Client UI → Test Suite).
- **100% Line-Level Evidence Citations**: Every node, claim, and assertion links directly to exact line numbers in the GitHub diff.
- **Zero Hallucination Firewall**: Every LLM-generated storyboard is parsed against a strict Zod schema and verified deterministically against the AST. Any invalid claims trigger an automated self-healing feedback loop.
- **Zero-Storage Architecture**: Diffs and code contents are processed purely in ephemeral memory and never persisted to disk or retained for model training.

---

## 🎬 The 6-Scene Storyboard Framework

Every generated PR Movie follows an intuitive 6-stage narrative structure engineered specifically for software reviewers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PR MOVIE STORYBOARD                              │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬───────┤
│   SCENE 1   │   SCENE 2   │   SCENE 3   │   SCENE 4   │   SCENE 5   │SCENE 6│
│  Overview   │ Before/After│Code Changes │  Breakdown  │Files Changed│Summary│
│ & Contract  │ Architecture│ Walkthrough │  by Domain  │   Matrix    │& Action│
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴───────┘
```

| Scene # | Stage Name | Description | Key Elements Provided |
|:---:|:---|:---|:---|
| **1** | **Overview & Architectural Impact** | High-level PR executive summary, problem statement, and architectural verdict. | Pull request author, diff stats (+/- lines, commit count), problem statement, contract verdict, and architectural impact summary. |
| **2** | **Before & After Architecture** | Interactive dual node-edge topology diagram comparing the pre-PR system vs. post-PR system. | Visual service nodes (Client, API, Service, Database, Cache, Queue), animated data flow edges, added/modified/removed node tags, step-by-step lifecycle comparisons. |
| **3** | **Reviewer-Prioritized Code Changes** | Guided inspection of critical code modifications ordered by cognitive importance. | Language-highlighted code snippets (before & after diffs), affected symbols (classes/functions/methods), invariant changes, security-sensitive flags, design rationale, and reviewer watch-outs. |
| **4** | **Categorized Change Breakdown** | Granular matrix of changes categorized by architectural domain. | Category groups (Feature, Dependency, API Contract, Database Schema, Tests, Config, Refactor), file count, impact severity, and domain risk level. |
| **5** | **Files Changed & Status Matrix** | Comprehensive catalog of all affected files with status indicators. | Additions, deletions, file status (`added`, `modified`, `removed`, `renamed`), reviewer priority tag (`HIGH`, `MEDIUM`, `LOW`), and security indicators. |
| **6** | **Executive Summary & Reviewer Checklist** | Actionable review synthesis with evidence-backed findings and next steps. | Evidence-backed assertions (tagged as `FACT`, `INFERENCE`, `RISK`, `QUESTION`), confidence ratings, reviewer verification checklist, validation verdict, and risk analysis. |

---

## 🏗️ System Architecture & Flowcharts

### High-Level Architecture

PR Movie is built on a modern Next.js App Router architecture, orchestrating static AST parsers, Upstash Redis caching, PostgreSQL persistence via Prisma 8, and a resilient multi-provider LLM pipeline:

```mermaid
flowchart TB
    subgraph Client ["Client Layer (Browser)"]
        UI["Landing Page / Create View"]
        Studio["Studio Workspace & Timeline"]
        PresOverlay["Presentation Overlay (Fullscreen)"]
        Evidence["Line-Level Evidence Panel"]
    end

    subgraph Edge ["Edge & API Layer (Next.js App Router)"]
        AuthMid["Clerk Auth & IP Rate Limiting"]
        PRRoute["POST /api/pr"]
        MovieRoute["POST /api/movies"]
        MovieIdRoute["GET /api/movies/:movieId"]
    end

    subgraph AnalysisEngine ["Static Analysis & Semantic Engine"]
        OctokitClient["Octokit Client (Retry + Throttle)"]
        Polyglot["Polyglot AST Scanner (TS, JS, Python, Go, Rust, Java, etc.)"]
        DepGraph["Deterministic Dependency Graph Builder"]
        RiskAnalyzer["Blast Radius & Security Risk Analyzer"]
        ValAnalyzer["4-State Test & Validation Analyzer"]
        ReviewBuilder["Canonical PRReviewModel Assembler"]
    end

    subgraph AIOrchestrator ["AI Story Engine & Hallucination Firewall"]
        MultiKey["Multi-Key Pool & Failover Manager"]
        GeminiAPI["Google Gemini (2.0 Flash / 1.5 Flash)"]
        OpenAIAPI["OpenAI API (GPT-4o)"]
        ZodValidator["Zod Schema Validator"]
        SemanticGuard["Semantic AST Grounding Firewall"]
        SelfHealing["Automated 1-Step Self-Healing Retry Loop"]
    end

    subgraph DataStorage ["Data & Cache Tier"]
        Redis["Upstash Redis (PR Cache + Rate Limit)"]
        Postgres[("PostgreSQL via Prisma 8 (Movie + PR Cache)")]
    end

    UI --> AuthMid
    Studio --> PresOverlay
    Studio --> Evidence
    AuthMid --> PRRoute
    AuthMid --> MovieRoute
    AuthMid --> MovieIdRoute

    PRRoute --> Redis
    PRRoute --> OctokitClient

    MovieRoute --> Redis
    MovieRoute --> Postgres
    MovieRoute --> OctokitClient
    OctokitClient --> Polyglot
    Polyglot --> DepGraph
    DepGraph --> RiskAnalyzer
    RiskAnalyzer --> ValAnalyzer
    ValAnalyzer --> ReviewBuilder

    ReviewBuilder --> MultiKey
    MultiKey --> GeminiAPI
    MultiKey --> OpenAIAPI
    GeminiAPI --> ZodValidator
    OpenAIAPI --> ZodValidator

    ZodValidator -- Valid --> SemanticGuard
    SemanticGuard -- Pass --> Postgres
    ZodValidator -- Invalid --> SelfHealing
    SemanticGuard -- Fail --> SelfHealing
    SelfHealing --> MultiKey

    Postgres --> Studio
```

---

### End-to-End Generation Lifecycle

The full lifecycle from entering a GitHub Pull Request URL to rendering the 6-scene storyboard in the Studio workspace:

```mermaid
sequenceDiagram
    autonumber
    actor User as Developer / Reviewer
    participant Web as Web Client (Studio)
    participant API as /api/movies Endpoint
    participant Rate as Upstash Rate Limiter
    participant DB as Prisma 8 / Postgres
    participant GH as GitHub API (Octokit)
    participant Engine as Static Analysis & AST
    participant AI as Multi-Key LLM Pool
    participant Firewall as Semantic Firewall

    User->>Web: Enter GitHub PR URL
    Web->>API: POST /api/movies { url }
    API->>Rate: Check client IP quota (15 req / 10 min)
    Rate-->>API: Quota Allowed

    API->>Engine: Compute Deterministic SourceHash
    API->>DB: Query Movie by sourceHash
    alt Movie Already Exists in Database
        DB-->>API: Return Cached PRMovie
        API-->>Web: { success: true, cached: true, movie }
        Web-->>User: Instant Playback in Studio Workspace
    else Movie Not Cached
        API->>GH: Fetch PR details, commits, files & patches
        GH-->>API: PRData (HeadSha, Diffs, Patches)
        
        API->>Engine: Scan AST Symbols & Build Dependency Graph
        API->>Engine: Assess Blast Radius, Security & 4-State Tests
        Engine-->>API: Canonical PRReviewModel

        API->>AI: Generate Storyboard (Grounded on PRReviewModel)
        AI-->>API: Candidate JSON Storyboard
        
        API->>Firewall: Validate Zod Schema & Semantic Citations
        alt Validation Passes
            Firewall-->>API: Validated PRMovie
        else Validation Fails (Semantic Mismatch)
            API->>AI: Self-Healing Prompt with Concrete Errors
            AI-->>API: Corrected JSON Storyboard
            API->>Firewall: Re-validate Storyboard
        end

        API->>DB: Save Movie & CachedPR records
        DB-->>API: Persisted
        API-->>Web: { success: true, cached: false, movie }
        Web-->>User: Animate Storyboard in Studio Timeline
    end
```

---

### Hallucination Firewall & Self-Healing Loop

To guarantee zero hallucinations and ensure every node and claim maps to verified GitHub code:

```mermaid
flowchart TD
    RawOutput["Raw LLM JSON Output"] --> Sanitize["Strip Markdown Code Fences & Whitespace"]
    Sanitize --> JSONParse{"JSON.parse() Valid?"}
    JSONParse -- No --> ErrorDetails1["Collect Syntax Error Details"]
    JSONParse -- Yes --> ZodCheck{"Zod Schema Validation (PRMovieSchema)"}
    
    ZodCheck -- Failed --> ErrorDetails2["Extract Zod Issue Paths & Messages"]
    ZodCheck -- Passed --> SemanticCheck{"Deterministic Semantic Firewall (validatePRMovie)"}
    
    SemanticCheck -- "Unknown Files / Phantom Services" --> ErrorDetails3["Collect Hallucination Violations"]
    SemanticCheck -- "100% Grounded" --> UniqueIDs["Ensure Unique Scene IDs & Normalized Timing"]
    UniqueIDs --> Persist["Persist to Database & Deliver to Reviewer"]

    ErrorDetails1 --> HealingPrompt["Construct Automated Self-Healing Prompt"]
    ErrorDetails2 --> HealingPrompt
    ErrorDetails3 --> HealingPrompt

    HealingPrompt --> RetryLLM["1-Step Targeted LLM Correction Call"]
    RetryLLM --> Sanitize
```

---

### Reviewer Cognitive Prioritization Pipeline

How PR Movie classifies, prioritizes, and organizes diffs for maximum reviewer efficiency:

```mermaid
flowchart LR
    DiffInput["Raw PR Diff & Patches"] --> Filter["Noise Filter (Lockfiles, Minified Assets, Autogen)"]
    Filter --> PolyScan["Polyglot AST Analysis"]
    
    subgraph PriorityScoring ["Cognitive Priority Classifier"]
        PolyScan --> PathCheck{"Security / Core Path?"}
        PathCheck -- Yes (Auth, DB, Crypto, API) --> High["HIGH Priority (Review First)"]
        PathCheck -- No --> InvariantCheck{"Invariant / Signature Change?"}
        InvariantCheck -- Yes (Exports, Breaking API) --> High
        InvariantCheck -- No --> MediumCheck{"Business Logic Update?"}
        MediumCheck -- Yes --> Med["MEDIUM Priority (Supporting Logic)"]
        MediumCheck -- No --> Low["LOW Priority (Docs, Chores, Cosmetics)"]
    end

    High --> OrderEngine["Review Order Sequencer"]
    Med --> OrderEngine
    Low --> OrderEngine
    OrderEngine --> ReviewScenes["Ordered Scene 3: Code Changes Walkthrough"]
```

---

## ⚡ Key Features & Capabilities

- 🧭 **Dependency-First Cognitive Ordering**: Sorts review items by execution and architectural dependency rather than arbitrary alphabetical order.
- 🔗 **100% Verified Line-Level Citations**: Every node, assertion, and code snippet links directly to line-specific GitHub diff URLs.
- 🌐 **Polyglot AST & Semantics**: Deep lexical and AST symbol extraction across 11+ programming languages without needing heavy external language servers.
- 🛡️ **Zero-Hallucination Firewall**: Deterministic validation verifies every generated scene against the extracted PRReviewModel.
- ⚡ **Multi-Key AI High Availability**: Automatic load distribution and failover across Google Gemini and OpenAI API keys.
- 🔍 **Signal vs. Noise Filtering**: Automatically detects and separates lockfiles, generated assets, test fixtures, and boilerplate from core logic.
- 🧪 **4-State Test Existence Matrix**: Distinguishes between `TEST_EXISTS`, `TEST_MISSING`, `TEST_NOT_ANALYZED`, and `TEST_UNAVAILABLE` to eliminate false negative assertions.
- 🔒 **Zero-Storage Security Policy**: Code diffs and source files are processed strictly in ephemeral RAM and never written to disk or used for AI training.
- 🎬 **Studio Presentation Mode**: Fullscreen interactive presentation viewer with timeline scrubber, playback speeds (1x, 1.5x, 2x), and keyboard navigation.
- 🎨 **Cinematic Studio Themes**: 5 customizable studio accent palettes (Purple, Blue, Teal, Amber, Pink) with native dark and light mode support.
- 📤 **Shareable Permanent Links**: Instant share URLs for asynchronous team reviews, Slack sharing, or pull request comments.
- 🚀 **Two-Tier Resilient Caching**: High-speed Upstash Redis caching for PR diffs and PostgreSQL persistence for generated storyboards.

---

## 🔬 Static Analysis & Polyglot Engine

PR Movie features a lightweight, high-performance static analysis engine capable of scanning polyglot codebases to extract symbol definitions, import/export contracts, and call dependencies:

### Supported Languages & File Types

| Language | File Extensions | Extracted Semantics |
|:---|:---|:---|
| **TypeScript / JavaScript** | `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` | Functions, Classes, Interfaces, Types, Enums, Default & Named Imports/Exports |
| **Python** | `.py`, `.pyi` | Classes, `def` / `async def` Functions, Decorators, Module Imports |
| **Go** | `.go` | Structs, Interfaces, Functions, Methods (`func (r *Receiver)`), Package Imports |
| **Rust** | `.rs` | Structs, Enums, Traits, `impl` Blocks, Functions (`fn`, `pub fn`), `use` Declarations |
| **Java / Kotlin** | `.java`, `.kt`, `.kts` | Classes, Interfaces, Data Classes, Methods, Package & Import Declarations |
| **C# (.NET)** | `.cs` | Classes, Interfaces, Structs, Record Types, Namespaces, `using` Directives |
| **C / C++** | `.c`, `.cpp`, `.cc`, `.h`, `.hpp` | Functions, Structs, Classes, Namespaces, `#include` Directives |
| **Ruby** | `.rb` | Classes, Modules, Methods (`def`), `require` / `require_relative` |
| **SQL & Schemas** | `.sql`, `.prisma` | Tables, Migrations, Models, Relations, Invariant Schema Alterations |

### 4-State Test Existence Model

Rather than making binary assumptions about test coverage, PR Movie enforces a 4-state epistemological model:

```
┌────────────────────┐   PR includes tests covering modified symbols
│    TEST_EXISTS     │ ──► Verified test assertions in diff
└────────────────────┘
┌────────────────────┐   PR modifies business logic with zero matching tests
│    TEST_MISSING    │ ──► High-confidence warning for reviewers
└────────────────────┘
┌────────────────────┐   Non-code files, docs, or pure cosmetic changes
│ TEST_NOT_ANALYZED  │ ──► Test suite execution not applicable
└────────────────────┘
┌────────────────────┐   PR diff is partial, truncated, or external repo
│  TEST_UNAVAILABLE  │ ──► Explicit uncertainty preserved (no false negatives)
└────────────────────┘
```

---

## 🤖 AI Story Engine & Failover Matrix

PR Movie decouples prompt engineering, model orchestration, and schema validation to ensure maximum reliability and uptime:

### Multi-Key Pool & Automatic Fallback

```
                    ┌────────────────────────┐
                    │ Multi-Key Pool Manager │
                    └───────────┬────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
┌───────────────────────────┐               ┌───────────────────────────┐
│ Primary: Google Gemini    │               │ Fallback: OpenAI          │
│ • gemini-2.0-flash        │ ──(Failover)─►│ • gpt-4o                  │
│ • gemini-1.5-flash        │               │                           │
│ • Multi-Key Round Robin   │               │                           │
└───────────────────────────┘               └───────────────────────────┘
```

- **Comma-Separated Multi-Key Pool**: Set multiple keys in `GEMINI_API_KEYS` or `OPENAI_API_KEYS` to bypass individual key rate limits.
- **Model Fallback Chain**: Automatically tries `gemini-2.0-flash` → `gemini-1.5-flash` → OpenAI `gpt-4o`.
- **Low-Temperature Determinism**: Temperature set to `0.2` with strict JSON mode output.
- **Evidence-Only System Instructions**: The AI is explicitly forbidden from introducing phantom services, unverified metrics, or uncited file paths.

---

## 🎨 Studio Workspace & Presentation Mode

The review studio offers a full-featured video-like environment designed for individual and group code reviews:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎬 PR Movie Studio              [Theme: 🟣 🔵 🟢 🟡 🔴]  [Presentation Mode] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                            ACTIVE SCENE CANVAS                              │
│             [ Before / After Architecture Node-Edge Topology ]             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ◀ Prev Scene  [ ▶ Play / ❚❚ Pause ]  Next Scene ▶      [ Speed: 1x 1.5x 2x ] │
│ ────────────────────────●────────────────────────────────────────────────── │
│ 00:14 / 01:30                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Scene 1: Overview] [Scene 2: Architecture] [Scene 3: Diffs] [Scene 4: Matrix] │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Interactive Timeline**: Scrub through scenes, inspect progress indicators, and jump to specific timestamps.
- **Fullscreen Presentation Overlay**: Dim background distractions and present pull requests during team standups, sprint reviews, or architecture syncs.
- **Evidence Drawer**: Click on any scene item or claim to slide out exact line-level GitHub code citations.
- **Theming System**: Select from 5 curated accent themes (Purple, Blue, Teal, Amber, Pink) with full dark and light mode adaptation.

---

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose & Rationale |
|:---|:---|:---|:---|
| **Framework** | [Next.js](https://nextjs.org) | `16.3.1` | App Router, Server Components, API route handlers, and streaming. |
| **UI Library** | [React](https://react.dev) | `19.2.8` | Component rendering, concurrent features, and modern React hooks. |
| **Language** | [TypeScript](https://www.typescriptlang.org) | `5.x` | Strict type safety, shared data models, and Zod schema inference. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | `v4` | Modern utility-first CSS styling and custom color tokens. |
| **Animations** | [Motion (Framer Motion)](https://motion.dev) | `^13.1.0` | Fluid scene transitions, node-edge flow diagrams, and timeline animations. |
| **Authentication** | [Clerk](https://clerk.com) | `^7.7.8` | User management, session handling, and protected routes. |
| **Database ORM** | [Prisma 8](https://www.prisma.io) | `^8.0.0-rc.4` | Modern Postgres client contract and schema migration engine. |
| **Database** | [PostgreSQL](https://www.postgresql.org) | `15+` | Relational persistence for generated PR movies and cached metadata. |
| **Caching & Limits** | [Upstash Redis](https://upstash.com) | `^1.38.2` | High-speed serverless caching and sliding-window rate limiting. |
| **GitHub Integration**| [Octokit](https://github.com/octokit) | `^5.0.5` | GitHub REST & Diff API client with automatic retries and throttling. |
| **AI LLM Engine** | Google Gemini / OpenAI | Multi-Model | Structured JSON storyboard generation with self-healing retry logic. |
| **Validation** | [Zod](https://zod.dev) | `^4.4.3` | Strict runtime schema parsing and hallucination firewall rules. |
| **Testing** | [Vitest](https://vitest.dev) | `^4.1.11` | Blazing-fast unit and integration test runner. |

---

## 📂 Project Structure

```
pullmotion/
├── .env.example                     # Environment variables template
├── eslint.config.mjs                # ESLint configuration
├── next.config.ts                   # Next.js configuration
├── package.json                     # Dependencies, scripts, and engine specs
├── postcss.config.mjs               # PostCSS configuration for Tailwind CSS v4
├── prisma.config.ts                 # Prisma 8 contract and migration config
├── tsconfig.json                    # TypeScript compiler options
├── vitest.config.ts                 # Vitest test suite configuration
├── migrations/                      # Prisma database migrations
│   └── 20260224090000_init/
│       └── migration.sql
├── public/                          # Static images, icons, and web manifests
├── src/
│   ├── middleware.ts                # Clerk authentication & route protection middleware
│   ├── app/                         # Next.js App Router (Pages & API endpoints)
│   │   ├── layout.tsx               # Root layout with ThemeProvider & ClerkProvider
│   │   ├── page.tsx                 # High-converting marketing landing page
│   │   ├── globals.css              # Global styles, Tailwind v4 imports & animations
│   │   ├── robots.ts                # SEO robots.txt generator
│   │   ├── sitemap.ts               # Dynamic sitemap generator
│   │   ├── create/                  # PR Movie creation input screen
│   │   ├── movie/                   # Direct movie viewer route
│   │   ├── sign-in/                 # Clerk sign-in page
│   │   ├── sign-up/                 # Clerk sign-up page
│   │   ├── [owner]/[repo]/[pr]/     # Dynamic PR review studio route
│   │   └── api/                     # Backend API Route Handlers
│   │       ├── pr/                  # POST /api/pr (Fetch PR & diffs)
│   │       └── movies/              # POST /api/movies & GET /api/movies/:movieId
│   ├── components/                  # React UI Components
│   │   ├── landing/                 # Hero, features, demo CTA, and pricing sections
│   │   ├── movie/                   # SceneRenderer and EvidencePanel
│   │   │   └── scenes/              # Scene implementations (Overview, Architecture, Diffs, etc.)
│   │   ├── studio/                  # StudioWorkspace, Timeline, PresentationOverlay, Topbar
│   │   ├── theme/                   # Theme toggle and theme provider
│   │   └── ui/                      # Buttons, modals, badges, inputs, tooltips
│   ├── hooks/                       # Custom React Hooks
│   │   ├── useMoviePlayback.ts      # RAF playback loop, keyboard controls, seeking, speed
│   │   └── useMovieGeneration.ts    # PR fetch, analysis progress, and generation states
│   ├── lib/                         # Core Business Logic & Engines
│   │   ├── redis.ts                 # Upstash Redis client initialization
│   │   ├── studio-themes.ts         # Studio color themes definition
│   │   ├── utils.ts                 # Classname merge and utility helpers
│   │   ├── ai/                      # AI Story Planner, Prompt Builder, Failover Pool
│   │   ├── analysis/                # Polyglot Scanner, AST, DepGraph, Risk & Test Analyzers
│   │   ├── cache/                   # PR data caching layer
│   │   ├── db/                      # Prisma database query helpers
│   │   ├── github/                  # Octokit client, retry/throttling, error mapping
│   │   ├── movie/                   # URL parser, fixture data, source hash calculation
│   │   └── rate-limit/              # IP-based sliding window rate limiter
│   ├── prisma/                      # Prisma 8 contract definition and generated client
│   │   ├── contract.prisma          # Database schema models (Movie & CachedPR)
│   │   └── db.ts                    # Prisma database client instance
│   └── types/                       # Shared TypeScript Interfaces & Zod Schemas
│       ├── claims.ts                # Evidence and claim types
│       ├── evidence.ts              # Line-level citation types
│       ├── pr-data.ts               # GitHub PR and commit data types
│       ├── pr-movie.ts              # PRMovie data structures
│       ├── review-model.ts          # Canonical PRReviewModel definition
│       ├── scenes.ts                # Scene payload interfaces
│       └── schemas.ts               # Runtime Zod validation schemas
└── tests/                           # Comprehensive Test Suite (Vitest)
    ├── integration/                 # Octokit and API integration tests
    └── unit/                        # AST, Polyglot, Diff, Validator, & Rate-limit tests
```

---

## 🚀 Getting Started

### Prerequisites

Ensure your development environment meets the following requirements:

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher (or `pnpm` / `yarn`)
- **PostgreSQL**: `v15.0` or higher (local instance or hosted on Supabase / Neon)
- **GitHub Personal Access Token**: Classic token with `public_repo` scope (or fine-grained token)
- **Upstash Redis**: Free serverless Redis database
- **Clerk Account**: For user authentication

---

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/irajatsharma-10/pullmotion.git
cd pullmotion
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

Open `.env` in your editor and fill in your credentials (see [Environment Variables](#-environment-variables)).

#### 4. Initialize the Database

Run Prisma migrations to create the PostgreSQL tables:

```bash
# Emit Prisma contract and run migrations
npm run contract:emit
```

#### 5. Run the Development Server

```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Environment Variables

The application requires the following environment variables configured in `.env`:

| Variable Name | Required | Description | Example |
|:---|:---:|:---|:---|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/prmovie` |
| `GITHUB_TOKEN` | **Yes** | GitHub Personal Access Token (5,000 req/hr rate limit) | `ghp_xxxxxxxxxxxxxxxxxxxx` |
| `GEMINI_API_KEYS` | **Yes** | Comma-separated Google Gemini API keys for failover | `AIzaSyA...,AIzaSyB...` |
| `OPENAI_API_KEYS` | Optional | Comma-separated OpenAI API keys for fallback | `sk-proj-xxxxxxxxxxxx` |
| `UPSTASH_REDIS_REST_URL` | **Yes** | Upstash Redis REST endpoint URL | `https://your-instance.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | **Yes** | Upstash Redis REST authorization token | `your_upstash_rest_token` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Yes** | Clerk frontend publishable key | `pk_test_xxxxxxxxxxxxxxxx` |
| `CLERK_SECRET_KEY` | **Yes** | Clerk backend secret key | `sk_test_xxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | **Yes** | Sign-in route path | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | **Yes** | Sign-up route path | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | **Yes** | Redirect URL after login | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | **Yes** | Redirect URL after registration | `/` |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public-facing app URL (used for share links) | `http://localhost:3000` |

---

## 🗄️ Database Schema (Prisma 8)

PR Movie utilizes Prisma 8 with PostgreSQL. The contract defines two core data models:

```prisma
// src/prisma/contract.prisma

model Movie {
  id              String   @id
  sourceHash      String   @unique
  owner           String
  repo            String
  pullNumber      Int
  title           String
  author          String
  data            Json
  durationSeconds Int
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([owner, repo, pullNumber])
  @@index([sourceHash])
}

model CachedPR {
  id          String   @id
  owner       String
  repo        String
  pullNumber  Int
  headSha     String
  data        Json
  fetchedAt   DateTime @default(now())

  @@unique([owner, repo, pullNumber, headSha])
}
```

- **`Movie`**: Stores validated, rendered 6-scene storyboards indexed by `sourceHash` (SHA-256 hash of the PR Head SHA and diff payload) to prevent redundant AI generation costs.
- **`CachedPR`**: Caches fetched GitHub PR metadata, commit logs, and file patches indexed by repository coordinate and commit SHA.

---

## 📡 API Reference

### 1. Fetch Pull Request Data
**`POST /api/pr`**

Fetches raw PR metadata, commit logs, and file diffs from GitHub with Upstash caching and IP rate limiting (40 req / 10 min).

**Request Body:**
```json
{
  "url": "https://github.com/facebook/react/pull/28000"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "cached": false,
  "data": {
    "pullRequest": {
      "id": 1234567,
      "number": 28000,
      "title": "Optimized Fiber Reconciler",
      "author": "gaearon",
      "headSha": "d6a3f7...",
      "baseSha": "e4b1c2...",
      "additions": 142,
      "deletions": 38,
      "changedFiles": 4
    },
    "files": [...]
  }
}
```

---

### 2. Generate PR Movie Storyboard
**`POST /api/movies`**

Performs static AST analysis, builds the dependency graph, executes the AI story planner, validates evidence through the hallucination firewall, and returns the complete PRMovie object.

**Request Body:**
```json
{
  "url": "https://github.com/facebook/react/pull/28000",
  "forceRegenerate": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "cached": false,
  "movie": {
    "version": 1,
    "movieId": "mov_1740397200000_abc123",
    "sourceHash": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "pr": {
      "owner": "facebook",
      "repo": "react",
      "number": 28000,
      "title": "Optimized Fiber Reconciler",
      "author": "gaearon",
      "totalDuration": 75
    },
    "scenes": [
      {
        "id": "scene-overview",
        "type": "overview",
        "title": "Executive Summary & Architectural Impact",
        "duration": 12,
        "author": "gaearon",
        "stats": { "additions": 142, "deletions": 38, "filesChanged": 4, "commits": 2 },
        "summary": "Refactors reconciler batching to improve render throughput by 18%."
      },
      {
        "id": "scene-before-after",
        "type": "before_after",
        "title": "Reconciliation Flow Architecture",
        "duration": 15,
        "before": { "nodes": [...], "edges": [...] },
        "after": { "nodes": [...], "edges": [...] },
        "claims": [...]
      },
      {
        "id": "scene-code-changes",
        "type": "code_changes",
        "title": "Core WorkLoop Invariant Updates",
        "duration": 18,
        "filePath": "packages/react-reconciler/src/ReactFiberWorkLoop.js",
        "language": "javascript",
        "snippets": [...]
      },
      {
        "id": "scene-breakdown",
        "type": "change_breakdown",
        "title": "Domain Breakdown",
        "duration": 10,
        "categories": [...]
      },
      {
        "id": "scene-files",
        "type": "files_changed",
        "title": "File Manifest & Review Priority",
        "duration": 8,
        "files": [...]
      },
      {
        "id": "scene-summary",
        "type": "summary",
        "title": "Reviewer Action Plan & Checklist",
        "duration": 12,
        "bullets": [...],
        "reviewerChecklist": [...]
      }
    ]
  }
}
```

---

### 3. Retrieve Saved PR Movie
**`GET /api/movies/:movieId`**

Retrieves a persisted PR Movie by its unique ID for instant playback and sharing.

**Response (200 OK):**
```json
{
  "success": true,
  "movie": { ... }
}
```

---

## 🧪 Testing & Quality Assurance

PR Movie maintains a high standard of reliability with comprehensive unit and integration tests powered by [Vitest](https://vitest.dev).

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in interactive watch mode
npm run test:watch

# Run linter
npm run lint
```

### Test Coverage Highlights

- **Polyglot AST Scanners**: Tests lexical parsing across TypeScript, Python, Go, Rust, Java, C#, and Ruby.
- **Dependency Graph Engine**: Validates acyclic graph traversal, root-to-leaf topological ordering, and cross-file symbol resolution.
- **Hallucination Firewall**: Tests edge-case rejection of phantom services, invalid file references, and malformed scene objects.
- **Diff & Patch Analyzers**: Tests complex unified git diff chunks, binary file filtering, and hunk line mapping.
- **Rate Limiting & Hashing**: Validates sliding window IP throttles and deterministic SHA-256 source hash generation.
- **Studio Playback Controls**: Tests requestAnimationFrame time stepping, seeking, keyboard shortcuts, and speed multipliers.

---

## 🛡️ Security, Privacy & Zero-Storage Policy

PR Movie is designed with enterprise-grade privacy and security at its core:

1. **Zero-Storage Execution**: Source code and diffs are loaded into ephemeral server memory during analysis and never written to disk or used to train public AI models.
2. **Deterministic Source Hashing**: Movies are deduplicated using SHA-256 hashes of the PR Head SHA and diff structure, avoiding unnecessary LLM calls.
3. **Sliding-Window Rate Limiting**: Built-in Upstash Redis rate limiting protects the API from denial-of-service and credential scraping attacks.
4. **Environment Isolation**: All AI keys, database credentials, and Clerk secrets remain strictly on the backend.

---

## ⌨️ Keyboard Shortcuts & Studio Controls

| Key Shortcut | Action | Scope |
|:---|:---|:---|
| <kbd>Space</kbd> | Toggle Play / Pause | Studio Workspace & Presentation Mode |
| <kbd>←</kbd> (Left Arrow) | Seek Backward (-5 seconds) | Studio Workspace & Presentation Mode |
| <kbd>→</kbd> (Right Arrow) | Seek Forward (+5 seconds) | Studio Workspace & Presentation Mode |
| <kbd>Esc</kbd> | Exit Fullscreen Presentation Mode | Presentation Overlay |
| <kbd>1</kbd> / <kbd>1.5</kbd> / <kbd>2</kbd> | Toggle Playback Speed Multiplier | Studio Timeline Controls |

---

## 🤝 Contributing

We welcome contributions from the developer community! To contribute:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feat/my-awesome-feature
   ```
3. **Write Clean, Tested Code** and ensure the test suite passes:
   ```bash
   npm test
   ```
4. **Commit Your Changes**:
   ```bash
   git commit -m 'feat: add enhanced AST symbol support'
   ```
5. **Push to Your Fork**:
   ```bash
   git push origin feat/my-awesome-feature
   ```
6. **Open a Pull Request** describing your changes and link any related issues.

---

## 📜 License

Distributed under the **MIT License**. See the [`LICENSE`](LICENSE) file for complete details.

---

<div align="center">

Built with ❤️ for developers who care about thoughtful, fast, and delightful code reviews.<br/>
**[prmovie.dev](https://prmovie.dev)**

</div>
