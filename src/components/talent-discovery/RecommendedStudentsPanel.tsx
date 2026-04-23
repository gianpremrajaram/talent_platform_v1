"use client";
// src/components/talent-discovery/RecommendedStudentsPanel.tsx
// Platinum-only view. Lists AdminRecommendation rows pushed to this
// recruiter's own firm by platform admins.
//
// Data source: /api/recruiter/recommended-students. firmId is derived
// server-side from the session, so this panel cannot be tricked into
// showing another firm's recommendations.

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import type { RecommendationRow } from "@/types/index";

export default function RecommendedStudentsPanel() {
  const [rows, setRows] = useState<RecommendationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/recruiter/recommended-students");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (!cancelled) setError(body?.error ?? "Failed to load recommendations.");
          return;
        }
        const data: RecommendationRow[] = await res.json();
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError("Something went wrong loading recommendations.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card
      sx={{
        borderRadius: "8px",
        border: "1px solid #e7e9ee",
        boxShadow: "none",
        p: 2,
      }}
    >
      <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>
        Students recommended to your organisation
      </Typography>
      <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 1.5 }}>
        Curated by platform admins on your behalf. Revoked recommendations
        disappear on the next load.
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={20} />
        </Box>
      ) : error ? (
        <Typography sx={{ fontSize: 13, color: "#b91c1c" }} role="alert">
          {error}
        </Typography>
      ) : rows.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
          No recommendations yet. Platform admins will surface candidates here
          as they match them to your organisation.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {rows.map((r) => (
            <Box
              key={r.id}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                p: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1.5,
                backgroundColor: "#fff",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {r.student.firstName} {r.student.lastName}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                  {r.student.email}. Recommended{" "}
                  {new Date(r.createdAt).toLocaleDateString()}.
                </Typography>
              </Box>
              <Button
                component={Link}
                href={`/talent-discovery/student-profile/${r.studentId}`}
                size="small"
                variant="outlined"
                startIcon={<PersonOutlineIcon fontSize="small" />}
                sx={{ fontSize: 12, borderRadius: 1.5, whiteSpace: "nowrap", textTransform: "none" }}
              >
                View Profile
              </Button>
            </Box>
          ))}
        </Stack>
      )}
    </Card>
  );
}
