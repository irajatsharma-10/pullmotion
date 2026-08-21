import type {
  ASTSymbolDef,
  ExportRef,
  ImportRef,
  ImportSpecifier,
  SupportedLanguage,
} from "./semantic-analyzer";

export interface PolyglotScanResult {
  symbols: ASTSymbolDef[];
  imports: ImportRef[];
  exports: ExportRef[];
  modifiedSymbols: ASTSymbolDef[];
}

/**
 * Scans polyglot source code using lightweight, fast, deterministic lexical analysis.
 * Extracts symbols (functions, classes, structs, methods), imports, and exports without requiring full AST compilers.
 */
export function scanPolyglotSource(
  language: SupportedLanguage,
  sourceCode: string,
  modifiedLines: number[] = []
): PolyglotScanResult {
  if (!sourceCode || !sourceCode.trim()) {
    return { symbols: [], imports: [], exports: [], modifiedSymbols: [] };
  }

  let symbols: ASTSymbolDef[] = [];
  let imports: ImportRef[] = [];
  let exports: ExportRef[] = [];

  switch (language) {
    case "python":
      ({ symbols, imports, exports } = scanPython(sourceCode));
      break;
    case "go":
      ({ symbols, imports, exports } = scanGo(sourceCode));
      break;
    case "rust":
      ({ symbols, imports, exports } = scanRust(sourceCode));
      break;
    case "java":
    case "kotlin":
    case "csharp":
      ({ symbols, imports, exports } = scanJavaLike(sourceCode));
      break;
    case "cpp":
    case "c":
      ({ symbols, imports, exports } = scanCAndCpp(sourceCode));
      break;
    case "ruby":
      ({ symbols, imports, exports } = scanRuby(sourceCode));
      break;
    default:
      ({ symbols, imports, exports } = scanGenericCode(sourceCode));
      break;
  }

  // Intersect symbols with modified lines to compute modifiedSymbols
  const modifiedSet = new Set<string>();
  const modifiedSymbols: ASTSymbolDef[] = [];

  if (modifiedLines.length > 0) {
    for (const sym of symbols) {
      const isTouched = modifiedLines.some(
        (line) => line >= sym.startLine && line <= sym.endLine
      );
      if (isTouched && !modifiedSet.has(sym.name)) {
        modifiedSet.add(sym.name);
        modifiedSymbols.push(sym);
      }
    }
  }

  return { symbols, imports, exports, modifiedSymbols };
}

