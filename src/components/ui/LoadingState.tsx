// src/components/ui/LoadingState.tsx
// Shared loading state component — Issue #22.
// Use this instead of inline CircularProgress or custom spinners.

import { Box, CircularProgress, Typography } from "@mui/material";

type Props = {
  /** Optional message shown below the spinner. Defaults to "Loading…" */
  message?: string;
  /** Size of the spinner in px. Defaults to 40. */
  size?: number;
};

export default function LoadingState({ message = "Loading…", size = 40 }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography sx={{ fontSize: 14, color: "#4b5563" }}>{message}</Typography>
      )}
    </Box>
  );
}
