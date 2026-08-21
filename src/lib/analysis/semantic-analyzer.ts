import * as ts from "typescript";
import { scanPolyglotSource } from "./polyglot-scanner";

export type SupportedLanguage =
  | "typescript"
  | "tsx"
  | "javascript"
  | "jsx"
  | "python"
  | "go"
  | "rust"
  | "java"
  | "kotlin"
  | "csharp"
  | "cpp"
  | "c"
  | "ruby"
  | "php"
  | "swift"
  | "shell"
  | "json"
  | "markdown"
  | "yaml"
  | "css"
  | "html"
  | "sql"
  | "other";

export interface ImportSpecifier {
  name: string;
  propertyName?: string;
  isTypeOnly?: boolean;
}

export interface ImportRef {
  source: string;
  specifiers: ImportSpecifier[];
  defaultImport?: string;
  namespaceImport?: string;
  isTypeOnly?: boolean;
  line: number;
}

export interface ExportRef {
  name: string;
  kind:
  | "function"
  | "class"
  | "interface"
  | "type"
  | "enum"
  | "const"
  | "variable"
  | "re-export"
  | "default";
  line: number;
  isDefault?: boolean;
  reExportSource?: string;
}

export interface ASTSymbolDef {
  name: string;
  kind:
  | "function"
  | "class"
  | "interface"
  | "type"
  | "enum"
  | "const"
  | "variable"
  | "method"
  | "property";
  startLine: number;
  endLine: number;
  isExported: boolean;
  parentSymbol?: string;
}

export interface SemanticFileInfo {
  path: string;
  language: SupportedLanguage;
  imports: ImportRef[];
  exports: ExportRef[];
  symbols: ASTSymbolDef[];
  modifiedSymbols: ASTSymbolDef[];
  isTest: boolean;
  isGenerated: boolean;
  isConfig: boolean;
  isEntrypoint: boolean;
  totalLines: number;
}

/**
 * Detect language from file path extension
 */
export function detectLanguage(path: string): SupportedLanguage {
  const p = path.toLowerCase();
  if (p.endsWith(".ts")) return "typescript";
  if (p.endsWith(".tsx")) return "tsx";
  if (p.endsWith(".js") || p.endsWith(".mjs") || p.endsWith(".cjs")) return "javascript";
  if (p.endsWith(".jsx")) return "jsx";
  if (p.endsWith(".py") || p.endsWith(".pyw")) return "python";
  if (p.endsWith(".go")) return "go";
  if (p.endsWith(".rs")) return "rust";
  if (p.endsWith(".java")) return "java";
  if (p.endsWith(".kt") || p.endsWith(".kts")) return "kotlin";
  if (p.endsWith(".cs")) return "csharp";
  if (p.endsWith(".cpp") || p.endsWith(".cc") || p.endsWith(".cxx") || p.endsWith(".hpp") || p.endsWith(".hh")) return "cpp";
  if (p.endsWith(".c") || p.endsWith(".h")) return "c";
  if (p.endsWith(".rb")) return "ruby";
  if (p.endsWith(".php")) return "php";
  if (p.endsWith(".swift")) return "swift";
  if (p.endsWith(".sh") || p.endsWith(".bash") || p.endsWith(".zsh")) return "shell";
  if (p.endsWith(".json") || p.endsWith(".jsonc")) return "json";
  if (p.endsWith(".md") || p.endsWith(".mdx")) return "markdown";
  if (p.endsWith(".yml") || p.endsWith(".yaml")) return "yaml";
  if (p.endsWith(".css") || p.endsWith(".scss") || p.endsWith(".sass") || p.endsWith(".less")) return "css";
  if (p.endsWith(".html") || p.endsWith(".htm")) return "html";
  if (p.endsWith(".sql")) return "sql";
  return "other";
}

export function isCodeFile(lang: SupportedLanguage): boolean {
  return (
    lang === "typescript" ||
    lang === "tsx" ||
    lang === "javascript" ||
    lang === "jsx" ||
    lang === "python" ||
    lang === "go" ||
    lang === "rust" ||
    lang === "java" ||
    lang === "kotlin" ||
    lang === "csharp" ||
    lang === "cpp" ||
    lang === "c" ||
    lang === "ruby" ||
    lang === "php" ||
    lang === "swift" ||
    lang === "shell"
  );
}