// -----------------------------------------------------------------------------
// 1. Python Scanner (Indentation & Def/Class-based)
// -----------------------------------------------------------------------------
function scanPython(code: string): {
  symbols: ASTSymbolDef[];
  imports: ImportRef[];
  exports: ExportRef[];
} {
  const lines = code.split("\n");
  const symbols: ASTSymbolDef[] = [];
  const imports: ImportRef[] = [];
  const exports: ExportRef[] = [];

  interface ActiveBlock {
    name: string;
    kind: ASTSymbolDef["kind"];
    startLine: number;
    indent: number;
    parent?: string;
  }

  const blockStack: ActiveBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Calculate leading indent
    const indent = line.search(/\S/);

    // Close any blocks that have higher or equal indent than current line
    while (blockStack.length > 0 && indent <= blockStack[blockStack.length - 1].indent) {
      const closed = blockStack.pop()!;
      const isExported = !closed.name.startsWith("_");
      symbols.push({
        name: closed.parent ? `${closed.parent}.${closed.name}` : closed.name,
        kind: closed.kind,
        startLine: closed.startLine,
        endLine: Math.max(closed.startLine, lineNum - 1),
        isExported,
        parentSymbol: closed.parent,
      });
      if (isExported && !closed.parent) {
        exports.push({
          name: closed.name,
          kind: closed.kind === "class" ? "class" : "function",
          line: closed.startLine,
        });
      }
    }

    // 1. Python Imports
    // Pattern A: from .utils import foo, bar OR from package.sub import foo
    const fromMatch = trimmed.match(/^from\s+([.\w]+)\s+import\s+(.+)$/);
    if (fromMatch) {
      const source = fromMatch[1];
      const specifiersRaw = fromMatch[2].replace(/[()]/g, "").split(",");
      const specifiers: ImportSpecifier[] = specifiersRaw
        .map((s) => s.trim().split(/\s+as\s+/)[0])
        .filter(Boolean)
        .map((name) => ({ name }));

      imports.push({
        source,
        specifiers,
        line: lineNum,
      });
      continue;
    }

    // Pattern B: import foo, bar OR import os.path as path
    const importMatch = trimmed.match(/^import\s+(.+)$/);
    if (importMatch && !trimmed.startsWith("import (")) {
      const modulesRaw = importMatch[1].split(",");
      for (const raw of modulesRaw) {
        const mod = raw.trim().split(/\s+as\s+/)[0].trim();
        if (mod) {
          imports.push({
            source: mod,
            specifiers: [{ name: mod }],
            line: lineNum,
          });
        }
      }
      continue;
    }

    // 2. Python Function Definitions: (async )?def name(...)
    const defMatch = trimmed.match(/^(?:async\s+)?def\s+([a-zA-Z_]\w*)\s*\(/);
    if (defMatch) {
      const name = defMatch[1];
      const parent = blockStack.length > 0 ? blockStack[blockStack.length - 1].name : undefined;
      const kind: ASTSymbolDef["kind"] = parent ? "method" : "function";
      blockStack.push({
        name,
        kind,
        startLine: lineNum,
        indent,
        parent,
      });
      continue;
    }

    // 3. Python Class Definitions: class Name(...):
    const classMatch = trimmed.match(/^class\s+([a-zA-Z_]\w*)/);
    if (classMatch) {
      const name = classMatch[1];
      blockStack.push({
        name,
        kind: "class",
        startLine: lineNum,
        indent,
      });
      continue;
    }
  }

  // Close remaining open blocks at end of file
  while (blockStack.length > 0) {
    const closed = blockStack.pop()!;
    const isExported = !closed.name.startsWith("_");
    symbols.push({
      name: closed.parent ? `${closed.parent}.${closed.name}` : closed.name,
      kind: closed.kind,
      startLine: closed.startLine,
      endLine: lines.length,
      isExported,
      parentSymbol: closed.parent,
    });
    if (isExported && !closed.parent) {
      exports.push({
        name: closed.name,
        kind: closed.kind === "class" ? "class" : "function",
        line: closed.startLine,
      });
    }
  }

  return { symbols, imports, exports };
}

// -----------------------------------------------------------------------------
// 2. Go Scanner (Package, Braces, Uppercase Exports)
// -----------------------------------------------------------------------------
function scanGo(code: string): {
  symbols: ASTSymbolDef[];
  imports: ImportRef[];
  exports: ExportRef[];
} {
  const lines = code.split("\n");
  const symbols: ASTSymbolDef[] = [];
  const imports: ImportRef[] = [];
  const exports: ExportRef[] = [];

  let inMultiImport = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("//")) continue;

    // Go Imports (Multi-line import block)
    if (trimmed.startsWith("import (")) {
      inMultiImport = true;
      continue;
    }

    if (inMultiImport) {
      if (trimmed === ")") {
        inMultiImport = false;
        continue;
      }
      const match = trimmed.match(/(?:(\w+)\s+)?"([^"]+)"/);
      if (match) {
        const source = match[2];
        imports.push({
          source,
          specifiers: [{ name: source.split("/").pop() || source }],
          line: lineNum,
        });
      }
      continue;
    }

    // Go Imports (Single-line)
    const singleImport = trimmed.match(/^import\s+(?:(\w+)\s+)?"([^"]+)"/);
    if (singleImport) {
      const source = singleImport[2];
      imports.push({
        source,
        specifiers: [{ name: source.split("/").pop() || source }],
        line: lineNum,
      });
      continue;
    }

    // Go Function: func FuncName(...) OR func (r *Receiver) MethodName(...)
    const methodMatch = trimmed.match(/^func\s+\((?:[^)]+)\)\s+([a-zA-Z_]\w*)\s*\(/);
    const funcMatch = trimmed.match(/^func\s+([a-zA-Z_]\w*)\s*\(/);

    if (methodMatch || funcMatch) {
      const name = methodMatch ? methodMatch[1] : funcMatch![1];
      const isExported = /^[A-Z]/.test(name);
      const endLine = findClosingBraceLine(lines, i);

      symbols.push({
        name,
        kind: methodMatch ? "method" : "function",
        startLine: lineNum,
        endLine,
        isExported,
      });

      if (isExported) {
        exports.push({
          name,
          kind: "function",
          line: lineNum,
        });
      }
      continue;
    }

    // Go Type Struct / Interface: type StructName struct OR type InterfaceName interface
    const typeMatch = trimmed.match(/^type\s+([a-zA-Z_]\w*)\s+(struct|interface)/);
    if (typeMatch) {
      const name = typeMatch[1];
      const kind = typeMatch[2] === "struct" ? "class" : "interface";
      const isExported = /^[A-Z]/.test(name);
      const endLine = findClosingBraceLine(lines, i);

      symbols.push({
        name,
        kind,
        startLine: lineNum,
        endLine,
        isExported,
      });

      if (isExported) {
        exports.push({
          name,
          kind,
          line: lineNum,
        });
      }
      continue;
    }
  }

  return { symbols, imports, exports };
}

