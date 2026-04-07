"use client";
import { useState } from "react";
import { exportAllData } from "@/app/talent-discovery-standalone/student-security-settings/action";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";

//TODO: implement the student profile delete functionality

interface ToastState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        {children}
      </CardContent>
    </Card>
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  danger?: boolean;
}

function SectionHeader({ icon, title, subtitle, danger }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="flex-start" spacing={1.5} mb={2.5}>
      <Box
        sx={{
          color: danger ? theme.palette.error.main : theme.palette.primary.main,
          mt: 0.2,
          display: "flex",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          color={danger ? "error.main" : "text.primary"}
        >
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}

interface AccountManagementProps {
  userId: string;
  email: string;
}

export default function AccountManagement({
  userId,
  email,
}: AccountManagementProps) {
  const theme = useTheme();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (
    message: string,
    severity: ToastState["severity"] = "success",
  ) => {
    setToast({ open: true, message, severity });
  };

  const handleExportAll = async () => {
    setExporting(true);
    showToast("Building your export, please wait…", "info");
    try {
      const result = await exportAllData(userId);
      if (!result.ok) {
        showToast(result.error, "error");
        return;
      }
      // Decode base64 → Blob → anchor click download
      const byteChars = atob(result.base64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteArr[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([byteArr], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Export downloaded successfully", "success");
    } catch {
      showToast("Export failed — please try again", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(false);
    showToast("Account deletion requested", "warning");
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Account Management
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage your account email, data exports, and account settings.
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* ── Account Email ───────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={<EmailOutlinedIcon fontSize="small" />}
          title="Account Email"
          subtitle="The email address associated with your account"
        />

        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          display="block"
          mb={0.75}
        >
          Email Address
        </Typography>
        <Box
          sx={{
            px: 1.5,
            py: 1.2,
            bgcolor: theme.palette.grey[100],
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1.5,
            maxWidth: 360,
            mb: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {email}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Your email is managed by UCL Single Sign-On and cannot be changed
          here.
        </Typography>
      </SectionCard>

      {/* ── Export Your Data ────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={<FileDownloadOutlinedIcon fontSize="small" />}
          title="Export Your Data"
          subtitle="Download a copy of all your data for GDPR compliance"
        />

        <Typography variant="body2" color="text.secondary" mb={2.5}>
          You can request a complete export of all your personal data stored on
          our platform.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FolderZipOutlinedIcon fontSize="small" />}
            onClick={handleExportAll}
            disabled={exporting}
            sx={{ borderRadius: 1.5, fontWeight: 600 }}
          >
            {exporting ? "Exporting…" : "Export All Data"}
          </Button>
        </Stack>
      </SectionCard>

      {/* ── Delete Account ──────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={<DeleteOutlineOutlinedIcon fontSize="small" />}
          title="Delete Account"
          subtitle="Permanently delete your account and all associated data"
          danger
        />

        <Box
          sx={{
            bgcolor: alpha(theme.palette.error.main, 0.06),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            borderRadius: 2,
            p: 2,
            mb: 2.5,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start" mb={1}>
            <WarningAmberRoundedIcon
              fontSize="small"
              sx={{ color: theme.palette.error.main, mt: 0.1, flexShrink: 0 }}
            />
            <Typography variant="caption" fontWeight={700} color="error.main">
              Warning: This action is irreversible
            </Typography>
          </Stack>
          <Stack spacing={0.5} pl={3}>
            {[
              "Your profile and all CVs will be permanently deleted",
              "All consent history and access logs will be removed",
              "Your account cannot be recovered after deletion",
            ].map((item) => (
              <Typography key={item} variant="caption" color="text.secondary">
                • {item}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<DeleteOutlineOutlinedIcon fontSize="small" />}
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ borderRadius: 1.5, fontWeight: 600 }}
        >
          Delete My Account
        </Button>
      </SectionCard>

      {/* ── Confirm delete dialog ───────────────────────────────────────── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete your account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete your account, all CVs, consent records,
            and access logs. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            size="small"
            sx={{ borderRadius: 1.5, fontWeight: 600 }}
          >
            Yes, delete my account
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ──────────────────────────────────────────────────────── */}
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