export function isTypeScriptOrJavaScript(lang: SupportedLanguage): boolean {
  return lang === "typescript" || lang === "tsx" || lang === "javascript" || lang === "jsx";
}

function getScriptKind(lang: SupportedLanguage): ts.ScriptKind {
  switch (lang) {
    case "typescript":
      return ts.ScriptKind.TS;
    case "tsx":
      return ts.ScriptKind.TSX;
    case "javascript":
      return ts.ScriptKind.JS;
    case "jsx":
      return ts.ScriptKind.JSX;
    case "json":
      return ts.ScriptKind.JSON;
    default:
      return ts.ScriptKind.Unknown;
  }
}

/**
 * Parses full source code using the official TypeScript Compiler AST API for TS/JS,
 * and lightweight deterministic polyglot scanners for Python, Go, Rust, Java, C++, etc.
 * Never throws on syntax errors.
 */
export function parseSourceAST(
  filePath: string,
  sourceCode: string,
  modifiedLines: number[] = []
): SemanticFileInfo {
  const language = detectLanguage(filePath);
  const isTest = isTestFilePath(filePath);
  const isGenerated = isGeneratedFilePath(filePath);
  const isConfig = isConfigFilePath(filePath);
  const isEntrypoint = isEntrypointFilePath(filePath);

  if (!isCodeFile(language) || !sourceCode.trim()) {
    return {
      path: filePath,
      language,
      imports: [],
      exports: [],
      symbols: [],
      modifiedSymbols: [],
      isTest,
      isGenerated,
      isConfig,
      isEntrypoint,
      totalLines: sourceCode ? sourceCode.split("\n").length : 0,
    };
  }

  // Tier 2: Polyglot Lexical Scanner for non-TS/JS languages
  if (!isTypeScriptOrJavaScript(language)) {
    const polyglot = scanPolyglotSource(language, sourceCode, modifiedLines);
    return {
      path: filePath,
      language,
      imports: polyglot.imports,
      exports: polyglot.exports,
      symbols: polyglot.symbols,
      modifiedSymbols: polyglot.modifiedSymbols,
      isTest,
      isGenerated,
      isConfig,
      isEntrypoint,
      totalLines: sourceCode ? sourceCode.split("\n").length : 0,
    };
  }

  // Tier 1: Full TypeScript AST for TypeScript and JavaScript
  const scriptKind = getScriptKind(language);
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  const imports: ImportRef[] = [];
  const exports: ExportRef[] = [];
  const symbols: ASTSymbolDef[] = [];

  function getLine(pos: number): number {
    return sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
  }

  function hasExportModifier(node: ts.Node): boolean {
    if (!ts.canHaveModifiers(node)) return false;
    const modifiers = ts.getModifiers(node);
    if (!modifiers) return false;
    return modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  }

  function hasDefaultModifier(node: ts.Node): boolean {
    if (!ts.canHaveModifiers(node)) return false;
    const modifiers = ts.getModifiers(node);
    if (!modifiers) return false;
    return modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
  }

  function visit(node: ts.Node, parentSymbolName?: string) {
    // 1. Import Declarations
    if (ts.isImportDeclaration(node)) {
      const line = getLine(node.getStart(sourceFile));
      let source = "";
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        source = node.moduleSpecifier.text;
      }

      const isTypeOnly = node.importClause?.isTypeOnly ?? false;
      const specifiers: ImportSpecifier[] = [];
      let defaultImport: string | undefined;
      let namespaceImport: string | undefined;

      if (node.importClause) {
        if (node.importClause.name) {
          defaultImport = node.importClause.name.text;
        }
        if (node.importClause.namedBindings) {
          if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            namespaceImport = node.importClause.namedBindings.name.text;
          } else if (ts.isNamedImports(node.importClause.namedBindings)) {
            for (const el of node.importClause.namedBindings.elements) {
              specifiers.push({
                name: el.name.text,
                propertyName: el.propertyName?.text,
                isTypeOnly: el.isTypeOnly || isTypeOnly,
              });
            }
          }
        }
      }

      if (source) {
        imports.push({
          source,
          specifiers,
          defaultImport,
          namespaceImport,
          isTypeOnly,
          line,
        });
      }
    }

    // 2. Export Declarations (e.g. export { a, b } from './c')
    else if (ts.isExportDeclaration(node)) {
      const line = getLine(node.getStart(sourceFile));
      let reExportSource: string | undefined;
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        reExportSource = node.moduleSpecifier.text;
      }

      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const el of node.exportClause.elements) {
          exports.push({
            name: el.name.text,
            kind: "re-export",
            line,
            reExportSource,
          });
        }
      }
    }

    // 3. Export Assignment (e.g. export default foo; or export = foo;)
    else if (ts.isExportAssignment(node)) {
      const line = getLine(node.getStart(sourceFile));
      const expName = node.expression && ts.isIdentifier(node.expression)
        ? node.expression.text
        : "default";
      exports.push({
        name: expName,
        kind: "default",
        line,
        isDefault: true,
      });
    }

    // 4. Function Declaration
    else if (ts.isFunctionDeclaration(node)) {
      const startLine = getLine(node.getStart(sourceFile));
      const endLine = getLine(node.getEnd());
      const name = node.name?.text || (hasDefaultModifier(node) ? "default" : "anonymous_fn");
      const isExported = hasExportModifier(node);
      const isDefault = hasDefaultModifier(node);

      const symbol: ASTSymbolDef = {
        name,
        kind: "function",
        startLine,
        endLine,
        isExported,
      };
      symbols.push(symbol);

      if (isExported) {
        exports.push({
          name,
          kind: "function",
          line: startLine,
          isDefault,
        });
      }
    }

    // 5. Class Declaration
    else if (ts.isClassDeclaration(node)) {
      const startLine = getLine(node.getStart(sourceFile));
      const endLine = getLine(node.getEnd());
      const name = node.name?.text || (hasDefaultModifier(node) ? "default" : "anonymous_class");
      const isExported = hasExportModifier(node);
      const isDefault = hasDefaultModifier(node);

      const symbol: ASTSymbolDef = {
        name,
        kind: "class",
        startLine,
        endLine,
        isExported,
      };
      symbols.push(symbol);

      if (isExported) {
        exports.push({
          name,
          kind: "class",
          line: startLine,
          isDefault,
        });
      }

      // Visit class members for methods/properties
      for (const member of node.members) {
        if (ts.isMethodDeclaration(member)) {
          const mStart = getLine(member.getStart(sourceFile));
          const mEnd = getLine(member.getEnd());
          const mName = member.name && ts.isIdentifier(member.name) ? member.name.text : "method";
          symbols.push({
            name: `${name}.${mName}`,
            kind: "method",
            startLine: mStart,
            endLine: mEnd,
            isExported: false,
            parentSymbol: name,
          });
        }
      }
    }

    // 6. Interface Declaration
    else if (ts.isInterfaceDeclaration(node)) {
      const startLine = getLine(node.getStart(sourceFile));
      const endLine = getLine(node.getEnd());
      const name = node.name.text;
      const isExported = hasExportModifier(node);

      symbols.push({
        name,
        kind: "interface",
        startLine,
        endLine,
        isExported,
      });

      if (isExported) {
        exports.push({
          name,
          kind: "interface",
          line: startLine,
        });
      }
    }

    // 7. Type Alias Declaration
    else if (ts.isTypeAliasDeclaration(node)) {
      const startLine = getLine(node.getStart(sourceFile));
      const endLine = getLine(node.getEnd());
      const name = node.name.text;
      const isExported = hasExportModifier(node);

      symbols.push({
        name,
        kind: "type",
        startLine,
        endLine,
        isExported,
      });

      if (isExported) {
        exports.push({
          name,
          kind: "type",
          line: startLine,
        });
      }
    }

    // 8. Enum Declaration
    else if (ts.isEnumDeclaration(node)) {
      const startLine = getLine(node.getStart(sourceFile));
      const endLine = getLine(node.getEnd());
      const name = node.name.text;
      const isExported = hasExportModifier(node);

      symbols.push({
        name,
        kind: "enum",
        startLine,
        endLine,
        isExported,
      });

      if (isExported) {
        exports.push({
          name,
          kind: "enum",
          line: startLine,
        });
      }
    }

    // 9. Variable Statement (const, let, var, arrow functions)
    else if (ts.isVariableStatement(node)) {
      const startLine = getLine(node.getStart(sourceFile));
      const endLine = getLine(node.getEnd());
      const isExported = hasExportModifier(node);
      const isConst = (node.declarationList.flags & ts.NodeFlags.Const) !== 0;

      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          const name = decl.name.text;
          const isArrowFn = decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer));
          const kind = isArrowFn ? "function" : isConst ? "const" : "variable";

          symbols.push({
            name,
            kind,
            startLine,
            endLine,
            isExported,
          });

          if (isExported) {
            exports.push({
              name,
              kind,
              line: startLine,
            });
          }
        }
      }
    }

    ts.forEachChild(node, (child) => visit(child, parentSymbolName));
  }

  visit(sourceFile);

  // Compute modified symbols by intersecting AST symbol line spans with modified line numbers
  const modifiedSet = new Set<string>();
  const modifiedSymbols: ASTSymbolDef[] = [];

  if (modifiedLines.length > 0) {
    for (const sym of symbols) {
      const isTouched = modifiedLines.some((l) => l >= sym.startLine && l <= sym.endLine);
      if (isTouched && !modifiedSet.has(sym.name)) {
        modifiedSet.add(sym.name);
        modifiedSymbols.push(sym);
      }
    }
  }

  const lineCount = sourceFile.getLineAndCharacterOfPosition(sourceFile.getEnd()).line + 1;

  return {
    path: filePath,
    language,
    imports,
    exports,
    symbols,
    modifiedSymbols,
    isTest,
    isGenerated,
    isConfig,
    isEntrypoint,
    totalLines: lineCount,
  };
}