// -----------------------------------------------------------------------------
// 3. Rust Scanner (Pub Visibility, Use, Mod)
// -----------------------------------------------------------------------------
function scanRust(code: string): {
  symbols: ASTSymbolDef[];
  imports: ImportRef[];
  exports: ExportRef[];
} {
  const lines = code.split("\n");
  const symbols: ASTSymbolDef[] = [];
  const imports: ImportRef[] = [];
  const exports: ExportRef[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("//")) continue;

    // Rust `use` imports: use crate::foo::bar; OR use std::collections::HashMap;
    const useMatch = trimmed.match(/^(?:pub\s+)?use\s+([^;]+);/);
    if (useMatch) {
      const source = useMatch[1].trim();
      const isExported = trimmed.startsWith("pub ");
      imports.push({
        source,
        specifiers: [{ name: source.split("::").pop() || source }],
        line: lineNum,
      });
      if (isExported) {
        exports.push({
          name: source.split("::").pop() || source,
          kind: "re-export",
          line: lineNum,
        });
      }
      continue;
    }

    // Rust `mod` declaration: mod foo; OR pub mod foo;
    const modMatch = trimmed.match(/^(?:pub(?:\([^)]+\))?\s+)?mod\s+([a-zA-Z_]\w*)\s*;/);
    if (modMatch) {
      const name = modMatch[1];
      imports.push({
        source: `./${name}`,
        specifiers: [{ name }],
        line: lineNum,
      });
      continue;
    }

    // Rust Functions: (pub )?(async )?fn name(...)
    const fnMatch = trimmed.match(/^(pub(?:\([^)]+\))?\s+)?(?:async\s+)?(?:unsafe\s+)?fn\s+([a-zA-Z_]\w*)\s*[\(<]/);
    if (fnMatch) {
      const isExported = Boolean(fnMatch[1]);
      const name = fnMatch[2];
      const endLine = findClosingBraceLine(lines, i);

      symbols.push({
        name,
        kind: "function",
        startLine: lineNum,
        endLine,
        isExported,
      });

      if (isExported) {
        exports.push({
          name,
          kind: "function",
          line: lineNum,
        });
      }
      continue;
    }

    // Rust Struct / Enum / Trait
    const typeMatch = trimmed.match(
      /^(pub(?:\([^)]+\))?\s+)?(struct|enum|trait)\s+([a-zA-Z_]\w*)/
    );
    if (typeMatch) {
      const isExported = Boolean(typeMatch[1]);
      const kindType = typeMatch[2];
      const name = typeMatch[3];
      const kind: ASTSymbolDef["kind"] =
        kindType === "struct" ? "class" : kindType === "enum" ? "enum" : "interface";
      const endLine = findClosingBraceLine(lines, i);

      symbols.push({
        name,
        kind,
        startLine: lineNum,
        endLine,
        isExported,
      });

      if (isExported) {
        exports.push({
          name,
          kind,
          line: lineNum,
        });
      }
      continue;
    }
  }

  return { symbols, imports, exports };
}

