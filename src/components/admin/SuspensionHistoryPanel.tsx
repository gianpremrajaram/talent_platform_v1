"use client";

import { Box, Card, Chip, Divider, Typography } from "@mui/material";
import {
  type ManagedUser,
  type SuspensionRecord,
} from "./UserManagementTable";

type Props = {
  user: ManagedUser | null;
};

function actionColor(action: SuspensionRecord["action"]) {
  if (action === "suspend") {
    return {
      backgroundColor: "#fff4e5",
      color: "#b26a00",
      label: "Suspended",
    };
  }

  if (action === "lift") {
    return {
      backgroundColor: "#e8f5e9",
      color: "#2e7d32",
      label: "Lifted",
    };
  }

  return {
    backgroundColor: "#fdecea",
    color: "#c62828",
    label: "Banned",
  };
}

function currentStatusColor(status: ManagedUser["status"]) {
  if (status === "active") {
    return {
      backgroundColor: "#e8f5e9",
      color: "#2e7d32",
    };
  }

  if (status === "suspended") {
    return {
      backgroundColor: "#fff4e5",
      color: "#b26a00",
    };
  }

  return {
    backgroundColor: "#fdecea",
    color: "#c62828",
  };
}

export default function SuspensionHistoryPanel({ user }: Props) {
  if (!user) {
    return (
      <Card
        sx={{
          borderRadius: "8px",
          border: "1px solid #e7e9ee",
          boxShadow: "none",
          p: 2,
        }}
      >
        <Typography sx={{ fontWeight: 600, color: "#111827" }}>
          Suspension history
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 13, color: "#6b7280" }}>
          Select a user from the table to view suspension history and audit records.
        </Typography>
      </Card>
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
          Suspension history
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
          Audit trail is retained even when access is restored.
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
            {user.name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
            {user.userType} · {user.email}
          </Typography>

          <Box sx={{ mt: 1.25, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={user.status}
              size="small"
              sx={{
                ...currentStatusColor(user.status),
                textTransform: "capitalize",
                fontWeight: 600,
              }}
            />
            <Chip
              label={user.appScope}
              size="small"
              sx={{
                backgroundColor: "#eef4ff",
                color: "#0b63d7",
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {user.history.length === 0 ? (
          <Box
            sx={{
              p: 2,
              borderRadius: "10px",
              border: "1px dashed #d1d5db",
              backgroundColor: "#fff",
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
              No history yet
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
              This user has not been suspended or banned in the current mock data.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gap: 1.25 }}>
            {user.history.map((record, index) => {
              const styles = actionColor(record.action);

              return (
                <Box
                  key={record.id}
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#fff",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1.5,
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <Box>
                      <Chip
                        label={styles.label}
                        size="small"
                        sx={{
                          backgroundColor: styles.backgroundColor,
                          color: styles.color,
                          fontWeight: 600,
                          mb: 1,
                        }}
                      />
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                        {record.appScope}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.4 }}>
                        Logged at {record.createdAt}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                      Record {user.history.length - index}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.25 }} />

                  <Box sx={{ display: "grid", gap: 0.75 }}>
                    <Typography sx={{ fontSize: 12, color: "#374151" }}>
                      <strong>Reason:</strong> {record.reason}
                    </Typography>

                    <Typography sx={{ fontSize: 12, color: "#374151" }}>
                      <strong>Suspended at:</strong> {record.suspendedAt ?? "—"}
                    </Typography>

                    <Typography sx={{ fontSize: 12, color: "#374151" }}>
                      <strong>Lifted at:</strong> {record.liftedAt ?? "—"}
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