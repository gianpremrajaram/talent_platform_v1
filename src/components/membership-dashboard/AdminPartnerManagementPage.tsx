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
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";

import UserManagementTable, { type ManagedUser } from "./UserManagementTable";
import SuspensionHistoryPanel from "./SuspensionHistoryPanel";

export default function AdminPartnerManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/partners")
      .then((res) => res.json())
      .then((data: ManagedUser[]) => {
        setUsers(data);
        setSelectedUserId(data[0]?.id ?? "");
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

  const activeCount = users.filter((u) => u.status === "active").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;
  const bannedCount = users.filter((u) => u.status === "banned").length;

  return (
    <Box data-admin-page="partner-management">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography sx={{ fontSize: 21, fontWeight: 600, color: "#1f2937" }}>
                Partner access management
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
                title: "Active partners",
                value: activeCount,
                note: "Access currently allowed",
                icon: <VerifiedUserRoundedIcon />,
                bg: "#eef2ef",
                color: "#557564",
              },
              {
                title: "Suspended partners",
                value: suspendedCount,
                note: "Temporary app restriction",
                icon: <LockPersonRoundedIcon />,
                bg: "#f3efe8",
                color: "#8a7448",
              },
              {
                title: "Banned partners",
                value: bannedCount,
                note: "Permanent restriction",
                icon: <GppBadRoundedIcon />,
                bg: "#f4ecec",
                color: "#865e62",
              },
              {
                title: "Partner accounts",
                value: users.length,
                note: "Managed in this scope",
                icon: <BusinessRoundedIcon />,
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
                searchPlaceholder="Search partners"
              />
            </Box>

            <Box sx={{ width: "100%" }}>
              <SuspensionHistoryPanel user={selectedUser} />
            </Box>
          </Box>
    </Box>
  );
}