// -----------------------------------------------------------------------------
// 4. Java / Kotlin / C# Scanner
// -----------------------------------------------------------------------------
function scanJavaLike(code: string): {
  symbols: ASTSymbolDef[];
  imports: ImportRef[];
  exports: ExportRef[];
} {
  const lines = code.split("\n");
  const symbols: ASTSymbolDef[] = [];
  const imports: ImportRef[] = [];
  const exports: ExportRef[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("//")) continue;

    // Java/Kotlin/C# Imports: import com.example.Foo; OR using System.IO;
    const importMatch = trimmed.match(/^(?:import|using)\s+([^;]+);?/);
    if (importMatch && !trimmed.includes("class ") && !trimmed.includes("function")) {
      const source = importMatch[1].trim();
      imports.push({
        source,
        specifiers: [{ name: source.split(".").pop() || source }],
        line: lineNum,
      });
      continue;
    }

    // Class / Interface / Record / Enum Declaration
    const classMatch = trimmed.match(
      /^(?:(?:public|protected|private|abstract|final|sealed|static)\s+)*(class|interface|enum|record)\s+([a-zA-Z_]\w*)/
    );
    if (classMatch) {
      const kindType = classMatch[1];
      const name = classMatch[2];
      const isExported = trimmed.startsWith("public") || trimmed.startsWith("protected") || !trimmed.startsWith("private");
      const kind: ASTSymbolDef["kind"] =
        kindType === "interface" ? "interface" : kindType === "enum" ? "enum" : "class";
      const endLine = findClosingBraceLine(lines, i);

      symbols.push({
        name,
        kind,
        startLine: lineNum,
        endLine,
        isExported,
      });

      if (isExported) {
        exports.push({
          name,
          kind,
          line: lineNum,
        });
      }
      continue;
    }

    // Method Declaration
    const methodMatch = trimmed.match(
      /^(?:(?:public|protected|private|static|async|override|fun)\s+)+[<>\w\[\]\?]+\s+([a-zA-Z_]\w*)\s*\(/
    );
    if (methodMatch && !trimmed.startsWith("if") && !trimmed.startsWith("while") && !trimmed.startsWith("for")) {
      const name = methodMatch[1];
      const isExported = trimmed.startsWith("public") || trimmed.startsWith("fun");
      const endLine = findClosingBraceLine(lines, i);

      symbols.push({
        name,
        kind: "method",
        startLine: lineNum,
        endLine,
        isExported,
      });
      continue;
    }
  }

  return { symbols, imports, exports };
}

