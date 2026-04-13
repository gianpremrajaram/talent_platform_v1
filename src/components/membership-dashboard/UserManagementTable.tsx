"use client";

import {
  Button,
  Card,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
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
  tierLabel?: string;
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
  onOpenAction?: (userId: string, action: SuspensionActionType) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
};

const columns: AdminTableColumn[] = [
  { key: "name", label: "NAME", width: "18%" },
  { key: "userType", label: "TYPE", width: "10%" },
  { key: "email", label: "EMAIL", width: "30%" },
  { key: "appScope", label: "APP SCOPE", width: "15%" },
  { key: "status", label: "STATUS", width: "10%" },
  { key: "action", label: "ACTION", width: "17%" },
];

function tierChipSx(label: string) {
  const key = label.toLowerCase();
  if (key === "platinum") return { backgroundColor: "#dbeafe", color: "#1e3a8a" };
  if (key === "gold")     return { backgroundColor: "#fef08a", color: "#713f12" };
  if (key === "silver")   return { backgroundColor: "#e2e8f0", color: "#1e293b" };
  if (key === "bronze")   return { backgroundColor: "#fed7aa", color: "#7c2d12" };
  return { backgroundColor: "#f3f4f6", color: "#374151" };
}

function statusTextColor(status: AccessStatus) {
  if (status === "active") return "#1f6a4f";
  if (status === "suspended") return "#8a6b2f";
  return "#a23b45";
}

function textActionButtonSx(color: string) {
  return {
    minWidth: 0,
    height: "auto",
    px: 0,
    py: 0.15,
    textTransform: "none",
    fontSize: 14,
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
  search = "",
  onSearchChange,
  searchPlaceholder = "Search users",
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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2, py: 1.4, borderBottom: "1px solid #eceef2" }}
      >
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "#111827" }}>
          User management panel
        </Typography>
        <TextField
          size="small"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          sx={{
            width: 220,
            "& .MuiOutlinedInput-root": {
              height: 34,
              backgroundColor: "#f9fafb",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" sx={{ color: "#4b5563" }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

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
          return [
            {
              key: "name",
              content: (
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {row.name}
                </Typography>
              ),
            },
            {
              key: "userType",
              content: row.tierLabel ? (
                <Chip
                  label={row.tierLabel}
                  size="small"
                  sx={{ fontWeight: 600, ...tierChipSx(row.tierLabel) }}
                />
              ) : (
                row.userType
              ),
            },
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
                    fontSize: 14,
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
              key: "action",
              content: (
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href =
                      row.userType === "Student"
                        ? `/membership-dashboard/student-users/${row.id}/edit`
                        : row.userType === "Company"
                        ? `/membership-dashboard/partner-users/${row.id}/edit`
                        : "/account";
                  }}
                  sx={textActionButtonSx("#4b6078")}
                >
                  Edit
                </Button>
              ),
            },
          ];
        }}
        emptyState={
          <>
            <Typography sx={{ fontWeight: 600, color: "#374151" }}>
              No users found
            </Typography>
            <Typography sx={{ fontSize: 15, color: "#4b5563", mt: 0.75 }}>
              Try another search term or clear the current filter.
            </Typography>
          </>
        }
      />
    </Card>
  );
}