/**
 * Extracts modified symbols and imports from a unified diff patch alone
 * when full HEAD file content is not available.
 * Reconstructs clean added code and parses with AST / Polyglot parser.
 */
export function parsePatchAST(
  filePath: string,
  patch: string
): SemanticFileInfo {
  const language = detectLanguage(filePath);
  const isTest = isTestFilePath(filePath);
  const isGenerated = isGeneratedFilePath(filePath);
  const isConfig = isConfigFilePath(filePath);
  const isEntrypoint = isEntrypointFilePath(filePath);

  if (!patch || !isCodeFile(language)) {
    return {
      path: filePath,
      language,
      imports: [],
      exports: [],
      symbols: [],
      modifiedSymbols: [],
      isTest,
      isGenerated,
      isConfig,
      isEntrypoint,
      totalLines: patch ? patch.split("\n").length : 0,
    };
  }

  // Extract clean added/context code from the patch
  const patchLines = patch.split("\n");
  const reconstructedLines: string[] = [];
  const modifiedLineIndices: number[] = [];
  const hunkSymbols: ASTSymbolDef[] = [];

  let currentLineNumber = 1;
  for (const line of patchLines) {
    if (line.startsWith("@@")) {
      // Parse hunk header @@ -old,count +new,count @@ headerText
      const match = line.match(/^@@\s+-(\d+)(?:,\d+)?\s+\+(\d+)(?:,(\d+))?\s+@@\s*(.*)$/);
      if (match) {
        currentLineNumber = parseInt(match[2], 10);
        const count = match[3] ? parseInt(match[3], 10) : 1;
        const headerContext = match[4]?.trim();
        if (headerContext) {
          const symMatch = headerContext.match(
            /(?:(?:async\s+)?(?:def|func|fn|function|class|struct|interface)\s+)?([a-zA-Z_]\w*)/
          );
          if (
            symMatch &&
            symMatch[1] &&
            !["if", "else", "for", "while", "switch", "case"].includes(symMatch[1])
          ) {
            hunkSymbols.push({
              name: symMatch[1],
              kind: "function",
              startLine: currentLineNumber,
              endLine: currentLineNumber + count,
              isExported: true,
            });
          }
        }
      }
      continue;
    }
    if (line.startsWith("-")) {
      // Deleted line
      continue;
    }
    if (line.startsWith("+")) {
      // Added line
      reconstructedLines.push(line.slice(1));
      modifiedLineIndices.push(currentLineNumber);
      currentLineNumber++;
      continue;
    }
    // Context line or unchanged
    const cleanContext = line.startsWith(" ") ? line.slice(1) : line;
    reconstructedLines.push(cleanContext);
    currentLineNumber++;
  }

  const reconstructedCode = reconstructedLines.join("\n");
  const result = parseSourceAST(filePath, reconstructedCode, modifiedLineIndices);

  // If no symbols were detected from reconstructed source, merge hunk header fallback symbols
  if (result.symbols.length === 0 && hunkSymbols.length > 0) {
    result.symbols = hunkSymbols;
    result.modifiedSymbols = hunkSymbols;
  }

  return result;
}

