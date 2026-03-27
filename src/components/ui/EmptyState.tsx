// src/components/ui/EmptyState.tsx
// Shared empty state component — Issue #22.
// Use this instead of inline empty messages or custom no-data UI.

import { Box, Button, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  /** Main message to display. Defaults to "No data found." */
  message?: string;
  /** Optional sub-message for extra context. */
  description?: string;
  /** Optional icon displayed above the message. */
  icon?: ReactNode;
  /** Optional label for a retry/action button. */
  actionLabel?: string;
  /** Called when the action button is clicked. */
  onAction?: () => void;
};

export default function EmptyState({
  message = "No data found.",
  description,
  icon,
  actionLabel,
  onAction,
}: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        gap: 1.5,
        color: "#6b7280",
      }}
    >
      {icon && (
        <Box sx={{ fontSize: 40, lineHeight: 1, mb: 0.5 }}>{icon}</Box>
      )}

      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>
        {message}
      </Typography>

      {description && (
        <Typography sx={{ fontSize: 13, color: "#9ca3af", textAlign: "center", maxWidth: 340 }}>
          {description}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button variant="outlined" size="small" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
