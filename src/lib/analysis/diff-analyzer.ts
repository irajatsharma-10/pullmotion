import type { SemanticFileInfo } from "./semantic-analyzer";

export type DiffChangeType =
  | "signature_change"
  | "branch_change"
  | "import_export_change"
  | "schema_change"
  | "api_route_change"
  | "test_change"
  | "config_change"
  | "general_logic";

export interface DiffHunkInfo {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  header: string;
  addedLines: string[];
  removedLines: string[];
  contextLines: string[];
  modifiedLineNumbers: number[];
  enclosingSymbol?: string;
  changeTypes: DiffChangeType[];
}

export interface AnalyzedDiff {
  path: string;
  hunks: DiffHunkInfo[];
  totalAdded: number;
  totalRemoved: number;
  modifiedLineNumbers: number[];
  modifiedSymbols: string[];
  changeTypes: DiffChangeType[];
  hasSignatureChanges: boolean;
  hasBranchChanges: boolean;
  hasSchemaChanges: boolean;
  hasApiChanges: boolean;
  hasTestChanges: boolean;
}

/**
 * Parses unified diff patch into structured hunks and correlates them with AST symbols.
 */
export function analyzeDiff(
  filePath: string,
  patch: string,
  semanticInfo?: SemanticFileInfo
): AnalyzedDiff {
  if (!patch || !patch.trim()) {
    return {
      path: filePath,
      hunks: [],
      totalAdded: 0,
      totalRemoved: 0,
      modifiedLineNumbers: [],
      modifiedSymbols: [],
      changeTypes: [],
      hasSignatureChanges: false,
      hasBranchChanges: false,
      hasSchemaChanges: false,
      hasApiChanges: false,
      hasTestChanges: false,
    };
  }

  const hunks = parseDiffHunks(patch);
  const allModifiedLines = new Set<number>();
  let totalAdded = 0;
  let totalRemoved = 0;
  const changeTypeSet = new Set<DiffChangeType>();

  // Detect path-level change characteristics
  const lowerPath = filePath.toLowerCase();
  const isApi = lowerPath.includes("api/") || lowerPath.includes("routes/") || lowerPath.includes("route.ts") || lowerPath.includes("server.");
  const isSchema = lowerPath.includes("schema") || lowerPath.includes("prisma") || lowerPath.includes("model") || lowerPath.includes("types") || lowerPath.endsWith(".sql");
  const isTest = semanticInfo?.isTest ?? (lowerPath.includes("test") || lowerPath.includes("spec"));
  const isConfig = semanticInfo?.isConfig ?? (lowerPath.includes("config") || lowerPath.includes("json"));

  for (const hunk of hunks) {
    totalAdded += hunk.addedLines.length;
    totalRemoved += hunk.removedLines.length;
    hunk.modifiedLineNumbers.forEach((l) => allModifiedLines.add(l));

    // Correlate hunk with enclosing AST symbol if semantic info is available
    if (semanticInfo && semanticInfo.symbols.length > 0) {
      const match = semanticInfo.symbols.find(
        (sym) =>
          (hunk.newStart >= sym.startLine && hunk.newStart <= sym.endLine) ||
          hunk.modifiedLineNumbers.some((l) => l >= sym.startLine && l <= sym.endLine)
      );
      if (match) {
        hunk.enclosingSymbol = match.name;
      }
    }

    // Classify changes within the hunk
    const hunkTypes = detectHunkChangeTypes(hunk, { isApi, isSchema, isTest, isConfig });
    hunk.changeTypes = hunkTypes;
    hunkTypes.forEach((t) => changeTypeSet.add(t));
  }

  const modifiedSymbols = semanticInfo
    ? semanticInfo.modifiedSymbols.map((s) => s.name)
    : hunks
      .map((h) => h.enclosingSymbol)
      .filter((s): s is string => Boolean(s));

  const changeTypes = Array.from(changeTypeSet);

  return {
    path: filePath,
    hunks,
    totalAdded,
    totalRemoved,
    modifiedLineNumbers: Array.from(allModifiedLines).sort((a, b) => a - b),
    modifiedSymbols: Array.from(new Set(modifiedSymbols)),
    changeTypes,
    hasSignatureChanges: changeTypeSet.has("signature_change"),
    hasBranchChanges: changeTypeSet.has("branch_change"),
    hasSchemaChanges: changeTypeSet.has("schema_change"),
    hasApiChanges: changeTypeSet.has("api_route_change"),
    hasTestChanges: changeTypeSet.has("test_change"),
  };
}

