"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import GppBadRoundedIcon from "@mui/icons-material/GppBadRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

import UserManagementTable, { type ManagedUser } from "./UserManagementTable";
import SuspensionHistoryPanel from "./SuspensionHistoryPanel";

export default function AdminStudentManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [metrics, setMetrics] = useState({ active: 0, suspended: 0, banned: 0, total: 0 });

  useEffect(() => {
    fetch("/api/admin/students")
      .then((res) => res.json())
      .then((data: ManagedUser[]) => {
        const safe = Array.isArray(data) ? data : [];
        setUsers(safe);
        setSelectedUserId(safe[0]?.id ?? "");
      });
    
    fetch("/api/admin/student-metrics")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setMetrics(data);
      });
  }, []);

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) =>
      user.name.toLowerCase().includes(keyword)
    );
  }, [users, search]);

  return (
    <Box data-admin-page="student-management">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography sx={{ fontSize: 21, fontWeight: 600, color: "#1f2937" }}>
                Student access management
              </Typography>
            </Box>

          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 1.8,
              mb: 2.5,
            }}
          >
            {[
              {
                title: "Active students",
                value: metrics.active,
                note: "Access currently allowed",
                icon: <VerifiedUserRoundedIcon />,
                bg: "#eef2ef",
                color: "#557564",
              },
              {
                title: "Suspended students",
                value: metrics.suspended,
                note: "Temporary app restriction",
                icon: <LockPersonRoundedIcon />,
                bg: "#f3efe8",
                color: "#8a7448",
              },
              {
                title: "Banned students",
                value: metrics.banned,
                note: "Permanent restriction",
                icon: <GppBadRoundedIcon />,
                bg: "#f4ecec",
                color: "#865e62",
              },
              {
                title: "Student accounts",
                value: metrics.total,
                note: "Managed in this scope",
                icon: <SchoolRoundedIcon />,
                bg: "#edf1f5",
                color: "#55667c",
              },
            ].map((card) => (
              <Card
                key={card.title}
                sx={{
                  borderRadius: "8px",
                  border: "1px solid #e8eaef",
                  boxShadow: "none",
                }}
              >
                <CardContent sx={{ px: 2, py: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "10px",
                        display: "grid",
                        placeItems: "center",
                        backgroundColor: card.bg,
                        color: card.color,
                        flexShrink: 0,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>
                      {card.value}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: 14, color: "#8a8f98" }}>
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: 2.5,
              alignItems: "start",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <UserManagementTable
                rows={filteredUsers}
                selectedUserId={selectedUserId}
                onSelectUser={(userId) => setSelectedUserId(userId)}
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search students"
              />
            </Box>

            <Box sx={{ width: "100%" }}>
              <SuspensionHistoryPanel user={selectedUser} />
            </Box>
          </Box>
    </Box>
  );
}
