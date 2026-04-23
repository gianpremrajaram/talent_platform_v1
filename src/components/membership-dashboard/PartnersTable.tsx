"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AdminDataTable, { AdminTableColumn } from "./AdminDataTable";

type MembershipTier = "silver" | "gold" | "platinum" | string | null;

type JobPostingRow = {
  id: string;
  companyName: string;
  jobTitle: string;
  datePosted: string;
  tier: MembershipTier;
  isActive: boolean;
};

type Props = {
  onRowsChanged?: () => void;
};

const columns: AdminTableColumn[] = [
  { key: "companyName", label: "COMPANY NAME", width: "26%" },
  { key: "jobTitle",    label: "JOB TITLE",    width: "28%" },
  { key: "datePosted",  label: "DATE POSTED",  width: "16%" },
  { key: "tier",        label: "TIER",         width: "12%" },
  { key: "status",      label: "STATUS",       width: "18%" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PartnersTable({ onRowsChanged: _ }: Props) {
  const [rows, setRows] = useState<JobPostingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  const loadRows = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/admin/partner-projects");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrorMessage(body?.error ?? "Failed to load job postings.");
        return;
      }
      const data: JobPostingRow[] = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setErrorMessage("Something went wrong loading job postings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRows(); }, [loadRows]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter(
      (row) =>
        row.companyName.toLowerCase().includes(keyword) ||
        row.jobTitle.toLowerCase().includes(keyword),
    );
  }, [rows, search]);

  const tableAriaLabel = loading
    ? "All job postings table. Loading."
    : filteredRows.length === 0
      ? "All job postings table. No job postings found."
      : `All job postings table. ${filteredRows.length} posting${filteredRows.length === 1 ? "" : "s"}.`;

  return (
    <Card
      role="region"
      aria-label={tableAriaLabel}
      sx={{ borderRadius: "8px", border: "1px solid #e7e9ee", boxShadow: "none", overflow: "hidden" }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2, py: 1.4, borderBottom: "1px solid #eceef2" }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
          All Job Postings
        </Typography>
        <TextField
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company or job title"
          slotProps={{
            htmlInput: {
              "aria-label": "Search job postings by company or job title.",
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: "#4b5563" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: 240,
            "& .MuiOutlinedInput-root": { height: 34, backgroundColor: "#f9fafb" },
          }}
        />
      </Stack>

      {errorMessage && (
        <Box sx={{ px: 2, pt: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage("")}>{errorMessage}</Alert>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={22} />
        </Box>
      ) : (
        <AdminDataTable
          columns={columns}
          rows={filteredRows}
          getRowKey={(row) => row.id}
          getCells={(row) => [
            { key: "companyName", content: row.companyName, sx: { fontWeight: 600, color: "#111827" } },
            { key: "jobTitle",    content: row.jobTitle },
            { key: "datePosted",  content: formatDate(row.datePosted) },
            {
              key: "tier",
              content: (
                <Typography sx={{ fontSize: 12, color: "#1f2937", textTransform: "capitalize" }}>
                  {row.tier ?? "—"}
                </Typography>
              ),
            },
            {
              key: "status",
              content: (
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: row.isActive ? "#1f6a4f" : "#6b7280",
                  }}
                >
                  {row.isActive ? "Active" : "Inactive"}
                </Typography>
              ),
            },
          ]}
        />
      )}
    </Card>
  );
}
