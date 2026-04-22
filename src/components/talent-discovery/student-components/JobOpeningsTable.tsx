"use client";
// src/components/talent-discovery/student-components/JobOpeningsTable.tsx
// Job listings table for students — Issue #28.
// Fetches active, non-expired postings from /api/jobs on mount.
// Cursor-paginated with "Load more". Application tracking deferred to L5.

import { useMemo, useState, useEffect } from "react";
import {
  Avatar,
  Box,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import type { JobPostingResult, PaginatedJobPostings } from "@/types/index";

// ─── Row shape ────────────────────────────────────────────────────────────────

type JobRow = {
  id: string;
  title: string;
  companyName: string;
  roleType: string;
  location: string;
  salaryBand: string;
  postedAt: string; // ISO
};

function formatPostedDate(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toRow(job: JobPostingResult): JobRow {
  return {
    id: job.id,
    title: job.title,
    companyName: job.organisation.name,
    roleType: job.roleType,
    location: job.location,
    salaryBand: job.salaryBand ?? "—",
    postedAt: job.postedAt,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function JobOpeningsTable() {
  const [rows, setRows] = useState<JobRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (!data.success) {
          setError(data.error?.message ?? "Failed to load jobs.");
          return;
        }
        const result: PaginatedJobPostings = data.data;
        setRows(result.jobs.map(toRow));
        setNextCursor(result.nextCursor);
      } catch {
        setError("Something went wrong loading jobs.");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  async function handleLoadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/jobs?cursor=${encodeURIComponent(nextCursor)}`);
      const data = await res.json();
      if (!data.success) return;
      const result: PaginatedJobPostings = data.data;
      setRows((prev) => [...prev, ...result.jobs.map(toRow)]);
      setNextCursor(result.nextCursor);
    } catch {
      // silent — user can retry by scrolling and clicking Load more again
    } finally {
      setLoadingMore(false);
    }
  }

  const filteredRows = useMemo(() => {
    let data = [...rows];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.companyName.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.roleType.toLowerCase().includes(q),
      );
    }
    if (sortBy === "company") data.sort((a, b) => a.companyName.localeCompare(b.companyName));
    else if (sortBy === "title") data.sort((a, b) => a.title.localeCompare(b.title));
    return data;
  }, [rows, search, sortBy]);

  const columns: GridColDef<JobRow>[] = [
    {
      field: "title",
      headerName: "Role / Position",
      flex: 1.6,
      minWidth: 200,
    },
    {
      field: "companyName",
      headerName: "Company",
      flex: 1.6,
      minWidth: 180,
      sortable: true,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ height: "100%", width: "100%", overflow: "hidden" }}
        >
          <Avatar
            sx={{ width: 30, height: 30, fontSize: 14, bgcolor: "primary.light" }}
            aria-hidden="true"
          >
            {params.row.companyName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {params.row.companyName}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "roleType",
      headerName: "Role type",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "salaryBand",
      headerName: "Salary band",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "postedAt",
      headerName: "Posted",
      flex: 0.9,
      minWidth: 110,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {formatPostedDate(params.row.postedAt)}
        </Typography>
      ),
    },
  ];

  if (loading) {
    return <LoadingState message="Loading available positions…" />;
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography role="alert" sx={{ fontSize: 13, color: "error.main" }}>
          {error}
        </Typography>
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
        }}
      >
        <EmptyState
          message="No open positions at the moment."
          description="Check back later for new opportunities from our industry partners."
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          placeholder="Search by company, role, or type"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
          inputProps={{ "aria-label": "Search jobs" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" aria-hidden="true" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Sort by"
          InputLabelProps={{
            shrink: true,
            sx: {
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clip: "rect(0 0 0 0)",
              clipPath: "inset(50%)",
              whiteSpace: "nowrap",
            },
          }}
          InputProps={{ notched: false }}
          size="small"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="default">Sort by</MenuItem>
          <MenuItem value="company">Company</MenuItem>
          <MenuItem value="title">Role title</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ height: 540, width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          aria-label="Job openings"
          disableRowSelectionOnClick
          rowHeight={72}
          pagination
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          sx={{
            border: 0,
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#fafafa",
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600 },
          }}
        />
      </Box>

      {nextCursor && (
        <Box sx={{ mt: 1.5, display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            className="button-link button-link--secondary"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load more positions"}
          </button>
        </Box>
      )}
    </Box>
  );
}
