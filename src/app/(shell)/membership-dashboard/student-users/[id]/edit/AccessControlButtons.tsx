"use client";

import { useState } from "react";
import { Button, Stack, CircularProgress } from "@mui/material";
import { suspendOrBanUser, liftSuspension } from "./actions";

export default function AccessControlButtons({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: "ACTIVE" | "SUSPENDED" | "BANNED";
}) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "SUSPEND" | "BAN" | "LIFT") => {
    setLoading(true);
    try {
      if (action === "LIFT") {
        await liftSuspension(userId);
      } else {
        await suspendOrBanUser(userId, action);
      }
    } catch (error) {
      console.error(error);
      alert("Action failed! Check console.");
    }
    setLoading(false);
  };

  // indicate differ status depend on differ button
  if (currentStatus === "BANNED") {
    return (
      <Button variant="contained" color="error" disabled sx={{ justifyContent: "flex-start", px: 3 }}>
        User is Permanently Banned (Cannot be lifted)
      </Button>
    );
  }

  if (currentStatus === "SUSPENDED") {
    return (
      <Button
        variant="contained"
        color="success"
        size="large"
        onClick={() => handleAction("LIFT")}
        disabled={loading}
        sx={{ justifyContent: "flex-start", px: 3 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Lift Suspension (Restore Access)"}
      </Button>
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 400 }}>
      <Button
        variant="outlined"
        color="warning"
        size="large"
        onClick={() => handleAction("SUSPEND")}
        disabled={loading}
        sx={{ justifyContent: "flex-start", px: 3 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Suspend Access"}
      </Button>
      <Button
        variant="contained"
        color="error"
        size="large"
        onClick={() => handleAction("BAN")}
        disabled={loading}
        sx={{ justifyContent: "flex-start", px: 3 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Permanently Ban Partner"}
      </Button>
    </Stack>
  );
}