<div align="center">

# 🎬 PR Movie

**Transform any GitHub Pull Request into a visual, story-driven code review experience.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6c47ff?logo=clerk)](https://clerk.com)
[![Redis](https://img.shields.io/badge/Cache-Upstash_Redis-1dc468?logo=redis)](https://upstash.com)
[![Prisma](https://img.shields.io/badge/ORM-Prisma_8-2d3748?logo=prisma)](https://www.prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](https://prmovie.dev) · [Report Bug](https://github.com/irajatsharma-10/prmoviegit/issues) · [Request Feature](https://github.com/irajatsharma-10/prmoviegit/issues)

</div>

---

## 🔍 What is PR Movie?

PR Movie is a **developer review accelerator** — not just a presentation layer. It takes complex 40-file GitHub pull requests and transforms them into animated, evidence-backed **6-scene storyboards** that reconstruct the architecture, data flow, and blast radius of a change, giving reviewers the mental model they need in seconds rather than hours.

### The Problem

> You open a PR with 47 changed files. GitHub lists them alphabetically. You spend 40 minutes clicking between files, reconstructing the call chain in your head, and you still don't know what the PR actually *does* architecturally.

### The Solution

PR Movie builds the architecture map **for you** — with 100% verified, line-level GitHub citations and zero AI hallucinations. Every claim in a PR Movie is traceable back to a specific diff line.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏗️ **Architecture & Data Flow Mapping** | Visualizes how data moves through changed files, APIs, and services |
| 🧭 **Cognitive Review Order** | Guides reviewers in the correct dependency order, not alphabetical |
| 🎯 **Signal vs. Noise Filtering** | Strips lockfiles, generated assets, and boilerplate — shows only business logic |
| 🔗 **100% Verified Citations** | Every scene node links to exact GitHub diff line numbers |
| 🔒 **Zero-Storage Execution** | Code diffs processed in memory, never persisted to disk or used for ML training |
| ⚡ **Multi-Key AI Pool** | Automatic failover across multiple Gemini/OpenAI API keys for zero downtime |
| 🎨 **Studio Themes** | Multiple cinematic themes for the review workspace |
| 📤 **Shareable Movies** | Generate a permanent share link for async team review |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Auth**: [Clerk](https://clerk.com)
- **Database**: PostgreSQL via [Prisma 8](https://www.prisma.io)
- **Caching & Rate Limiting**: [Upstash Redis](https://upstash.com)
- **AI Engine**: Google Gemini + OpenAI with automatic multi-key pool failover
- **GitHub API**: Octokit with retry & throttling plugins
- **Testing**: Vitest (unit + integration)
- **Animations**: Motion (Framer Motion)

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL >= 15
- A [GitHub Personal Access Token](https://github.com/settings/tokens) (scope: `public_repo`)
- [Clerk](https://clerk.com) account
- [Upstash Redis](https://upstash.com) account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/irajatsharma-10/prmoviegit.git
cd prmoviegit

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your credentials (see Environment Variables section)

# 4. Run database migrations
npx prisma-cli migrate apply

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prmovie"

# GitHub API — generate at https://github.com/settings/tokens
GITHUB_TOKEN="ghp_your_github_token_here"

# AI / Story Engine (supports multiple comma-separated keys for failover)
GEMINI_API_KEYS="AIzaSy...,AIzaSy..."
OPENAI_API_KEYS="sk-proj-...,sk-proj-..."

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📂 Project Structure

```
prmoviegit/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [owner]/[repo]/[pr]/ # Dynamic PR Movie page
│   │   ├── api/                # API route handlers
│   │   │   ├── pr/             # PR analysis endpoints
│   │   │   └── movies/         # Saved movie endpoints
│   │   ├── create/             # Create new PR Movie
│   │   ├── movie/              # View a saved movie
│   │   ├── sign-in/            # Clerk auth pages
│   │   └── sign-up/
│   ├── components/
│   │   ├── landing/            # Marketing page components
│   │   ├── movie/              # PR Movie viewer components
│   │   ├── studio/             # Review workspace & share modal
│   │   ├── theme/              # Dark/light theme toggle
│   │   └── ui/                 # Reusable UI primitives
│   ├── lib/
│   │   ├── ai/                 # AI prompt builder, planner, story engine
│   │   ├── analysis/           # Semantic analyzer, dependency graph, diff engine
│   │   ├── cache/              # Redis caching layer
│   │   ├── db/                 # Database query helpers
│   │   ├── github/             # GitHub API fetcher with retry/throttle
│   │   ├── movie/              # Movie generation pipeline
│   │   └── rate-limit/         # Per-user rate limiting
│   ├── prisma/                 # Prisma schema, contract, and db client
│   ├── hooks/                  # React hooks
│   ├── middleware.ts            # Clerk auth middleware
│   └── types/                  # TypeScript types & Zod schemas
├── migrations/                 # Prisma database migrations
├── tests/
│   ├── unit/                   # Unit tests (Vitest)
│   └── integration/            # Integration tests
├── public/                     # Static assets
├── .env.example                # Environment variable template
├── vitest.config.ts            # Test configuration
├── prisma.config.ts            # Prisma configuration
├── next.config.ts              # Next.js configuration
└── tsconfig.json
```

---

## 🧪 Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

Tests cover:
- URL parser and PR URL validation
- GitHub diff analyzer and polyglot edge cases
- Semantic analyzer and dependency graph
- Rate limiter and hash utilities
- Schema validation (Zod)
- Clipboard utilities and duration formatting
- Risk analysis and scene generation

---

## 📖 How It Works

```
GitHub PR URL
      │
      ▼
┌─────────────────┐
│  GitHub Fetcher │  ← Octokit + retry/throttle
│  (diff + AST)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Semantic        │  ← Dependency graph, blast radius,
│ Analyzer        │    signal vs noise filtering
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI Story Engine │  ← Multi-key Gemini/OpenAI pool
│ + Prompt Builder│    Evidence-only rules enforced
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  6-Scene Movie  │  ← Architecture → Data Flow →
│  Storyboard     │    API Changes → Risk → Tests → Summary
└─────────────────┘
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  Built with ❤️ for developers who care about thoughtful code review.<br/>
  <strong><a href="https://prmovie.dev">prmovie.dev</a></strong>
</div>
