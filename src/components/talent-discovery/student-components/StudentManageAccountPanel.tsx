"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Snackbar,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

type Props = {
  userId: string;
  userName: string;
  userEmail: string;
};

export default function StudentManageAccountPanel({ userId, userName, userEmail }: Props) {
  const router = useRouter();

  const [resetting, setResetting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleResetPassword() {
    setResetting(true);
    setResetError(null);
    setTempPassword(null);
    try {
      const res = await fetch("/api/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Reset failed.");
      setTempPassword(data.tempPassword);
    } catch (e: any) {
      setResetError(e.message ?? "Something went wrong.");
    } finally {
      setResetting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Delete failed.");
      router.push("/membership-dashboard/student-users");
    } catch (e: any) {
      setDeleteError(e.message ?? "Something went wrong.");
      setDeleting(false);
    }
    setDeleteOpen(false);
  }

  function handleCopy() {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
    }
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Manage Account
      </Typography>

      {/* Reset Password */}
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, mb: 3 }}
      >
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Generate a temporary password for {userName}. Share it with the user so they can sign
            in and change it immediately.
          </Typography>

          {resetError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {resetError}
            </Alert>
          )}

          {tempPassword && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Temporary password generated. Share it with the user and ask them to change it
              immediately.
              <Box sx={{ mt: 1.5 }}>
                <OutlinedInput
                  value={tempPassword}
                  readOnly
                  size="small"
                  fullWidth
                  sx={{ fontFamily: "monospace" }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton onClick={handleCopy} edge="end" size="small">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </Box>
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleResetPassword}
            disabled={resetting}
            sx={{ textTransform: "none" }}
          >
            {resetting ? <CircularProgress size={20} color="inherit" /> : "Reset Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "error.main", borderRadius: 2 }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <WarningAmberIcon color="error" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600} color="error.main">
              Danger Zone
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Permanently delete this student account. This action cannot be undone and will remove
            all associated data.
          </Typography>

          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}

          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteOpen(true)}
            sx={{ textTransform: "none" }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete <strong>{userName}</strong> ({userEmail})?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteOpen(false)}
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Password copied to clipboard"
      />
    </Box>
  );
}
