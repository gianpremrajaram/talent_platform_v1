"use client";
// src/app/ui-test/page.tsx
// Visual demo for Issue #22 shared UI components: LoadingState, EmptyState, ErrorBoundary.
// Dev-only page — remove before production deploy.

import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

function ThrowError() {
  throw new Error("This is a test render error.");
}

export default function UITestPage() {
  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1.5rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        UI Component Demo — Issue #22
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "2.5rem", fontSize: "0.9rem" }}>
        Visual reference for LoadingState, EmptyState, and ErrorBoundary.
      </p>

      {/* Loading State */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem" }}>
          1. LoadingState
        </h2>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", background: "#fafafa" }}>
          <LoadingState message="Searching students…" />
        </div>
      </section>

      {/* Empty State */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem" }}>
          2. EmptyState
        </h2>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", background: "#fafafa" }}>
          <EmptyState
            message="No matching students found."
            description="Try adjusting your search filters."
            actionLabel="Clear filters"
            onAction={() => alert("Clear filters clicked")}
          />
        </div>
      </section>

      {/* Error Boundary */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem" }}>
          3. ErrorBoundary
        </h2>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", background: "#fafafa", padding: "1rem" }}>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </div>
      </section>
    </main>
  );
}
