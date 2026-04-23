"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
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
type PartnerProjectStatus = "pending" | "approved" | "rejected";

type PartnerProjectRow = {
  id: string;
  companyName: string;
  projectName: string;
  dateApplied: string;
  tier: MembershipTier;
  status: PartnerProjectStatus;
};

type Props = {
  onRowsChanged?: () => void;
};

const columns: AdminTableColumn[] = [
  { key: "companyName", label: "COMPANY NAME", width: "25%" },
  { key: "projectName", label: "PROJECT NAME", width: "22%" },
  { key: "dateApplied", label: "DATE APPLIED", width: "15%" },
  { key: "tier", label: "TIER", width: "11%" },
  { key: "status", label: "STATUS", width: "13%" },
  { key: "action", label: "ACTION", width: "14%" },
];

function statusTextColor(status: PartnerProjectStatus) {
  if (status === "approved") return "#1f6a4f";
  if (status === "rejected") return "#a23b45";
  return "#8a6b2f";
}

function actionTextButtonSx(color: string) {
  return {
    minWidth: 0,
    height: "auto",
    px: 0,
    py: 0.15,
    textTransform: "none",
    fontSize: 12,
    fontWeight: 600,
    color,
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "transparent",
      textDecoration: "underline",
    },
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PartnersTable({ onRowsChanged }: Props) {
  const [rows, setRows] = useState<PartnerProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerMessage, setBannerMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  const loadRows = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/admin/partner-projects");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrorMessage(body?.error ?? "Failed to load partner projects.");
        return;
      }
      const data: PartnerProjectRow[] = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setErrorMessage("Something went wrong loading partner projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter(
      (row) =>
        row.companyName.toLowerCase().includes(keyword) ||
        row.projectName.toLowerCase().includes(keyword),
    );
  }, [rows, search]);

  async function submitDecision(
    row: PartnerProjectRow,
    decision: "APPROVED" | "REJECTED",
  ) {
    setErrorMessage("");
    try {
      const res = await fetch(
        `/api/admin/partner-projects/${row.id}/decision`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrorMessage(body?.error ?? "Failed to update project.");
        return;
      }
      const nextStatus: PartnerProjectStatus =
        decision === "APPROVED" ? "approved" : "rejected";
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: nextStatus } : item,
        ),
      );
      setBannerMessage(
        decision === "APPROVED"
          ? `${row.companyName} project "${row.projectName}" approved for partner listing.`
          : `${row.companyName} project "${row.projectName}" rejected and hidden from partner feed.`,
      );
      onRowsChanged?.();
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  const pendingCount = filteredRows.filter((r) => r.status === "pending").length;
  const totalCount = filteredRows.length;
  const tableAriaLabel = loading
    ? "Partner project approvals table. Loading projects."
    : totalCount === 0
      ? "Partner project approvals table. No partner projects to review yet."
      : `Partner project approvals table. ${totalCount} project${totalCount === 1 ? "" : "s"} listed, ${pendingCount} pending your decision.`;

  return (
    <Card
      role="region"
      aria-label={tableAriaLabel}
      sx={{
        borderRadius: "8px",
        border: "1px solid #e7e9ee",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2, py: 1.4, borderBottom: "1px solid #eceef2" }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
          Job Postings Approvals
        </Typography>
        <TextField
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search partner projects"
          slotProps={{
            htmlInput: {
              "aria-label": `Search partner projects by company or project name. ${rows.length} project${rows.length === 1 ? "" : "s"} total, ${rows.filter((r) => r.status === "pending").length} pending approval.`,
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
            width: 220,
            "& .MuiOutlinedInput-root": {
              height: 34,
              backgroundColor: "#f9fafb",
            },
          }}
        />
      </Stack>

      {bannerMessage ? (
        <Box sx={{ px: 2, pt: 2 }}>
          <Alert severity="success" onClose={() => setBannerMessage("")}>
            {bannerMessage}
          </Alert>
        </Box>
      ) : null}

      {errorMessage ? (
        <Box sx={{ px: 2, pt: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage("")}>
            {errorMessage}
          </Alert>
        </Box>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={22} />
        </Box>
      ) : (
        <AdminDataTable
          columns={columns}
          rows={filteredRows}
          getRowKey={(row) => row.id}
          getCells={(row) => {
            const isPending = row.status === "pending";
            const tierLabel = row.tier ? row.tier : "-";

            return [
              {
                key: "companyName",
                content: row.companyName,
                sx: { fontWeight: 600, color: "#111827" },
              },
              { key: "projectName", content: row.projectName },
              { key: "dateApplied", content: formatDate(row.dateApplied) },
              {
                key: "tier",
                content: (
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#1f2937",
                      textTransform: "capitalize",
                    }}
                  >
                    {tierLabel}
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
                      textTransform: "capitalize",
                      color: statusTextColor(row.status),
                    }}
                  >
                    {row.status}
                  </Typography>
                ),
              },
              {
                key: "action",
                content: isPending ? (
                  <Stack direction="column" spacing={0.1} alignItems="flex-start">
                    <Button
                      size="small"
                      onClick={() => submitDecision(row, "APPROVED")}
                      aria-label={`Approve ${row.companyName} project ${row.projectName}`}
                      sx={actionTextButtonSx("#1f6a4f")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      onClick={() => submitDecision(row, "REJECTED")}
                      aria-label={`Reject ${row.companyName} project ${row.projectName}`}
                      sx={actionTextButtonSx("#a23b45")}
                    >
                      Reject
                    </Button>
                  </Stack>
                ) : (
                  <Typography sx={{ fontSize: 11, color: "#4b5563" }}>
                    {row.status === "approved"
                      ? "Published to job portal"
                      : "Hidden from job portal"}
                  </Typography>
                ),
              },
            ];
          }}
        />
      )}
    </Card>
  );
}
