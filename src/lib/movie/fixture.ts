import type { PRMovie } from "@/types/pr-movie";

export const SAMPLE_PR_MOVIE: PRMovie = {
  version: 1,
  movieId: "mov_49258_redis_cache",
  sourceHash: "sha256:49258a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9",
  pr: {
    url: "https://github.com/vercel/next.js/pull/49258",
    owner: "vercel",
    repo: "next.js",
    number: 49258,
    title: "Add Redis caching layer to reduce database load",
    author: "timneutkens",
    createdAt: "2026-08-19T00:00:00Z",
  },
  overview: {
    title: "Adds caching layer to reduce database load",
    summary: "This PR introduces a Redis caching layer in the data fetching flow to reduce database queries and improve performance.",
    totalDuration: 26,
    stats: {
      additions: 1247,
      deletions: 312,
      filesChanged: 18,
      commits: 6,
    },
  },
  scenes: [
    {
      id: "scene-1-overview",
      type: "overview",
      title: "PR Overview & Scope",
      duration: 5,
      author: "timneutkens",
      stats: {
        additions: 1247,
        deletions: 312,
        filesChanged: 18,
        commits: 6,
      },
      summary: "This PR introduces a Redis caching layer in the data fetching flow to reduce database queries and improve performance.",
    },
    {
      id: "scene-2-before-after",
      type: "before_after",
      title: "Adds caching layer to reduce database load",
      duration: 6,
      description: "Direct database lookup flow upgraded with an intelligent Redis cache lookup and background refresh.",
      before: {
        nodes: [
          { id: "user", label: "User", type: "external" },
          { id: "web", label: "Web", type: "service" },
          { id: "api", label: "API", type: "api" },
          { id: "db", label: "Database", type: "database" },
        ],
        edges: [
          { from: "user", to: "web" },
          { from: "web", to: "api" },
          { from: "api", to: "db", label: "Direct query" },
        ],
      },
      after: {
        nodes: [
          { id: "user", label: "User", type: "external" },
          { id: "web", label: "Web", type: "service" },
          { id: "api", label: "API", type: "api" },
          { id: "redis", label: "Redis Cache", type: "cache", isNew: true },
          { id: "db", label: "Database", type: "database" },
        ],
        edges: [
          { from: "user", to: "web" },
          { from: "web", to: "api" },
          { from: "api", to: "redis", label: "Cache lookup", isNew: true },
          { from: "redis", to: "db", label: "Cache miss fallback" },
        ],
      },
      beforeSteps: [
        { label: "User triggers data request on Web frontend" },
        { label: "API receives request and runs query directly on Database" },
        { label: "High load causes connection pool exhaustion and query latency" },
      ],
      afterSteps: [
        { label: "API checks Redis cache for stored key", isNew: true, evidenceId: "ev-redis-cache" },
        { label: "On cache hit: returns cached payload in <5ms without DB hit", isNew: true, evidenceId: "ev-redis-cache" },
        { label: "On cache miss: fetches from DB and stores in Redis with 60s TTL", isNew: true, evidenceId: "ev-getdata" },
        { label: "Updates test suite with cached mock assertions", evidenceId: "ev-tests" },
      ],
      claims: [
        {
          text: "This PR introduces a Redis caching layer in the data fetching flow to reduce database queries.",
          evidence: [{ file: "lib/cache.ts", type: "changed_file" }],
        },
      ],
    },
    {
      id: "scene-3-code-changes",
      type: "code_changes",
      title: "Caching Layer Implementation",
      duration: 5,
      filePath: "src/lib/getData.ts",
      language: "typescript",
      codeSnippet: `- import { redis } from '@/lib/redis'
+ const cache = redis()

async function getData(id) {
+   const cached = await cache.get(id)
    if (cached) return cached
    const data = await db.get(id)
+   await cache.set(id, data, '60s')
    return data
}`,
      explanation: "Inspects cache before making database calls; automatically sets cache key with 60s TTL on cache miss.",
      snippets: [
        {
          startLine: 1,
          endLine: 11,
          after: `async function getData(id) {\n  const cached = await cache.get(id)\n  if (cached) return cached\n  const data = await db.get(id)\n  await cache.set(id, data, '60s')\n  return data\n}`,
        },
      ],
      evidenceId: "ev-getdata",
      claims: [
        {
          text: "Implements caching in getData function and caches response for 60 seconds.",
          evidence: [{ file: "src/lib/getData.ts", type: "changed_file", startLine: 4, endLine: 9 }],
        },
      ],
    },
    {
      id: "scene-4-change-breakdown",
      type: "change_breakdown",
      title: "Change Breakdown",
      duration: 4,
      categories: [
        {
          category: "feature",
          summary: "Implemented Redis client connection pool and getData cache wrapper",
          fileCount: 8,
          files: ["lib/cache.ts", "api/data.ts", "middleware.ts"],
          impact: "Primary caching flow",
        },
        {
          category: "dependency",
          summary: "Added ioredis and upstash redis client packages",
          fileCount: 2,
          files: ["package.json", "pnpm-lock.yaml"],
          impact: "Driver dependencies",
        },
        {
          category: "tests",
          summary: "Added cache hit, cache miss, and TTL expiration unit tests",
          fileCount: 5,
          files: ["tests/cache.test.ts", "tests/api.test.ts"],
          impact: "Full test coverage",
        },
        {
          category: "config",
          summary: "Added REDIS_URL and CACHE_TTL_SECONDS environment configurations",
          fileCount: 3,
          files: [".env.example", "config/redis.ts"],
          impact: "Runtime environment",
        },
      ],
    },
    {
      id: "scene-5-files-changed",
      type: "files_changed",
      title: "Files Changed",
      duration: 3,
      files: [
        { filename: "lib/cache.ts", status: "added", additions: 420, deletions: 0, category: "feature" },
        { filename: "api/data.ts", status: "modified", additions: 310, deletions: 120, category: "feature" },
        { filename: "middleware.ts", status: "modified", additions: 185, deletions: 45, category: "feature" },
        { filename: "tests/cache.test.ts", status: "added", additions: 212, deletions: 0, category: "tests" },
        { filename: "package.json", status: "modified", additions: 12, deletions: 2, category: "dependency" },
        { filename: ".env.example", status: "modified", additions: 8, deletions: 0, category: "config" },
        { filename: "config/redis.ts", status: "added", additions: 65, deletions: 0, category: "config" },
        { filename: "tests/api.test.ts", status: "modified", additions: 35, deletions: 145, category: "tests" },
      ],
      totalAdditions: 1247,
      totalDeletions: 312,
    },
    {
      id: "scene-6-summary",
      type: "summary",
      title: "PR Summary",
      duration: 3,
      bullets: [
        {
          text: "Adds Redis dependency and connection pooling for caching layer.",
          evidenceId: "ev-redis-cache",
        },
        {
          text: "Implements caching in getData function with 60s TTL fallback.",
          evidenceId: "ev-getdata",
        },
        {
          text: "Adds cache invalidation hooks on mutate operations.",
          evidenceId: "ev-invalidation",
        },
        {
          text: "Updates test suite with verified mock assertions for cached responses.",
          evidenceId: "ev-tests",
        },
      ],
    },
  ],
  evidence: [
    {
      id: "ev-redis-cache",
      file: "lib/cache.ts",
      type: "changed_file",
      githubUrl: "https://github.com/vercel/next.js/pull/49258/files#diff-cache",
      excerpt: "export const cache = new RedisClient({ url: process.env.REDIS_URL, poolSize: 20 });",
      startLine: 1,
      endLine: 20,
    },
    {
      id: "ev-getdata",
      file: "src/lib/getData.ts",
      type: "changed_file",
      githubUrl: "https://github.com/vercel/next.js/pull/49258/files#diff-getdata",
      excerpt: "const cached = await cache.get(id);\nif (cached) return cached;\nconst data = await db.get(id);\nawait cache.set(id, data, '60s');\nreturn data;",
      startLine: 4,
      endLine: 9,
    },
    {
      id: "ev-invalidation",
      file: "api/data.ts",
      type: "changed_file",
      githubUrl: "https://github.com/vercel/next.js/pull/49258/files#diff-api",
      excerpt: "await cache.del(id); // Invalidate cache on write",
      startLine: 45,
      endLine: 50,
    },
    {
      id: "ev-tests",
      file: "tests/cache.test.ts",
      type: "changed_file",
      githubUrl: "https://github.com/vercel/next.js/pull/49258/files#diff-tests",
      excerpt: "it('returns cached value without hitting db', async () => { ... });",
      startLine: 1,
      endLine: 40,
    },
  ],
  createdAt: "2026-08-19T00:00:00.000Z",
};

