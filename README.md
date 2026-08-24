<div align="center">

# ⚡ PullMotion

### The Developer Review Accelerator for GitHub Pull Requests.

**Turn complex 40+ file pull requests into interactive, evidence-backed 6-scene storyboards.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js&style=flat-square)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react&style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&style=flat-square)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&style=flat-square)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-8-2d3748?logo=prisma&style=flat-square)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169e1?logo=postgresql&style=flat-square)](https://www.postgresql.org)
[![Upstash](https://img.shields.io/badge/Upstash-Redis-1dc468?logo=redis&style=flat-square)](https://upstash.com)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6c47ff?logo=clerk&style=flat-square)](https://clerk.com)
[![Vitest](https://img.shields.io/badge/Tests-69_Passed-brightgreen?logo=vitest&style=flat-square)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[🌐 Live Demo](https://pullmotion.dev) · [✨ Features](#-features) · [🏗️ How It Works](#️-how-it-works) · [🎬 6-Scene Storyboard](#-the-6-scene-storyboard) · [🚀 Quickstart](#-quickstart)

</div>

---

## 💡 Why PullMotion?

Opening a 40-file pull request on GitHub is overwhelming. Files are listed alphabetically, business logic is buried under boilerplate churn, and reviewers must mentally reconstruct the architecture.

**PullMotion builds the mental model for you:**

- 🧭 **Dependency-First Reviewing**: Guides you through changes in logical execution order, not alphabetical.
- 🔗 **100% Verified Citations**: Every claim, diagram node, and diff snippet links directly to verified GitHub line numbers.
- 🛡️ **Zero Hallucination Firewall**: Deterministic AST analysis validates all AI output against the codebase before rendering.
- 🔒 **Zero-Storage Privacy**: Diffs are processed purely in ephemeral RAM and never stored or used for model training.

---

## 🎬 The 6-Scene Storyboard

Every pull request is automatically transformed into an interactive, 6-stage review flow:

| # | Scene | What Reviewers See |
|:---:|:---|:---|
| **1** | **Executive Overview** | Problem statement, PR metrics, blast radius, and architectural impact summary. |
| **2** | **Architecture & Data Flow** | Interactive Before/After node-edge diagram comparing system topologies. |
| **3** | **Code Walkthrough** | Reviewer-prioritized diffs (High / Med / Low), symbol shifts, invariants, and security flags. |
| **4** | **Domain Breakdown** | Categorized matrix across features, APIs, database schemas, configs, and tests. |
| **5** | **File Manifest** | Complete status matrix with additions, deletions, and risk levels. |
| **6** | **Action Plan & Checklist** | Evidence-backed facts, inferences, risks, questions, and automated review checklist. |

---

## 🏗️ How It Works

```mermaid
flowchart LR
    A["🐙 GitHub PR URL"] --> B["⚡ Octokit Fetcher\n(Diffs + Commits)"]
    B --> C["🔬 Polyglot AST &\nDependency Engine"]
    C --> D["🤖 Multi-Key AI Pool\n(Gemini + OpenAI)"]
    D --> E["🛡️ Deterministic\nValidation Firewall"]
    E --> F["🎬 6-Scene Studio\nPresentation"]
```

---

## ✨ Features

- 🌐 **Polyglot AST Engine**: Fast static analysis across TypeScript, Python, Go, Rust, Java, C#, C++, Ruby, and SQL.
- ⚡ **Multi-Key AI Failover**: Automatic round-robin key cycling and fallback across Google Gemini and OpenAI.
- 🧪 **4-State Test Analyzer**: Distinguishes `TEST_EXISTS`, `TEST_MISSING`, `TEST_NOT_ANALYZED`, and `TEST_UNAVAILABLE`.
- 🎨 **Cinematic Studio Themes**: 5 customizable accent themes (Purple, Blue, Teal, Amber, Pink) with dark & light modes.
- 📽️ **Presentation Mode**: Fullscreen review overlay with timeline scrubber and keyboard controls (<kbd>Space</kbd>, <kbd>←</kbd>, <kbd>→</kbd>).
- 📤 **Instant Share Links**: Persistent shareable links for async team reviews, standups, and pull request comments.

---

## 🚀 Quickstart

### Prerequisites
- **Node.js**: >= 20
- **PostgreSQL**: >= 15
- **GitHub Token**: Personal access token with `public_repo` scope
- **Clerk & Upstash Redis** accounts

### 1. Clone & Install
```bash
git clone https://github.com/irajatsharma-10/pullmotion.git
cd pullmotion
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Add your DATABASE_URL, GITHUB_TOKEN, GEMINI_API_KEYS, CLERK, and UPSTASH credentials
```

### 3. Initialize Database & Run
```bash
npm run contract:emit
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Environment Variables

| Variable | Description | Example |
|:---|:---|:---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/prmovie` |
| `GITHUB_TOKEN` | GitHub Personal Access Token (5,000 req/hr) | `ghp_xxxxxxxxxxxx` |
| `GEMINI_API_KEYS` | Comma-separated Gemini API keys for failover | `AIzaSyA...,AIzaSyB...` |
| `OPENAI_API_KEYS` | Optional OpenAI API keys for fallback | `sk-proj-xxxxxxxxxxxx` |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | Upstash Redis credentials for caching & rate limits | `https://your-instance.upstash.io` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `SECRET` | Clerk authentication keys | `pk_test_...` / `sk_test_...` |
| `NEXT_PUBLIC_APP_URL` | Public application URL | `http://localhost:3000` |

---

## 🧪 Testing

```bash
# Run Vitest test suite (69 tests across 18 suites)
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org) (App Router), [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [Motion](https://motion.dev)
- **Backend & Database**: [Prisma 8](https://www.prisma.io), [PostgreSQL](https://www.postgresql.org), [Upstash Redis](https://upstash.com)
- **Auth**: [Clerk](https://clerk.com)
- **AI & Analysis**: Google Gemini 2.0/1.5, OpenAI GPT-4o, [Octokit](https://github.com/octokit), [Zod](https://zod.dev)
- **Testing**: [Vitest](https://vitest.dev)

---

## 📜 License

Distributed under the [MIT License](LICENSE).

<div align="center">

Built with ❤️ for developers who care about thoughtful, fast, and delightful code reviews.<br/>
**[pullmotion.dev](https://pullmotion.dev)**

</div>
