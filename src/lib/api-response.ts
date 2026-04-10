// src/lib/api-response.ts
// Helper functions to build standard ApiResponse<T> envelopes.
// Use these in every API route instead of raw NextResponse.json().
//
// Usage:
//   return ok(data)          → 200 { success: true, data }
//   return err("NOT_FOUND")  → 404 { success: false, error: { code, message } }

import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/index";

// ─── Success ──────────────────────────────────

export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

// ─── Error presets ────────────────────────────

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  UNAUTHORIZED:     { status: 401, message: "Authentication required." },
  FORBIDDEN:        { status: 403, message: "You do not have permission to perform this action." },
  NOT_FOUND:        { status: 404, message: "The requested resource was not found." },
  BAD_REQUEST:      { status: 400, message: "Invalid request." },
  CONFLICT:         { status: 409, message: "A resource with that identifier already exists." },
  PENDING_APPROVAL: { status: 403, message: "Your account is pending admin approval." },
  INTERNAL:         { status: 500, message: "An unexpected error occurred." },
};

export function err(
  code: string,
  overrideMessage?: string,
  overrideStatus?: number,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  const preset = ERROR_MAP[code] ?? ERROR_MAP["INTERNAL"];

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message: overrideMessage ?? preset.message,
      },
      details,
    },
    { status: overrideStatus ?? preset.status },
  );
}