/**
 * Parses raw unified diff string into array of DiffHunkInfo
 */
export function parseDiffHunks(patch: string): DiffHunkInfo[] {
  const lines = patch.split("\n");
  const hunks: DiffHunkInfo[] = [];

  let currentHunk: DiffHunkInfo | null = null;
  let currentNewLine = 0;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      // Hunk header: @@ -oldStart,oldCount +newStart,newCount @@ headerText
      const match = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@\s*(.*)$/);
      if (match) {
        if (currentHunk) {
          hunks.push(currentHunk);
        }

        const oldStart = parseInt(match[1], 10);
        const oldCount = match[2] !== undefined ? parseInt(match[2], 10) : 1;
        const newStart = parseInt(match[3], 10);
        const newCount = match[4] !== undefined ? parseInt(match[4], 10) : 1;
        const header = match[5] || "";

        currentNewLine = newStart;

        currentHunk = {
          oldStart,
          oldCount,
          newStart,
          newCount,
          header,
          addedLines: [],
          removedLines: [],
          contextLines: [],
          modifiedLineNumbers: [],
          changeTypes: [],
        };
      }
      continue;
    }

    if (!currentHunk) continue;

    if (line.startsWith("+")) {
      currentHunk.addedLines.push(line.slice(1));
      currentHunk.modifiedLineNumbers.push(currentNewLine);
      currentNewLine++;
    } else if (line.startsWith("-")) {
      currentHunk.removedLines.push(line.slice(1));
    } else {
      const cleanContext = line.startsWith(" ") ? line.slice(1) : line;
      currentHunk.contextLines.push(cleanContext);
      currentNewLine++;
    }
  }

  if (currentHunk) {
    hunks.push(currentHunk);
  }

  return hunks;
}

function detectHunkChangeTypes(
  hunk: DiffHunkInfo,
  context: { isApi: boolean; isSchema: boolean; isTest: boolean; isConfig: boolean }
): DiffChangeType[] {
  const types = new Set<DiffChangeType>();
  const added = hunk.addedLines.join("\n");
  const removed = hunk.removedLines.join("\n");
  const allChanged = `${added}\n${removed}`;

  // 1. Import/Export changes
  if (
    allChanged.includes("import ") ||
    allChanged.includes("export ") ||
    allChanged.includes("from ") ||
    allChanged.includes("use ") ||
    allChanged.includes("package ") ||
    allChanged.includes("#include ") ||
    allChanged.includes("from \"") ||
    allChanged.includes("from '")
  ) {
    types.add("import_export_change");
  }

  // 2. Branch additions / removals
  if (
    /\b(if|elif|else|switch|case|catch|except)\b/.test(allChanged) ||
    (allChanged.includes("?") && allChanged.includes(":"))
  ) {
    types.add("branch_change");
  }

  // 3. Signature changes (function / method parameters or return types)
  if (
    /\b(function|async function|def |async def |func |fn |pub fn |class |struct |interface |const \w+ =|=>)\b/.test(
      allChanged
    ) ||
    /\((.*)\):\s*[A-Z]/.test(allChanged) ||
    hunk.header.includes("function") ||
    hunk.header.includes("def") ||
    hunk.header.includes("func") ||
    hunk.header.includes("fn") ||
    hunk.header.includes("class")
  ) {
    types.add("signature_change");
  }

  // 4. API route changes
  if (
    context.isApi ||
    /\b(GET|POST|PUT|DELETE|PATCH|NextResponse|Request|Response|router\.|app\.(get|post|put|delete)|gin\.|mux\.)\b/.test(
      allChanged
    )
  ) {
    types.add("api_route_change");
  }

  // 5. Schema / Model changes
  if (
    context.isSchema ||
    /\b(model|type|interface|enum|z\.object|z\.string|schema|prisma|struct|dataclass|BaseModel)\b/.test(
      allChanged
    )
  ) {
    types.add("schema_change");
  }

  // 6. Test changes
  if (
    context.isTest ||
    /\b(describe|it|test|expect|assert|beforeEach|afterEach|def test_|@pytest|@Test|#\[test\]|testing\.T)\b/.test(
      allChanged
    )
  ) {
    types.add("test_change");
  }

  // 7. Config changes
  if (context.isConfig) {
    types.add("config_change");
  }

  if (types.size === 0) {
    types.add("general_logic");
  }

  return Array.from(types);
}
