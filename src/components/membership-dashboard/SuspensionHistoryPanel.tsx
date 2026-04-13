"use client";

import { useState, useEffect } from "react";
import { Box, Card, Chip, Divider, Typography, CircularProgress, Stack } from "@mui/material";
import { type ManagedUser } from "./UserManagementTable";

type Props = {
  user: ManagedUser | null;
};

// Defines the data structure matching the AppSuspension database table
interface RealSuspensionRecord {
  id: string;
  appKey: string;
  reason: string;
  suspendedAt: string;
  action?: "suspend" | "lift" | "ban"; 
}

/**
 * Maps record action types to specific visual styles.
 */
function getRecordStyle(action: string = "suspend") {
  const styles: Record<string, { backgroundColor: string; color: string; label: string }> = {
    suspend: { backgroundColor: "#fff4e5", color: "#b26a00", label: "Suspended" },
    lift: { backgroundColor: "#e8f5e9", color: "#2e7d32", label: "Lifted" },
    ban: { backgroundColor: "#fdecea", color: "#c62828", label: "Banned" },
  };
  return styles[action] || styles.suspend; 
}

/**
 * Determines badge colors for the user's current platform status.
 */
function currentStatusColor(status: ManagedUser["status"]) {
  if (status === "active") return { backgroundColor: "#e8f5e9", color: "#2e7d32" };
  if (status === "suspended") return { backgroundColor: "#fff4e5", color: "#b26a00" };
  return { backgroundColor: "#fdecea", color: "#c62828" };
}

export default function SuspensionHistoryPanel({ user }: Props) {
  const [history, setHistory] = useState<RealSuspensionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setHistory([]);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/suspension-history?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("[UI_ERROR] Failed to fetch suspension history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id]);

  if (!user) {
    return (
      <Card sx={{ borderRadius: "8px", border: "1px solid #e7e9ee", boxShadow: "none", p: 2 }}>
        <Typography sx={{ fontWeight: 600, color: "#111827" }}>Suspension history</Typography>
        <Typography sx={{ mt: 1, fontSize: 14, color: "#4b5563" }}>
          Select a user from the table to view suspension history and audit records.
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: "8px", border: "1px solid #e7e9ee", boxShadow: "none", overflow: "hidden" }}>
      <Box sx={{ px: 2, py: 1.6, borderBottom: "1px solid #eceef2" }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "#111827" }}>
          Suspension history
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#4b5563", mt: 0.5 }}>
          Audit trail is retained even when access is restored.
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: "10px", border: "1px solid #e5e7eb", backgroundColor: "#f9fafb", mb: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>{user.name}</Typography>
          <Typography sx={{ fontSize: 14, color: "#4b5563", mt: 0.5 }}>
            {user.userType} · {user.email}
          </Typography>

          <Box sx={{ mt: 1.25, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={user.status}
              size="small"
              sx={{ ...currentStatusColor(user.status), textTransform: "capitalize", fontWeight: 600 }}
            />
            <Chip
              label={user.appScope}
              size="small"
              sx={{ backgroundColor: "#eef4ff", color: "#0b63d7", fontWeight: 600 }}
            />
          </Box>
        </Box>

        {loading ? (
          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="center" 
            alignItems="center" 
            sx={{ p: 4 }}
            role="status"
            aria-live="polite"
            aria-label="Loading suspension records"
          >
            <CircularProgress size={24} aria-hidden="true" />
            <Typography sx={{ color: "#4b5563", fontSize: 14 }}>Loading records...</Typography>
          </Stack>
        ) : history.length === 0 ? (
          <Box sx={{ p: 2, borderRadius: "10px", border: "1px dashed #d1d5db", backgroundColor: "#fff" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>No history yet</Typography>
            <Typography sx={{ fontSize: 14, color: "#4b5563", mt: 0.5 }}>
              This user has a clean record. No records found in the database.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gap: 1.25 }}>
            {history.map((record, index) => {
              const styles = getRecordStyle(record.action); 

              return (
                <Box key={record.id} sx={{ p: 1.5, borderRadius: "10px", border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <Box>
                      <Chip
                        label={styles.label}
                        size="small"
                        sx={{ backgroundColor: styles.backgroundColor, color: styles.color, fontWeight: 600, mb: 1 }}
                      />
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                        {record.appKey}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#4b5563", mt: 0.4 }}>
                        Logged at {new Date(record.suspendedAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontSize: 13, color: "#4b5563" }}>
                      Record {history.length - index}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.25 }} />

                  <Box sx={{ display: "grid", gap: 0.75 }}>
                    <Typography sx={{ fontSize: 14, color: "#374151" }}>
                      <strong>Reason:</strong> {record.reason || "Violation of platform terms"}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#374151" }}>
                      <strong>Timestamp:</strong> {new Date(record.suspendedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Card>
  );
}