"use client";

import { Box, Button, Card, Stack, Typography } from "@mui/material";
import AdminDataTable, { AdminTableColumn } from "./AdminDataTable";

export type AppScope = "Talent Platform";
export type UserType = "Student" | "Company";
export type AccessStatus = "active" | "suspended" | "banned";
export type SuspensionActionType = "suspend" | "lift" | "ban";

export type SuspensionRecord = {
  id: string;
  action: SuspensionActionType;
  appScope: AppScope;
  createdAt: string;
  suspendedAt: string | null;
  liftedAt: string | null;
  reason: string;
};

export type ManagedUser = {
  id: string;
  name: string;
  userType: UserType;
  email: string;
  appScope: AppScope;
  status: AccessStatus;
  suspendedAt: string | null;
  liftedAt: string | null;
  history: SuspensionRecord[];
};

type Props = {
  rows: ManagedUser[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onOpenAction: (userId: string, action: SuspensionActionType) => void;
};

const columns: AdminTableColumn[] = [
  { key: "name", label: "NAME", width: "15%" },
  { key: "userType", label: "TYPE", width: "8%" },
  { key: "email", label: "EMAIL", width: "24%" },
  { key: "appScope", label: "APP SCOPE", width: "12%" },
  { key: "status", label: "STATUS", width: "8%" },
  { key: "suspendedAt", label: "SUSPENDED AT", width: "13%" },
  { key: "liftedAt", label: "LIFTED AT", width: "10%" },
  { key: "action", label: "ACTION", width: "10%" },
];

function statusTextColor(status: AccessStatus) {
  if (status === "active") return "#1f6a4f";
  if (status === "suspended") return "#8a6b2f";
  return "#a23b45";
}

function formatDateOnly(value: string | null) {
  if (!value) return "--";
  const trimmed = value.trim();
  const commaIndex = trimmed.indexOf(",");
  if (commaIndex > 0) {
    return trimmed.slice(0, commaIndex);
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function textActionButtonSx(color: string) {
  return {
    minWidth: 0,
    height: "auto",
    px: 0,
    py: 0.15,
    textTransform: "none",
    fontSize: 12,
    fontWeight: 600,
    color,
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "transparent",
      textDecoration: "underline",
    },
  };
}

export default function UserManagementTable({
  rows,
  selectedUserId,
  onSelectUser,
  onOpenAction,
}: Props) {
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
          User management panel
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
          Suspend or ban access to the Talent Platform without impacting other applications.
        </Typography>
      </Box>

      <AdminDataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        onRowClick={(row) => onSelectUser(row.id)}
        getRowSx={(row) => {
          const isSelected = row.id === selectedUserId;
          if (!isSelected) return {};

          return {
            backgroundColor: "#edf3fa",
            "&:hover": {
              backgroundColor: "#edf3fa",
            },
          };
        }}
        getCells={(row) => {
          const showSuspend = row.status === "active";
          const showLift = row.status === "suspended";
          const showBan = row.status === "active" || row.status === "suspended";

          return [
            {
              key: "name",
              content: <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{row.name}</Typography>,
            },
            { key: "userType", content: row.userType },
            {
              key: "email",
              content: row.email,
              sx: {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            },
            { key: "appScope", content: row.appScope },
            {
              key: "status",
              content: (
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "capitalize",
                    color: statusTextColor(row.status),
                  }}
                >
                  {row.status}
                </Typography>
              ),
            },
            {
              key: "suspendedAt",
              content: formatDateOnly(row.suspendedAt),
              sx: {
                whiteSpace: "nowrap",
              },
            },
            {
              key: "liftedAt",
              content: formatDateOnly(row.liftedAt),
              sx: {
                whiteSpace: "nowrap",
              },
            },
            {
              key: "action",
              content: (
                <Stack direction="column" spacing={0.1} alignItems="flex-start">
                  {showSuspend ? (
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAction(row.id, "suspend");
                      }}
                      sx={textActionButtonSx("#8a6b2f")}
                    >
                      Suspend
                    </Button>
                  ) : null}

                  {showLift ? (
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAction(row.id, "lift");
                      }}
                      sx={textActionButtonSx("#1f6a4f")}
                    >
                      Lift
                    </Button>
                  ) : null}

                  {showBan ? (
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAction(row.id, "ban");
                      }}
                      sx={textActionButtonSx("#a23b45")}
                    >
                      Ban
                    </Button>
                  ) : null}

                  {row.status === "banned" ? (
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#a23b45" }}>
                      Permanent
                    </Typography>
                  ) : null}

                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectUser(row.id);
                    }}
                    sx={textActionButtonSx("#4b6078")}
                  >
                    View history
                  </Button>
                </Stack>
              ),
            },
          ];
        }}
        emptyState={
          <>
            <Typography sx={{ fontWeight: 600, color: "#374151" }}>
              No users found
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.75 }}>
              Try another search term or clear the current filter.
            </Typography>
          </>
        }
      />
    </Card>
  );
}
