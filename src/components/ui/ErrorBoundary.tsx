"use client";
// src/components/ErrorBoundary.tsx
// Client-side React error boundary. Wrap any subtree that might throw
// during render (e.g. data-fetching hooks, dynamic imports).
//
// Usage:
//   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
//     <SomeComponent />
//   </ErrorBoundary>

import React from "react";

interface Props {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // TODO: wire to a real logging service when available
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            style={{
              padding: "1.5rem",
              border: "1px solid #f87171",
              borderRadius: "0.5rem",
              color: "#b91c1c",
              background: "#fef2f2",
            }}
          >
            <strong>Something went wrong.</strong>
            {this.state.message && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                {this.state.message}
              </p>
            )}
            <button
              onClick={this.reset}
              style={{
                marginTop: "0.75rem",
                fontSize: "0.875rem",
                textDecoration: "underline",
                cursor: "pointer",
                background: "none",
                border: "none",
                color: "#b91c1c",
              }}
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
