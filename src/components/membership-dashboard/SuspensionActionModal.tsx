"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Modal from "@/components/ui/Modal";
import {
  type AppScope,
  type ManagedUser,
  type SuspensionActionType,
} from "./UserManagementTable";

type Props = {
  isOpen: boolean;
  action: SuspensionActionType | null;
  user: ManagedUser | null;
  onClose: () => void;
  onConfirm: (payload: {
    userId: string;
    action: SuspensionActionType;
    appScope: AppScope;
    reason: string;
  }) => void;
};

export default function SuspensionActionModal({
  isOpen,
  action,
  user,
  onClose,
  onConfirm,
}: Props) {
  // appScope is derived from user prop — no separate state needed
  const appScope: AppScope = user?.appScope ?? "Talent Platform";
  const [reason, setReason] = useState("");

  const title = useMemo(() => {
    if (action === "suspend") return "Suspend user access";
    if (action === "lift") return "Lift suspension";
    if (action === "ban") return "Ban user";
    return "Manage access";
  }, [action]);

  const description = useMemo(() => {
    if (action === "suspend") {
      return "Suspension should only apply to the selected app scope and must not affect other apps.";
    }
    if (action === "lift") {
      return "Lifting a suspension restores access for this app scope while preserving the audit history.";
    }
    if (action === "ban") {
      return "Ban is treated as a permanent suspension for the selected app scope.";
    }
    return undefined;
  }, [action]);

  if (!user || !action) return null;

  function handleSubmit() {
    if (!user || !action) return;

    onConfirm({
      userId: user.id,
      action,
      appScope,
      reason: reason.trim() || "No additional reason provided.",
    });
  }

  return (
    <Modal
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={onClose}
      initialFocusSelector='[data-autofocus="true"]'
    >
      <Box sx={{ display: "grid", gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
            {user.name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#4b5563", mt: 0.5 }}>
            {user.userType} · {user.email}
          </Typography>
        </Box>

        <TextField
          select
          label="App scope"
          value={appScope}
          onChange={() => undefined}
          fullWidth
          size="small"
          data-autofocus="true"
          helperText="This action should only affect the selected app."
        >
          <MenuItem value="Talent Platform">Talent Platform</MenuItem>
        </TextField>

        <TextField
          label={
            action === "lift"
              ? "Lift note"
              : action === "ban"
                ? "Ban reason"
                : "Suspension reason"
          }
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          multiline
          minRows={3}
          fullWidth
          placeholder={
            action === "lift"
              ? "Explain why access is being restored"
              : "Add a short reason for audit history"
          }
        />

        {action === "ban" ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              border: "1px solid #fecaca",
              backgroundColor: "#fef2f2",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "#991b1b", fontWeight: 600 }}>
              Permanent restriction
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#7f1d1d", mt: 0.5 }}>
              This user will remain blocked from the Talent Platform unless a later
              admin workflow explicitly reverses the action.
            </Typography>
          </Box>
        ) : null}

        <Stack direction="row" spacing={1.2} justifyContent="flex-end">
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={handleSubmit}
            sx={{
              textTransform: "none",
              backgroundColor:
                action === "ban" ? "#d32f2f" : action === "lift" ? "#18a957" : "#f0a500",
              "&:hover": {
                backgroundColor:
                  action === "ban" ? "#b71c1c" : action === "lift" ? "#148948" : "#d99100",
              },
            }}
          >
            {action === "suspend"
              ? "Confirm suspension"
              : action === "lift"
                ? "Confirm lift"
                : "Confirm ban"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
