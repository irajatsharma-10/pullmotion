import { describe, it, expect } from "vitest";
import { analyzeDiff } from "@/lib/analysis/diff-analyzer";

describe("Diff Analyzer - Boundary & Patch Edge Cases", () => {
  it("handles diffs with missing trailing newline marker (\\ No newline at end of file)", () => {
    const patchWithNoNewline = `@@ -1,3 +1,4 @@
 import os
+import sys
 print("hello")
\\ No newline at end of file
`;
    const diff = analyzeDiff("src/script.py", patchWithNoNewline);

    expect(diff.hunks).toHaveLength(1);
    expect(diff.totalAdded).toBe(1);
    expect(diff.totalRemoved).toBe(0);
    expect(diff.hunks[0].addedLines).toContain("import sys");
  });

  it("handles pure addition patches for newly created files", () => {
    const newFilePatch = `@@ -0,0 +1,15 @@
+export interface Config {
+  apiUrl: string;
+  timeout: number;
+}
+
+export function loadConfig(): Config {
+  return { apiUrl: "https://api.dev", timeout: 5000 };
+}
`;
    const diff = analyzeDiff("src/config.ts", newFilePatch);

    expect(diff.hunks).toHaveLength(1);
    expect(diff.hunks[0].newStart).toBe(1);
    expect(diff.totalAdded).toBe(8);
    expect(diff.totalRemoved).toBe(0);
  });

  it("handles pure deletion patches for removed functionality", () => {
    const deletionPatch = `@@ -10,12 +10,0 @@
-export function deprecatedHelper(): void {
-  console.warn("deprecated");
-  doOldRoutine();
-}
`;
    const diff = analyzeDiff("src/deprecated.ts", deletionPatch);

    expect(diff.hunks).toHaveLength(1);
    expect(diff.totalAdded).toBe(0);
    expect(diff.totalRemoved).toBe(4);
  });

  it("correctly identifies branching changes (if/else/switch/catch) and API changes", () => {
    const apiBranchPatch = `@@ -25,8 +25,14 @@ export async function POST(req: Request) {
   const data = await req.json();
+  if (!data.userId) {
+    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
+  }
+  try {
+    await processPayment(data);
+  } catch (err) {
+    return NextResponse.json({ error: "Failed" }, { status: 500 });
+  }
   return NextResponse.json({ ok: true });
 }
`;
    const diff = analyzeDiff("src/app/api/checkout/route.ts", apiBranchPatch);

    expect(diff.hasBranchChanges).toBe(true);
    expect(diff.hasApiChanges).toBe(true);
    expect(diff.changeTypes).toContain("branch_change");
    expect(diff.changeTypes).toContain("api_route_change");
  });

  it("handles multi-hunk diffs with separated line number ranges", () => {
    const multiHunkPatch = `@@ -5,4 +5,5 @@
 const A = 1;
+const A_EXT = 2;
 const B = 2;
@@ -40,3 +41,4 @@
 export function compute() {
+  console.log(A_EXT);
 }
`;
    const diff = analyzeDiff("src/calc.ts", multiHunkPatch);

    expect(diff.hunks).toHaveLength(2);
    expect(diff.totalAdded).toBe(2);
    expect(diff.modifiedLineNumbers).toEqual([6, 42]);
  });
});
