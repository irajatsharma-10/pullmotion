import { describe, it, expect } from "vitest";
import { parseSourceAST, parsePatchAST, isTestFilePath } from "@/lib/analysis/semantic-analyzer";

describe("Polyglot AST Parser - Boundary & Edge Cases", () => {
  describe("Rust Advanced Constructs", () => {
    const complexRustCode = `
use std::sync::{Arc, Mutex};
use tokio::sync::RwLock;

// Macro definition
macro_rules! define_metric {
    ($name:ident) => {
        pub struct $name;
    };
}

// Generics with trait bounds and lifetimes
pub struct Engine<'a, T: Clone + Send + 'static> {
    buffer: &'a [u8],
    state: Arc<RwLock<T>>,
}

impl<'a, T: Clone + Send + 'static> Engine<'a, T> {
    pub async fn process_turbofish<U: Default>(&self) -> Result<U, String> {
        let x = Vec::<U>::new();
        Ok(U::default())
    }
}

pub enum NetworkStatus {
    Connected { ip: String, latency_ms: u32 },
    Disconnected(String),
}
`;

    it("correctly extracts structs, generics, macros, enums, and methods without crashing", () => {
      const result = parseSourceAST("src/engine.rs", complexRustCode, [19, 20]);

      expect(result.language).toBe("rust");
      expect(result.imports.length).toBe(2);

      const symbolNames = result.symbols.map((s) => s.name);
      expect(symbolNames).toContain("Engine");
      expect(symbolNames).toContain("process_turbofish");
      expect(symbolNames).toContain("NetworkStatus");

      const exportNames = result.exports.map((e) => e.name);
      expect(exportNames).toContain("Engine");
      expect(exportNames).toContain("process_turbofish");
      expect(exportNames).toContain("NetworkStatus");

      expect(result.modifiedSymbols.some((s) => s.name === "process_turbofish")).toBe(true);
    });
  });

  describe("Python Complex Decorators & Nested Scopes", () => {
    const pythonCode = `
import functools
from typing import Optional, List

def retry(attempts: int = 3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorator

class OuterService:
    """
    Multi-line docstring
    with special characters: def dummy(): pass
    """
    class InnerWorker:
        def execute(self) -> None:
            pass

    @retry(attempts=5)
    async def process_batch(self, items: List[str]) -> Optional[int]:
        return len(items)
`;

    it("parses stacked decorators, docstrings, and nested classes accurately", () => {
      const result = parseSourceAST("services/batch_processor.py", pythonCode, [23, 24]);

      expect(result.language).toBe("python");
      expect(result.imports.length).toBe(2);

      const symbolNames = result.symbols.map((s) => s.name);
      expect(symbolNames).toContain("retry");
      expect(symbolNames).toContain("OuterService");
      expect(symbolNames).toContain("OuterService.process_batch");

      expect(result.modifiedSymbols.some((s) => s.name.includes("process_batch"))).toBe(true);
    });
  });

  describe("Go Struct Embedding, Interfaces & Receivers", () => {
    const goCode = `
package server

import (
    "context"
    "io"
)

type Reader interface {
    io.Reader
    ReadContext(ctx context.Context) ([]byte, error)
}

type BaseController struct {
    ID string
}

type UserController struct {
    BaseController
    service *UserService
}

func (c *UserController) GetUser(ctx context.Context, id string) (*User, error) {
    return &User{ID: id}, nil
}

func (c UserController) ValueReceiverMethod() bool {
    return true
}
`;

    it("extracts interfaces, embedded structs, and value/pointer receivers in Go", () => {
      const result = parseSourceAST("internal/server/controller.go", goCode, [20, 21]);

      expect(result.language).toBe("go");
      expect(result.imports.length).toBe(2);

      const symbolNames = result.symbols.map((s) => s.name);
      expect(symbolNames).toContain("Reader");
      expect(symbolNames).toContain("BaseController");
      expect(symbolNames).toContain("UserController");
      expect(symbolNames).toContain("GetUser");
      expect(symbolNames).toContain("ValueReceiverMethod");

      const exports = result.exports.map((e) => e.name);
      expect(exports).toContain("UserController");
      expect(exports).toContain("GetUser");
      expect(exports).toContain("ValueReceiverMethod");
    });
  });

  describe("Java Annotations, Records & Generics", () => {
    const javaCode = `
package com.app.controllers;

import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController<T extends BaseOrder> {

    @PostMapping("/{orderId}")
    public ResponseEntity<OrderResult> submitOrder(
        @PathVariable String orderId,
        @Valid @RequestBody OrderPayload payload
    ) {
        return ResponseEntity.ok(new OrderResult(orderId));
    }
}
`;

    it("extracts annotated Java classes and generic endpoint methods", () => {
      const result = parseSourceAST("src/main/java/com/app/controllers/OrderController.java", javaCode, [11, 12]);

      expect(result.language).toBe("java");
      expect(result.symbols.some((s) => s.name === "OrderController")).toBe(true);
      expect(result.symbols.some((s) => s.name === "submitOrder")).toBe(true);
      expect(result.modifiedSymbols.some((s) => s.name === "submitOrder")).toBe(true);
    });
  });

  describe("Syntax Error Resilience & Patch Fallback", () => {
    it("safely handles truncated or syntactically invalid source code without throwing", () => {
      const malformedPython = `
def broken_function(:
    if x >
`;
      expect(() => {
        const result = parseSourceAST("scripts/broken.py", malformedPython, [2]);
        expect(result.language).toBe("python");
      }).not.toThrow();
    });

    it("falls back gracefully on malformed diff patches", () => {
      const invalidPatch = `not a valid unified diff hunk\nrandom text\n+ broken line`;
      expect(() => {
        const result = parsePatchAST("pkg/service.go", invalidPatch);
        expect(result.language).toBe("go");
      }).not.toThrow();
    });
  });

  describe("Generated, Config & Test File Categorization", () => {
    it("identifies test files across varied naming conventions", () => {
      expect(isTestFilePath("src/auth.test.ts")).toBe(true);
      expect(isTestFilePath("src/auth.spec.tsx")).toBe(true);
      expect(isTestFilePath("tests/unit/test_api.py")).toBe(true);
      expect(isTestFilePath("pkg/store/store_test.go")).toBe(true);
      expect(isTestFilePath("src/test/java/UserServiceTest.java")).toBe(true);
      expect(isTestFilePath("src/test/java/UserIT.java")).toBe(true);
      expect(isTestFilePath("tests/integration_test.rs")).toBe(true);

      expect(isTestFilePath("src/services/authentication.ts")).toBe(false);
      expect(isTestFilePath("pkg/auth/store.go")).toBe(false);
    });

    it("identifies generated and config files properly in parseSourceAST", () => {
      const prismaSchema = parseSourceAST("prisma/schema.prisma", "datasource db { provider = \"postgresql\" }");
      expect(prismaSchema.isConfig).toBe(true);

      const dockerfile = parseSourceAST("Dockerfile", "FROM node:20-alpine\nWORKDIR /app");
      expect(dockerfile.isConfig).toBe(true);

      const pbGo = parseSourceAST("proto/service.pb.go", "// Code generated by protoc-gen-go. DO NOT EDIT.\npackage proto");
      expect(pbGo.isGenerated).toBe(true);
    });
  });
});