// -----------------------------------------------------------------------------
// 5. C & C++ Scanner
// -----------------------------------------------------------------------------
function scanCAndCpp(code: string): {
  symbols: ASTSymbolDef[];
  imports: ImportRef[];
  exports: ExportRef[];
} {
  const lines = code.split("\n");
  const symbols: ASTSymbolDef[] = [];
  const imports: ImportRef[] = [];
  const exports: ExportRef[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("//")) continue;

    // #include "header.h" OR #include <vector>
    const includeMatch = trimmed.match(/^#include\s+["<]([^">]+)[">]/);
    if (includeMatch) {
      const source = includeMatch[1];
      imports.push({
        source,
        specifiers: [{ name: source.split("/").pop() || source }],
        line: lineNum,
      });
      continue;
    }

    // class Name OR struct Name
    const classMatch = trimmed.match(/^(?:class|struct)\s+([a-zA-Z_]\w*)\s*(?::|\{|$)/);
    if (classMatch) {
      const name = classMatch[1];
      const endLine = findClosingBraceLine(lines, i);
      symbols.push({
        name,
        kind: "class",
        startLine: lineNum,
        endLine,
        isExported: true,
      });
      exports.push({
        name,
        kind: "class",
        line: lineNum,
      });
      continue;
    }

    // Function definition: int funcName(...) {
    const funcMatch = trimmed.match(/^[a-zA-Z_][\w*&:<>\s]+\s+([a-zA-Z_]\w*)\s*\([^;]*\)\s*\{/);
    if (funcMatch && !trimmed.startsWith("if") && !trimmed.startsWith("while") && !trimmed.startsWith("switch")) {
      const name = funcMatch[1];
      const endLine = findClosingBraceLine(lines, i);
      symbols.push({
        name,
        kind: "function",
        startLine: lineNum,
        endLine,
        isExported: true,
      });
      exports.push({
        name,
        kind: "function",
        line: lineNum,
      });
      continue;
    }
  }

  return { symbols, imports, exports };
}

// -----------------------------------------------------------------------------
// 6. Ruby Scanner
// -----------------------------------------------------------------------------
function scanRuby(code: string): {
  symbols: ASTSymbolDef[];
  imports: ImportRef[];
  exports: ExportRef[];
} {
  const lines = code.split("\n");
  const symbols: ASTSymbolDef[] = [];
  const imports: ImportRef[] = [];
  const exports: ExportRef[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    // require 'json' OR require_relative 'helper'
    const reqMatch = trimmed.match(/^(?:require|require_relative)\s+['"]([^'"]+)['"]/);
    if (reqMatch) {
      imports.push({
        source: reqMatch[1],
        specifiers: [{ name: reqMatch[1] }],
        line: lineNum,
      });
      continue;
    }

    // def method_name
    const defMatch = trimmed.match(/^def\s+([a-zA-Z_]\w*)/);
    if (defMatch) {
      symbols.push({
        name: defMatch[1],
        kind: "function",
        startLine: lineNum,
        endLine: lineNum + 10, // Approximate ruby end
        isExported: true,
      });
      exports.push({
        name: defMatch[1],
        kind: "function",
        line: lineNum,
      });
      continue;
    }

    // class ClassName OR module ModuleName
    const classMatch = trimmed.match(/^(?:class|module)\s+([A-Z]\w*)/);
    if (classMatch) {
      symbols.push({
        name: classMatch[1],
        kind: "class",
        startLine: lineNum,
        endLine: lineNum + 20,
        isExported: true,
      });
      exports.push({
        name: classMatch[1],
        kind: "class",
        line: lineNum,
      });
      continue;
    }
  }

  return { symbols, imports, exports };
}

// -----------------------------------------------------------------------------
// 7. Generic Fallback
// -----------------------------------------------------------------------------
function scanGenericCode(code: string): {
  symbols: ASTSymbolDef[];
  imports: ImportRef[];
  exports: ExportRef[];
} {
  const lines = code.split("\n");
  const symbols: ASTSymbolDef[] = [];
  const imports: ImportRef[] = [];
  const exports: ExportRef[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    // Universal function / method pattern
    const match = trimmed.match(/^(?:function|def|fn|func|sub)\s+([a-zA-Z_]\w*)/);
    if (match) {
      const name = match[1];
      symbols.push({
        name,
        kind: "function",
        startLine: lineNum,
        endLine: lineNum + 10,
        isExported: true,
      });
      exports.push({
        name,
        kind: "function",
        line: lineNum,
      });
    }
  }

  return { symbols, imports, exports };
}

// -----------------------------------------------------------------------------
// Helper: Bracket/Brace Matching for Line Boundaries
// -----------------------------------------------------------------------------
function findClosingBraceLine(lines: string[], startIdx: number): number {
  let openCount = 0;
  let hasOpened = false;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    for (const char of line) {
      if (char === "{") {
        openCount++;
        hasOpened = true;
      } else if (char === "}") {
        openCount--;
        if (hasOpened && openCount <= 0) {
          return i + 1; // 1-indexed
        }
      }
    }
  }

  return lines.length;
}
