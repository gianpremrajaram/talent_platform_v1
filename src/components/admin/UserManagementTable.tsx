"use client";

import {
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

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

function getStatusChipStyles(status: AccessStatus) {
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

      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 1080 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#111111" }}>
              {[
                "NAME",
                "TYPE",
                "EMAIL",
                "APP SCOPE",
                "STATUS",
                "SUSPENDED AT",
                "LIFTED AT",
                "ACTION",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    borderBottom: "none",
                    py: 1.5,
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              const isSelected = row.id === selectedUserId;

              return (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => onSelectUser(row.id)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: isSelected ? "#f8fbff" : undefined,
                  }}
                >
                  <TableCell sx={{ py: 1.8 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                      {row.name}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ py: 1.8, fontSize: 12 }}>{row.userType}</TableCell>

                  <TableCell sx={{ py: 1.8, fontSize: 12 }}>{row.email}</TableCell>

                  <TableCell sx={{ py: 1.8, fontSize: 12 }}>{row.appScope}</TableCell>

                  <TableCell sx={{ py: 1.8 }}>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        ...getStatusChipStyles(row.status),
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ py: 1.8, fontSize: 12 }}>
                    {row.suspendedAt ?? "—"}
                  </TableCell>

                  <TableCell sx={{ py: 1.8, fontSize: 12 }}>
                    {row.liftedAt ?? "—"}
                  </TableCell>

                  <TableCell sx={{ py: 1.8 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {row.status === "active" ? (
                        <>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAction(row.id, "suspend");
                            }}
                            sx={{
                              minWidth: 80,
                              height: 28,
                              borderRadius: "999px",
                              textTransform: "none",
                              fontSize: 11,
                              color: "#fff",
                              backgroundColor: "#f0a500",
                              "&:hover": { backgroundColor: "#d99100" },
                            }}
                          >
                            Suspend
                          </Button>

                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAction(row.id, "ban");
                            }}
                            sx={{
                              minWidth: 64,
                              height: 28,
                              borderRadius: "999px",
                              textTransform: "none",
                              fontSize: 11,
                              color: "#fff",
                              backgroundColor: "#ff2b2b",
                              "&:hover": { backgroundColor: "#e62121" },
                            }}
                          >
                            Ban
                          </Button>
                        </>
                      ) : null}

                      {row.status === "suspended" ? (
                        <>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAction(row.id, "lift");
                            }}
                            sx={{
                              minWidth: 64,
                              height: 28,
                              borderRadius: "999px",
                              textTransform: "none",
                              fontSize: 11,
                              color: "#fff",
                              backgroundColor: "#18a957",
                              "&:hover": { backgroundColor: "#148948" },
                            }}
                          >
                            Lift
                          </Button>

                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAction(row.id, "ban");
                            }}
                            sx={{
                              minWidth: 64,
                              height: 28,
                              borderRadius: "999px",
                              textTransform: "none",
                              fontSize: 11,
                              color: "#fff",
                              backgroundColor: "#ff2b2b",
                              "&:hover": { backgroundColor: "#e62121" },
                            }}
                          >
                            Ban
                          </Button>
                        </>
                      ) : null}

                      {row.status === "banned" ? (
                        <Chip
                          label="Permanent"
                          size="small"
                          sx={{
                            backgroundColor: "#fdecea",
                            color: "#c62828",
                            fontWeight: 600,
                          }}
                        />
                      ) : null}

                      <Button
                        size="small"
                        variant="text"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUser(row.id);
                        }}
                        sx={{
                          minWidth: 88,
                          height: 28,
                          textTransform: "none",
                          fontSize: 11,
                        }}
                      >
                        View history
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}

            {!rows.length ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ py: 5, textAlign: "center" }}>
                  <Typography sx={{ fontWeight: 600, color: "#374151" }}>
                    No users found
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.75 }}>
                    Try another search term or clear the current filter.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}