export const SHOWCASE_EXAMPLES: Record<string, PRMovie> = {
  "vercel/next.js/49258": SAMPLE_PR_MOVIE,
  "facebook/react/28000": {
    version: 1,
    movieId: "mov_28000_react_actions",
    sourceHash: "sha256:28000reactactions991122334455667788",
    pr: {
      url: "https://github.com/facebook/react/pull/28000",
      owner: "facebook",
      repo: "react",
      number: 28000,
      title: "Implement Server Actions Async Transition Dispatcher",
      author: "acdlite",
      createdAt: "2026-08-19T00:00:00Z",
    },
    overview: {
      title: "Implement Server Actions Async Transition Dispatcher",
      summary: "Adds Server Action queuing for React 19 and automatic transition handling in client forms.",
      totalDuration: 44,
      stats: {
        additions: 940,
        deletions: 185,
        filesChanged: 14,
        commits: 8,
      },
    },
    scenes: [
      {
        id: "scene-1-overview",
        type: "overview",
        title: "PR Overview & Scope",
        duration: 4,
        author: "acdlite",
        stats: { additions: 940, deletions: 185, filesChanged: 14, commits: 8 },
        summary: "Adds Server Action queuing for React 19 and automatic transition handling in client forms.",
      },
      {
        id: "scene-2-before-after",
        type: "before_after",
        title: "Server Action Transition Flow",
        duration: 6,
        description: "Replaces manual fetch handlers with automatic React 19 Server Action transitions.",
        before: {
          nodes: [
            { id: "client", label: "Client Form", type: "external" },
            { id: "event", label: "onSubmit Event", type: "service" },
            { id: "fetch", label: "Manual fetch()", type: "api" },
            { id: "state", label: "Local State Sync", type: "database" },
          ],
          edges: [
            { from: "client", to: "event" },
            { from: "event", to: "fetch" },
            { from: "fetch", to: "state" },
          ],
        },
        after: {
          nodes: [
            { id: "client", label: "Client Form", type: "external" },
            { id: "action", label: "Server Action", type: "service", isNew: true },
            { id: "transition", label: "useActionState", type: "cache", isNew: true },
            { id: "stream", label: "RSC Streaming", type: "database" },
          ],
          edges: [
            { from: "client", to: "action" },
            { from: "action", to: "transition" },
            { from: "transition", to: "stream" },
          ],
        },
        beforeSteps: [
          { label: "Client intercepts form submission manually" },
          { label: "Performs manual POST request with custom loading state flags" },
        ],
        afterSteps: [
          { label: "Form action invokes Server Action directly", isNew: true, evidenceId: "ev-react-action" },
          { label: "React handles pending transition state automatically without extra boilerplate", isNew: true, evidenceId: "ev-internals" },
        ],
        claims: [{ text: "Streamlines mutation handling with React 19 Server Actions.", evidence: [{ file: "packages/react/src/ReactAction.js", type: "changed_file" }] }],
      },
      {
        id: "scene-3-code-changes",
        type: "code_changes",
        title: "Server Action Dispatch Queue",
        duration: 5,
        filePath: "packages/react/src/ReactAction.js",
        language: "javascript",
        codeSnippet: `export function dispatchServerAction(action, args) {
  const transition = ReactSharedInternals.ReactCurrentBatchConfig.transition;
  return enqueueActionTransition(action, args, transition);
}`,
        explanation: "Queues server actions and runs them inside React's concurrent transition batch.",
        snippets: [
          {
            startLine: 1,
            endLine: 4,
            after: `export function dispatchServerAction(action, args) {\n  const transition = ReactSharedInternals.ReactCurrentBatchConfig.transition;\n  return enqueueActionTransition(action, args, transition);\n}`,
          },
        ],
        evidenceId: "ev-react-action",
        claims: [{ text: "Enqueues action transitions within concurrent batch config.", evidence: [{ file: "packages/react/src/ReactAction.js", type: "changed_file" }] }],
      },
      {
        id: "scene-4-code-changes",
        type: "code_changes",
        title: "useActionState Hook Dispatcher",
        duration: 5,
        filePath: "packages/react-dom/src/shared/ReactDOMSharedInternals.js",
        language: "javascript",
        codeSnippet: `- export function updateAction(state, payload) {
-   return performManualFetch(payload);
- }
+ export function useActionState(action, initialState) {
+   const [state, formAction, isPending] = useTransitionAction(action, initialState);
+   return [state, formAction, isPending];
+ }`,
        explanation: "Integrates Server Action transitions directly into React state with the useActionState hook.",
        snippets: [
          {
            startLine: 1,
            endLine: 8,
            after: `export function useActionState(action, initialState) {\n  const [state, formAction, isPending] = useTransitionAction(action, initialState);\n  return [state, formAction, isPending];\n}`,
          },
        ],
        evidenceId: "ev-internals",
        claims: [{ text: "Integrates Server Action dispatcher into React runtime.", evidence: [{ file: "packages/react-dom/src/shared/ReactDOMSharedInternals.js", type: "changed_file" }] }],
      },
      {
        id: "scene-5-code-changes",
        type: "code_changes",
        title: "Client Form Event Binding",
        duration: 4,
        filePath: "packages/react-dom/src/client/ReactDOM.js",
        language: "javascript",
        codeSnippet: `export function handleFormSubmit(event, formAction) {
  event.preventDefault();
  startTransition(() => {
    formAction(new FormData(event.target));
  });
}`,
        explanation: "Wires HTML form submissions into React transitions automatically.",
        snippets: [],
        evidenceId: "ev-react-dom",
        claims: [{ text: "Intercepts form submission and executes inside startTransition.", evidence: [{ file: "packages/react-dom/src/client/ReactDOM.js", type: "changed_file" }] }],
      },
      {
        id: "scene-6-code-changes",
        type: "code_changes",
        title: "Server Component Action Reference",
        duration: 4,
        filePath: "packages/react-server/src/ReactFlightServer.js",
        language: "javascript",
        codeSnippet: `export function serializeServerReference(action) {
  return { $$typeof: Symbol.for('react.server.reference'), id: action.$$id };
}`,
        explanation: "Encodes server action references into the RSC payload for client-side invocation.",
        snippets: [],
        evidenceId: "ev-flight-server",
        claims: [{ text: "Serializes server references into RSC flight protocol.", evidence: [{ file: "packages/react-server/src/ReactFlightServer.js", type: "changed_file" }] }],
      },
      {
        id: "scene-7-code-changes",
        type: "code_changes",
        title: "Action Transition Test Suite",
        duration: 4,
        filePath: "packages/react/src/__tests__/ReactAction-test.js",
        language: "javascript",
        codeSnippet: `it('handles sequential server action dispatches during transitions', async () => {
  const [state, dispatch] = renderActionHook();
  await act(() => dispatch('submit'));
  expect(state.status).toBe('resolved');
});`,
        explanation: "Ensures sequential action dispatches and error handling work properly with async transitions.",
        snippets: [],
        evidenceId: "ev-tests",
        claims: [{ text: "Validates concurrent action transition dispatching.", evidence: [{ file: "packages/react/src/__tests__/ReactAction-test.js", type: "changed_file" }] }],
      },
      {
        id: "scene-8-change-breakdown",
        type: "change_breakdown",
        title: "Change Breakdown",
        duration: 4,
        categories: [
          { category: "feature", summary: "Server Action dispatch loop and form interceptors", fileCount: 6, files: ["packages/react/src/ReactAction.js", "packages/react-dom/src/client/ReactDOM.js"], impact: "Core feature" },
          { category: "api", summary: "useActionState hook and shared dispatcher exports", fileCount: 3, files: ["packages/react-dom/src/shared/ReactDOMSharedInternals.js"], impact: "API exports" },
          { category: "tests", summary: "Unit tests for concurrent transitions", fileCount: 4, files: ["packages/react/src/__tests__/ReactAction-test.js"], impact: "Verification" },
          { category: "config", summary: "React 19 build configuration updates", fileCount: 1, files: ["package.json"], impact: "Build tooling" },
        ],
      },
      {
        id: "scene-9-files-changed",
        type: "files_changed",
        title: "Files Changed",
        duration: 4,
        files: [
          { filename: "packages/react/src/ReactAction.js", status: "added", additions: 450, deletions: 0, category: "feature" },
          { filename: "packages/react-dom/src/shared/ReactDOMSharedInternals.js", status: "modified", additions: 180, deletions: 40, category: "api" },
          { filename: "packages/react-dom/src/client/ReactDOM.js", status: "modified", additions: 220, deletions: 80, category: "feature" },
          { filename: "packages/react-server/src/ReactFlightServer.js", status: "modified", additions: 90, deletions: 15, category: "feature" },
          { filename: "packages/react/src/__tests__/ReactAction-test.js", status: "added", additions: 270, deletions: 105, category: "tests" },
        ],
        totalAdditions: 940,
        totalDeletions: 185,
      },
      {
        id: "scene-10-summary",
        type: "summary",
        title: "PR Summary & Takeaways",
        duration: 4,
        bullets: [
          { text: "Enables declarative forms with Server Actions in React 19.", evidenceId: "ev-react-action" },
          { text: "Integrates useActionState transition dispatcher into ReactDOM shared internals.", evidenceId: "ev-internals" },
          { text: "Serializes server action references into Flight streaming protocol.", evidenceId: "ev-flight-server" },
          { text: "Includes full unit test coverage for concurrent async transitions.", evidenceId: "ev-tests" },
        ],
      },
    ],
    evidence: [
      {
        id: "ev-react-action",
        file: "packages/react/src/ReactAction.js",
        type: "changed_file",
        githubUrl: "https://github.com/facebook/react/pull/28000/files#diff-react-action",
        excerpt: "export function dispatchServerAction(action, args) { ... }",
        startLine: 1,
        endLine: 30,
      },
      {
        id: "ev-internals",
        file: "packages/react-dom/src/shared/ReactDOMSharedInternals.js",
        type: "changed_file",
        githubUrl: "https://github.com/facebook/react/pull/28000/files#diff-internals",
        excerpt: "export function useActionState(action, initialState) { ... }",
        startLine: 1,
        endLine: 20,
      },
      {
        id: "ev-react-dom",
        file: "packages/react-dom/src/client/ReactDOM.js",
        type: "changed_file",
        githubUrl: "https://github.com/facebook/react/pull/28000/files#diff-react-dom",
        excerpt: "export function handleFormSubmit(event, formAction) { ... }",
        startLine: 1,
        endLine: 25,
      },
      {
        id: "ev-flight-server",
        file: "packages/react-server/src/ReactFlightServer.js",
        type: "changed_file",
        githubUrl: "https://github.com/facebook/react/pull/28000/files#diff-flight",
        excerpt: "export function serializeServerReference(action) { ... }",
        startLine: 1,
        endLine: 15,
      },
      {
        id: "ev-tests",
        file: "packages/react/src/__tests__/ReactAction-test.js",
        type: "changed_file",
        githubUrl: "https://github.com/facebook/react/pull/28000/files#diff-tests",
        excerpt: "it('handles sequential server action dispatches', ...);",
        startLine: 1,
        endLine: 35,
      },
    ],
    createdAt: "2026-08-19T00:00:00.000Z",
  },
};
