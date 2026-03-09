"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type MembershipTier = "silver" | "gold" | "platinum";
type RegistrationStatus = "pending" | "approved" | "rejected";

type RegistrationRow = {
  id: string;
  companyName: string;
  domain: string;
  registrantEmail: string;
  registrationDate: string;
  tier: MembershipTier;
  status: RegistrationStatus;
};

const initialRows: RegistrationRow[] = [
  {
    id: "reg-001",
    companyName: "Google DeepMind",
    domain: "deepmind.google",
    registrantEmail: "talent@deepmind.google",
    registrationDate: "07 Mar 2026",
    tier: "gold",
    status: "pending",
  },
  {
    id: "reg-002",
    companyName: "Microsoft Research",
    domain: "microsoft.com",
    registrantEmail: "recruiting@microsoft.com",
    registrationDate: "08 Mar 2026",
    tier: "platinum",
    status: "pending",
  },
  {
    id: "reg-003",
    companyName: "Spotify",
    domain: "spotify.com",
    registrantEmail: "university@spotify.com",
    registrationDate: "08 Mar 2026",
    tier: "silver",
    status: "pending",
  },
  {
    id: "reg-004",
    companyName: "BBC News",
    domain: "bbc.co.uk",
    registrantEmail: "earlycareers@bbc.co.uk",
    registrationDate: "09 Mar 2026",
    tier: "gold",
    status: "pending",
  },
];

function getStatusStyles(status: RegistrationStatus) {
  if (status === "approved") {
    return {
      backgroundColor: "#e8f5e9",
      color: "#2e7d32",
    };
  }

  if (status === "rejected") {
    return {
      backgroundColor: "#fdecea",
      color: "#c62828",
    };
  }

  return {
    backgroundColor: "#fff4e5",
    color: "#b26a00",
  };
}

export default function PendingCompanyRegistrationsTable() {
  const [rows, setRows] = useState<RegistrationRow[]>(initialRows);
  const [bannerMessage, setBannerMessage] = useState<string>("");

  const pendingCount = useMemo(
    () => rows.filter((row) => row.status === "pending").length,
    [rows]
  );

  function updateTier(id: string, tier: MembershipTier) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, tier } : row))
    );
  }

  async function handleApprove(row: RegistrationRow) {
    // TODO: replace this with the real transaction-backed route call.
    // Best target: existing update-user/route.ts so approval can:
    // 1) create or link Organisation
    // 2) assign MEMBER role
    // 3) persist selected membership tier
    //
    // Example future payload:
    // await fetch("/api/account/update-user", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     userId: row.id,
    //     companyName: row.companyName,
    //     domain: row.domain,
    //     email: row.registrantEmail,
    //     membershipTier: row.tier,
    //     roleKey: "MEMBER",
    //     decision: "approve",
    //   }),
    // });

    setRows((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, status: "approved" } : item
      )
    );

    setBannerMessage(
      `${row.companyName} approved as ${row.tier.toUpperCase()}. Recruiter will gain access on next login.`
    );
  }

  async function handleReject(row: RegistrationRow) {
    // TODO: replace this with real backend call.
    // Bronze is intentionally not offered; rejection is the no-access path.
    setRows((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, status: "rejected" } : item
      )
    );

    setBannerMessage(
      `${row.companyName} rejected. Recruiter will remain blocked from talent features.`
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
          Pending Company Registrations
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
          Review each recruiter registration, choose a membership tier, then approve or reject.
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
          {pendingCount} pending registration{pendingCount === 1 ? "" : "s"}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Chip
            label="Silver"
            size="small"
            sx={{ backgroundColor: "#f3f4f6", color: "#374151" }}
          />
          <Chip
            label="Gold"
            size="small"
            sx={{ backgroundColor: "#fff8e1", color: "#b26a00" }}
          />
          <Chip
            label="Platinum"
            size="small"
            sx={{ backgroundColor: "#eef4ff", color: "#0b63d7" }}
          />
        </Stack>
      </Box>

      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 980 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#111111" }}>
              {[
                "COMPANY NAME",
                "DOMAIN",
                "REGISTRANT EMAIL",
                "REGISTRATION DATE",
                "TIER",
                "STATUS",
                "ACTION",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    borderBottom: "none",
                    py: 1.5,
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              const isPending = row.status === "pending";

              return (
                <TableRow key={row.id}>
                  <TableCell sx={{ py: 1.8, fontSize: 12, fontWeight: 600 }}>
                    {row.companyName}
                  </TableCell>

                  <TableCell sx={{ py: 1.8, fontSize: 12 }}>
                    {row.domain}
                  </TableCell>

                  <TableCell sx={{ py: 1.8, fontSize: 12 }}>
                    {row.registrantEmail}
                  </TableCell>

                  <TableCell sx={{ py: 1.8, fontSize: 12 }}>
                    {row.registrationDate}
                  </TableCell>

                  <TableCell sx={{ py: 1.8 }}>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                      <Select
                        value={row.tier}
                        onChange={(e) =>
                          updateTier(row.id, e.target.value as MembershipTier)
                        }
                        disabled={!isPending}
                        sx={{
                          height: 34,
                          fontSize: 12,
                          backgroundColor: "#fff",
                        }}
                      >
                        <MenuItem value="silver">Silver</MenuItem>
                        <MenuItem value="gold">Gold</MenuItem>
                        <MenuItem value="platinum">Platinum</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>

                  <TableCell sx={{ py: 1.8 }}>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        ...getStatusStyles(row.status),
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ py: 1.8 }}>
                    {isPending ? (
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          onClick={() => handleApprove(row)}
                          sx={{
                            minWidth: 80,
                            height: 28,
                            borderRadius: "999px",
                            textTransform: "none",
                            fontSize: 11,
                            color: "#fff",
                            backgroundColor: "#46c338",
                            "&:hover": { backgroundColor: "#38aa2d" },
                          }}
                        >
                          Approve
                        </Button>

                        <Button
                          size="small"
                          onClick={() => handleReject(row)}
                          sx={{
                            minWidth: 72,
                            height: 28,
                            borderRadius: "999px",
                            textTransform: "none",
                            fontSize: 11,
                            color: "#fff",
                            backgroundColor: "#ff2b2b",
                            "&:hover": { backgroundColor: "#e62121" },
                          }}
                        >
                          Reject
                        </Button>
                      </Stack>
                    ) : (
                      <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                        {row.status === "approved"
                          ? "Access updates on next login"
                          : "Access blocked"}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}