"use client";
import { useState } from "react";
import { toggleCompanyConsent } from "@/app/talent-discovery-standalone/student-company-consent/action";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Company {
  id: number;
  organisationId: number | null;
  name: string;
  since: string;
  logoUrl: string;
  status: "approved" | "denied";
}

export interface MemberWithConsent {
  id: number;
  memberKey: string;
  organisationId: number | null;
  name: string;
  consented: boolean;
}

interface ConsentManagementProps {
  members: MemberWithConsent[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SummaryCardProps {
  count: number;
  label: string;
  type: "approved" | "denied";
}

function SummaryCard({ count, label, type }: SummaryCardProps) {
  const theme = useTheme();
  const isApproved = type === "approved";

  const color = isApproved
    ? theme.palette.success.main
    : theme.palette.error.main;
  const bgColor = isApproved
    ? alpha(theme.palette.success.main, 0.12)
    : alpha(theme.palette.error.main, 0.12);
  const Icon = isApproved ? CheckCircleOutlineIcon : BlockOutlinedIcon;

  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: bgColor,
              color,
              borderRadius: 2,
            }}
          >
            <Icon fontSize="small" />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
              color={color}
              lineHeight={1}
            >
              {count}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing={0.8}
              fontWeight={600}
            >
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface CompanyRowProps {
  company: Company;
  onToggle: (id: number) => void;
}

function CompanyRow({ company, onToggle }: CompanyRowProps) {
  const theme = useTheme();
  const isApproved = company.status === "approved";

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        border: `1px solid`,
        borderColor: isApproved
          ? theme.palette.divider
          : alpha(theme.palette.error.main, 0.3),
        bgcolor: isApproved
          ? "background.paper"
          : alpha(theme.palette.error.main, 0.04),
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: theme.shadows[2],
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Company logo */}
          <Avatar
            src={company.logoUrl}
            alt={company.name}
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              bgcolor: theme.palette.grey[100],
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              "& img": { objectFit: "contain", p: 0.5 },
            }}
          >
            {company.name[0]}
          </Avatar>

          {/* Company info */}
          <Box flex={1} minWidth={0}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {company.name}
            </Typography>
            <Typography
              variant="caption"
              color={isApproved ? "success.main" : "error.main"}
              fontWeight={600}
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              {isApproved ? "Has Access" : "Access Revoked"}
            </Typography>
          </Box>

          {/* Status chip */}
          <Chip
            label={isApproved ? "Approved" : "Denied"}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: "0.7rem",
              letterSpacing: 0.5,
              textTransform: "uppercase",
              bgcolor: isApproved
                ? alpha(theme.palette.success.main, 0.12)
                : alpha(theme.palette.error.main, 0.12),
              color: isApproved
                ? theme.palette.success.dark
                : theme.palette.error.dark,
              border: "none",
            }}
          />

          {/* Action button */}
          <Button
            size="small"
            variant="outlined"
            startIcon={
              isApproved ? (
                <LockOutlinedIcon fontSize="small" />
              ) : (
                <LockOpenOutlinedIcon fontSize="small" />
              )
            }
            onClick={() => onToggle(company.id)}
            sx={{
              borderRadius: 1.5,
              fontSize: "0.75rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              minWidth: 130,
              borderColor: isApproved
                ? theme.palette.error.light
                : theme.palette.success.light,
              color: isApproved
                ? theme.palette.error.main
                : theme.palette.success.main,
              "&:hover": {
                bgcolor: isApproved
                  ? alpha(theme.palette.error.main, 0.08)
                  : alpha(theme.palette.success.main, 0.08),
                borderColor: isApproved
                  ? theme.palette.error.main
                  : theme.palette.success.main,
              },
            }}
          >
            {isApproved ? "Revoke Access" : "Restore Access"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

export default function ConsentManagement({ members }: ConsentManagementProps) {
  const theme = useTheme();
  const [companies, setCompanies] = useState<Company[]>(
    members.map((m) => ({
      id: m.id,
      organisationId: m.organisationId,
      name: m.name,
      since: "",
      logoUrl: "",
      status: m.consented ? "approved" : "denied",
    })),
  );
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const approvedCount = companies.filter((c) => c.status === "approved").length;
  const deniedCount = companies.filter((c) => c.status === "denied").length;
  const totalPages = Math.ceil(companies.length / PAGE_SIZE);
  const visibleCompanies = companies.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );

  const toggleStatus = (id: number) => {
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = c.status === "approved" ? "denied" : "approved";
        const consented = next === "approved";
        if (c.organisationId !== null) {
          toggleCompanyConsent(c.organisationId, consented);
        }
        setToast({
          open: true,
          message:
            next === "denied"
              ? `Access revoked for ${c.name}`
              : `Access restored for ${c.name}`,
          severity: next === "denied" ? "warning" : "success",
        });
        return { ...c, status: next };
      }),
    );
  };

  const revokeAll = () => {
    setCompanies((prev) => prev.map((c) => ({ ...c, status: "denied" })));
    setToast({
      open: true,
      message: "All company access has been revoked",
      severity: "warning",
    });
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Page header */}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Company Access Consent
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Control which companies can view your CV and profile information.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<BlockOutlinedIcon />}
          onClick={revokeAll}
          disabled={approvedCount === 0}
          sx={{ borderRadius: 1.5, fontWeight: 600, alignSelf: "center" }}
        >
          Revoke All Access
        </Button>
      </Stack>

      {/* Summary cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, maxWidth: 480 }}>
        <Box sx={{ flex: 1 }}>
          <SummaryCard count={approvedCount} label="Approved" type="approved" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <SummaryCard count={deniedCount} label="Denied" type="denied" />
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Section title */}
      <Typography
        variant="overline"
        color="text.secondary"
        fontWeight={600}
        letterSpacing={1}
        display="block"
        mb={1.5}
      >
        Companies with access
      </Typography>

      {/* Company list */}
      <Stack spacing={1.5}>
        {visibleCompanies.map((company) => (
          <CompanyRow
            key={company.id}
            company={company}
            onToggle={toggleStatus}
          />
        ))}
      </Stack>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          spacing={1}
          mt={2.5}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            sx={{ borderRadius: 1.5, fontWeight: 600 }}
          >
            Previous
          </Button>
          <Typography variant="body2" color="text.secondary">
            Page {page + 1} of {totalPages}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages - 1}
            sx={{ borderRadius: 1.5, fontWeight: 600 }}
          >
            Next
          </Button>
        </Stack>
      )}

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