// Helpers
export function isTestFilePath(p: string): boolean {
  const lower = p.toLowerCase();
  return (
    lower.includes(".test.") ||
    lower.includes(".spec.") ||
    lower.includes("__tests__") ||
    lower.includes("/test/") ||
    lower.includes("/tests/") ||
    lower.endsWith(".test.ts") ||
    lower.endsWith(".test.js") ||
    lower.endsWith(".test.tsx") ||
    lower.endsWith(".test.jsx") ||
    lower.endsWith(".spec.ts") ||
    lower.endsWith(".spec.js") ||
    lower.endsWith(".spec.tsx") ||
    lower.endsWith("_test.go") ||
    lower.endsWith("_test.py") ||
    lower.startsWith("test_") ||
    lower.includes("/test_") ||
    lower.endsWith("_spec.rb") ||
    lower.endsWith("test.java") ||
    lower.endsWith("tests.java") ||
    lower.endsWith("test.kt") ||
    lower.endsWith("tests.kt") ||
    lower.endsWith("test.cs") ||
    lower.endsWith("tests.cs") ||
    lower.endsWith("_test.cpp") ||
    lower.endsWith("_test.cc") ||
    lower.endsWith("test.rs")
  );
}

function isGeneratedFilePath(p: string): boolean {
  const lower = p.toLowerCase();
  return (
    lower.endsWith(".generated.ts") ||
    lower.endsWith(".generated.js") ||
    lower.endsWith(".d.ts") ||
    lower.endsWith(".min.js") ||
    lower.endsWith(".bundle.js") ||
    lower.endsWith(".pb.go") ||
    lower.endsWith("_pb2.py") ||
    lower.includes("/generated/") ||
    lower.includes("/build/") ||
    lower.includes("/dist/") ||
    lower.endsWith("lock.json") ||
    lower.endsWith(".lock")
  );
}

