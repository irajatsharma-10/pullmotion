import { describe, it, expect } from "vitest";
import { parseSourceAST, parsePatchAST } from "@/lib/analysis/semantic-analyzer";
import { buildDependencyGraph } from "@/lib/analysis/dependency-graph";

describe("Polyglot Semantic Analyzer", () => {
  // 1. Python Analysis
  describe("Python Parsing", () => {
    const pythonCode = `import os
from .services import AuthService
from datetime import datetime

class UserManager:
    def __init__(self, db_url: str):
        self.db = db_url

    async def authenticate_user(self, token: str) -> bool:
        if not token:
            return False
        return True

def standalone_helper(x: int) -> int:
    return x * 2

def _private_func():
    pass
`;

    it("extracts Python symbols, methods, imports, and exports", () => {
      const result = parseSourceAST("backend/user_manager.py", pythonCode, [9, 10]);

      expect(result.language).toBe("python");
      expect(result.imports.length).toBe(3);
      expect(result.imports.some((i) => i.source === ".services")).toBe(true);

      const symbolNames = result.symbols.map((s) => s.name);
      expect(symbolNames).toContain("UserManager");
      expect(symbolNames).toContain("UserManager.authenticate_user");
      expect(symbolNames).toContain("standalone_helper");

      const exportNames = result.exports.map((e) => e.name);
      expect(exportNames).toContain("UserManager");
      expect(exportNames).toContain("standalone_helper");
      expect(exportNames).not.toContain("_private_func"); // private not exported

      expect(result.modifiedSymbols.length).toBeGreaterThan(0);
      expect(result.modifiedSymbols.some((s) => s.name.includes("authenticate_user"))).toBe(true);
    });
  });

  // 2. Go Analysis
  describe("Go Parsing", () => {
    const goCode = `package auth

import (
    "context"
    "net/http"
)

type Session struct {
    UserID string
}

type Authenticator interface {
    Verify(ctx context.Context, token string) (*Session, error)
}

func NewAuthenticator() Authenticator {
    return &authImpl{}
}

func (a *authImpl) Verify(ctx context.Context, token string) (*Session, error) {
    return &Session{UserID: "123"}, nil
}

func internalHelper() bool {
    return true
}
`;

    it("extracts Go functions, methods, types, and uppercase exports", () => {
      const result = parseSourceAST("pkg/auth/authenticator.go", goCode, [20, 21]);

      expect(result.language).toBe("go");
      expect(result.imports.length).toBe(2);
      expect(result.imports.some((i) => i.source === "net/http")).toBe(true);

      const symbolNames = result.symbols.map((s) => s.name);
      expect(symbolNames).toContain("Session");
      expect(symbolNames).toContain("Authenticator");
      expect(symbolNames).toContain("NewAuthenticator");
      expect(symbolNames).toContain("Verify");
      expect(symbolNames).toContain("internalHelper");

      const exportNames = result.exports.map((e) => e.name);
      expect(exportNames).toContain("Session");
      expect(exportNames).toContain("Authenticator");
      expect(exportNames).toContain("NewAuthenticator");
      expect(exportNames).not.toContain("internalHelper"); // lowercase is unexported in Go

      expect(result.modifiedSymbols.some((s) => s.name === "Verify")).toBe(true);
    });
  });

  // 3. Rust Analysis
  describe("Rust Parsing", () => {
    const rustCode = `use std::sync::Arc;
use crate::models::User;
pub mod service;

pub struct DatabasePool {
    pub url: String,
}

pub enum DbError {
    NotFound,
    ConnectionFailed,
}

pub async fn connect_db(url: &str) -> Result<DatabasePool, DbError> {
    Ok(DatabasePool { url: url.to_string() })
}

fn internal_worker() {}
`;

    it("extracts Rust structs, enums, pub fn, and imports", () => {
      const result = parseSourceAST("src/db.rs", rustCode, [16]);

      expect(result.language).toBe("rust");
      expect(result.imports.length).toBe(3);
      expect(result.imports.some((i) => i.source === "crate::models::User")).toBe(true);

      const symbolNames = result.symbols.map((s) => s.name);
      expect(symbolNames).toContain("DatabasePool");
      expect(symbolNames).toContain("DbError");
      expect(symbolNames).toContain("connect_db");
      expect(symbolNames).toContain("internal_worker");

      const exportNames = result.exports.map((e) => e.name);
      expect(exportNames).toContain("DatabasePool");
      expect(exportNames).toContain("connect_db");
      expect(exportNames).not.toContain("internal_worker"); // non-pub not exported

      expect(result.modifiedSymbols.some((s) => s.name === "connect_db")).toBe(true);
    });
  });

  // 4. Java Analysis
  describe("Java Parsing", () => {
    const javaCode = `package com.example.service;

import java.util.List;
import com.example.models.Payment;

public class PaymentService {
    private final String apiKey;

    public PaymentService(String apiKey) {
        this.apiKey = apiKey;
    }

    public Payment processPayment(double amount) {
        return new Payment(amount);
    }
}
`;

    it("extracts Java classes, methods, and package imports", () => {
      const result = parseSourceAST("src/main/java/com/example/service/PaymentService.java", javaCode, [13, 14]);

      expect(result.language).toBe("java");
      expect(result.imports.length).toBe(2);
      expect(result.symbols.some((s) => s.name === "PaymentService")).toBe(true);
      expect(result.symbols.some((s) => s.name === "processPayment")).toBe(true);
      expect(result.modifiedSymbols.some((s) => s.name === "processPayment")).toBe(true);
    });
  });

  // 5. Cross-file Polyglot Dependency Graph & Test Pairing
  describe("Polyglot Dependency Graph & Test Pairing", () => {
    it("constructs graph edges and pairs tests across Python, Go, and Rust files", () => {
      const pyService = parseSourceAST(
        "services/auth.py",
        `def verify_token(token): return True`
      );
      const pyTest = parseSourceAST(
        "services/test_auth.py",
        `from .auth import verify_token\ndef test_auth(): assert verify_token('abc')`
      );

      const goA = parseSourceAST(
        "pkg/store/store.go",
        `package store\ntype Store struct{}`
      );
      const goB = parseSourceAST(
        "pkg/store/db.go",
        `package store\nfunc InitDB() *Store { return &Store{} }`
      );
      const goTest = parseSourceAST(
        "pkg/store/store_test.go",
        `package store\nimport "testing"\nfunc TestStore(t *testing.T) {}`
      );

      const graph = buildDependencyGraph([pyService, pyTest, goA, goB, goTest]);

      // Python test edge
      const pyTestEdge = graph.edges.find(
        (e) => e.from === "services/test_auth.py" && e.to === "services/auth.py"
      );
      expect(pyTestEdge).toBeDefined();

      // Go package co-location clustering edge
      const goCoLocation = graph.edges.find(
        (e) =>
          (e.from === "pkg/store/store.go" && e.to === "pkg/store/db.go") ||
          (e.from === "pkg/store/db.go" && e.to === "pkg/store/store.go")
      );
      expect(goCoLocation).toBeDefined();

      // Go test edge
      const goTestEdge = graph.edges.find(
        (e) => e.from === "pkg/store/store_test.go" && e.to === "pkg/store/store.go"
      );
      expect(goTestEdge).toBeDefined();
    });
  });

  // 6. Patch Parsing with Hunk Fallback
  describe("Patch Parsing with Hunk Header Fallback", () => {
    it("extracts symbols directly from hunk headers when only raw patch is available", () => {
      const pythonPatch = `@@ -15,4 +15,7 @@ def process_transaction(user_id, amount):
+    if amount <= 0:
+        raise ValueError("Invalid amount")
+    return True
`;

      const result = parsePatchAST("payments/processor.py", pythonPatch);
      expect(result.language).toBe("python");
      expect(result.symbols.length).toBeGreaterThan(0);
      expect(result.symbols.some((s) => s.name === "process_transaction")).toBe(true);
      expect(result.modifiedSymbols.some((s) => s.name === "process_transaction")).toBe(true);
    });
  });
});
