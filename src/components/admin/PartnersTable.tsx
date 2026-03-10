"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import AdminDataTable, { AdminTableColumn } from "./AdminDataTable";

type MembershipTier = "silver" | "gold" | "platinum";
type PartnerProjectStatus = "pending" | "approved" | "rejected";

type PartnerProjectRow = {
  id: string;
  companyName: string;
  projectName: string;
  dateApplied: string;
  tier: MembershipTier;
  status: PartnerProjectStatus;
};

const initialRows: PartnerProjectRow[] = [
  {
    id: "partner-001",
    companyName: "Google DeepMind",
    projectName: "Applied AI Fellowships",
    dateApplied: "07 Mar 2026",
    tier: "platinum",
    status: "pending",
  },
  {
    id: "partner-002",
    companyName: "Microsoft Research",
    projectName: "Research Analyst Track",
    dateApplied: "08 Mar 2026",
    tier: "gold",
    status: "pending",
  },
  {
    id: "partner-003",
    companyName: "Spotify",
    projectName: "Product Design Rotation",
    dateApplied: "08 Mar 2026",
    tier: "gold",
    status: "pending",
  },
  {
    id: "partner-004",
    companyName: "Tencent",
    projectName: "Data Science Internship",
    dateApplied: "09 Mar 2026",
    tier: "silver",
    status: "rejected",
  },
  {
    id: "partner-005",
    companyName: "BBC News",
    projectName: "Frontend Engineering Project",
    dateApplied: "09 Mar 2026",
    tier: "gold",
    status: "approved",
  },
];

const columns: AdminTableColumn[] = [
  { key: "companyName", label: "COMPANY NAME", width: "25%" },
  { key: "projectName", label: "PROJECT NAME", width: "22%" },
  { key: "dateApplied", label: "DATE APPLIED", width: "15%" },
  { key: "tier", label: "TIER", width: "11%" },
  { key: "status", label: "STATUS", width: "13%" },
  { key: "action", label: "ACTION", width: "14%" },
];

function statusTextColor(status: PartnerProjectStatus) {
  if (status === "approved") {
    return "#1f6a4f";
  }

  if (status === "rejected") {
    return "#a23b45";
  }

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

export default function PartnersTable() {
  const [rows, setRows] = useState<PartnerProjectRow[]>(initialRows);
  const [bannerMessage, setBannerMessage] = useState("");

  const pendingCount = useMemo(
    () => rows.filter((row) => row.status === "pending").length,
    [rows]
  );

  async function handleApprove(row: PartnerProjectRow) {
    // TODO: replace with partner endpoint call.
    // Example:
    // await fetch(`/api/admin/partners/projects/${row.id}/approve`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ tier: row.tier }),
    // });

    setRows((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, status: "approved" } : item
      )
    );

    setBannerMessage(
      `${row.companyName} project "${row.projectName}" approved for partner listing.`
    );
  }

  async function handleReject(row: PartnerProjectRow) {
    // TODO: replace with partner endpoint call.
    // Example:
    // await fetch(`/api/admin/partners/projects/${row.id}/reject`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    // });

    setRows((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, status: "rejected" } : item
      )
    );

    setBannerMessage(
      `${row.companyName} project "${row.projectName}" rejected and hidden from partner feed.`
    );
  }

  return (
    <Card
      sx={{
        borderRadius: "8px",
        border: "1px solid #e7e9ee",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2, py: 1.6, borderBottom: "1px solid #eceef2" }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
          Partner Project Approvals
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
          Review each partner project submission and approve or reject.
        </Typography>
      </Box>

      {bannerMessage ? (
        <Box sx={{ px: 2, pt: 2 }}>
          <Alert severity="success">{bannerMessage}</Alert>
        </Box>
      ) : null}

      <Box
        sx={{
          px: 2,
          py: 1.4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eceef2",
        }}
      >
        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
          {pendingCount} pending partner project{pendingCount === 1 ? "" : "s"}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Chip
            label="Silver"
            size="small"
            sx={{ backgroundColor: "#f1f3f5", color: "#4b5563" }}
          />
          <Chip
            label="Gold"
            size="small"
            sx={{ backgroundColor: "#f4efe4", color: "#8a7240" }}
          />
          <Chip
            label="Platinum"
            size="small"
            sx={{ backgroundColor: "#eaf0f6", color: "#4b6078" }}
          />
        </Stack>
      </Box>

      <AdminDataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        getCells={(row) => {
          const isPending = row.status === "pending";

          return [
            {
              key: "companyName",
              content: row.companyName,
              sx: {
                fontWeight: 600,
                color: "#111827",
              },
            },
            { key: "projectName", content: row.projectName },
            { key: "dateApplied", content: row.dateApplied },
            {
              key: "tier",
              content: (
                <Typography sx={{ fontSize: 12, color: "#1f2937", textTransform: "capitalize" }}>
                  {row.tier}
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
                    onClick={() => handleApprove(row)}
                    sx={actionTextButtonSx("#1f6a4f")}
                  >
                    Approve
                  </Button>

                  <Button
                    size="small"
                    onClick={() => handleReject(row)}
                    sx={actionTextButtonSx("#a23b45")}
                  >
                    Reject
                  </Button>
                </Stack>
              ) : (
                <Typography sx={{ fontSize: 11, color: "#6b7280" }}>
                  {row.status === "approved"
                    ? "Published to partner listings"
                    : "Hidden from partner listings"}
                </Typography>
              ),
            },
          ];
        }}
      />
    </Card>
  );
}