function isConfigFilePath(p: string): boolean {
  const lower = p.toLowerCase();
  return (
    lower.includes("config") ||
    lower.includes("tsconfig") ||
    lower.includes(".eslintrc") ||
    lower.includes("package.json") ||
    lower.includes("cargo.toml") ||
    lower.includes("go.mod") ||
    lower.includes("requirements.txt") ||
    lower.includes("gemfile") ||
    lower.includes("pom.xml") ||
    lower.includes("build.gradle") ||
    lower.endsWith(".prisma") ||
    lower.includes("dockerfile") ||
    lower.startsWith(".github/") ||
    lower.endsWith(".env.example")
  );
}

function isEntrypointFilePath(p: string): boolean {
  const lower = p.toLowerCase();
  return (
    lower.endsWith("page.tsx") ||
    lower.endsWith("route.ts") ||
    lower.endsWith("layout.tsx") ||
    lower.endsWith("index.ts") ||
    lower.endsWith("main.ts") ||
    lower.endsWith("main.py") ||
    lower.endsWith("app.py") ||
    lower.endsWith("main.go") ||
    lower.endsWith("main.rs") ||
    lower.endsWith("lib.rs") ||
    lower.endsWith("server.ts") ||
    lower.endsWith("server.py") ||
    lower.endsWith("server.go") ||
    lower.includes("/bin/") ||
    lower.includes("/api/") ||
    lower.includes("/cmd/")
  );
}
