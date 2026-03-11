"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import GppBadRoundedIcon from "@mui/icons-material/GppBadRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";

import AdminSidebar from "./AdminSidebar";
import UserManagementTable, {
  type ManagedUser,
  type SuspensionActionType,
  type AppScope,
  type SuspensionRecord,
} from "./UserManagementTable";
import SuspensionActionModal from "./SuspensionActionModal";
import SuspensionHistoryPanel from "./SuspensionHistoryPanel";

type ModalState = {
  isOpen: boolean;
  action: SuspensionActionType | null;
  userId: string | null;
};

function nowLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
}

const initialPartners: ManagedUser[] = [
  {
    id: "user-002",
    name: "Northbridge Analytics",
    userType: "Company",
    email: "careers@northbridge-analytics.com",
    appScope: "Talent Platform",
    status: "suspended",
    suspendedAt: "08 Mar 2026, 14:30",
    liftedAt: null,
    history: [
      {
        id: "hist-001",
        action: "suspend",
        appScope: "Talent Platform",
        createdAt: "08 Mar 2026, 14:30",
        suspendedAt: "08 Mar 2026, 14:30",
        liftedAt: null,
        reason: "Repeated violation of partner messaging guidelines.",
      },
    ],
  },
  {
    id: "user-004",
    name: "MedAxis Research",
    userType: "Company",
    email: "talent@medaxisresearch.com",
    appScope: "Talent Platform",
    status: "active",
    suspendedAt: null,
    history: [
      {
        id: "hist-003",
        action: "suspend",
        appScope: "Talent Platform",
        createdAt: "02 Mar 2026, 11:20",
        suspendedAt: "02 Mar 2026, 11:20",
        liftedAt: null,
        reason: "Temporary suspension during verification review.",
      },
      {
        id: "hist-004",
        action: "lift",
        appScope: "Talent Platform",
        createdAt: "03 Mar 2026, 10:10",
        suspendedAt: null,
        liftedAt: "03 Mar 2026, 10:10",
        reason: "Verification completed and access restored.",
      },
    ],
    liftedAt: "03 Mar 2026, 10:10",
  },
];

export default function AdminPartnerManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>(initialPartners);
  const [search, setSearch] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>(initialPartners[0]?.id ?? "");
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    action: null,
    userId: null,
  });

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.status.toLowerCase().includes(keyword)
    );
  }, [users, search]);

  const activeCount = users.filter((u) => u.status === "active").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;
  const bannedCount = users.filter((u) => u.status === "banned").length;

  function openActionModal(userId: string, action: SuspensionActionType) {
    setModalState({ isOpen: true, action, userId });
  }

  function closeActionModal() {
    setModalState({ isOpen: false, action: null, userId: null });
  }

  function handleConfirmAction(payload: {
    userId: string;
    action: SuspensionActionType;
    appScope: AppScope;
    reason: string;
  }) {
    const timestamp = nowLabel();

    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id !== payload.userId) return user;

        let nextHistoryRecord: SuspensionRecord | null = null;

        if (payload.action === "suspend") {
          nextHistoryRecord = {
            id: `hist-${Date.now()}-${user.id}`,
            action: "suspend",
            appScope: payload.appScope,
            createdAt: timestamp,
            suspendedAt: timestamp,
            liftedAt: null,
            reason: payload.reason,
          };
          return {
            ...user,
            status: "suspended",
            appScope: payload.appScope,
            suspendedAt: timestamp,
            liftedAt: null,
            history: [nextHistoryRecord, ...user.history],
          };
        }

        if (payload.action === "lift") {
          nextHistoryRecord = {
            id: `hist-${Date.now()}-${user.id}`,
            action: "lift",
            appScope: payload.appScope,
            createdAt: timestamp,
            suspendedAt: null,
            liftedAt: timestamp,
            reason: payload.reason,
          };
          return {
            ...user,
            status: "active",
            appScope: payload.appScope,
            suspendedAt: null,
            liftedAt: timestamp,
            history: [nextHistoryRecord, ...user.history],
          };
        }

        nextHistoryRecord = {
          id: `hist-${Date.now()}-${user.id}`,
          action: "ban",
          appScope: payload.appScope,
          createdAt: timestamp,
          suspendedAt: timestamp,
          liftedAt: null,
          reason: payload.reason,
        };
        return {
          ...user,
          status: "banned",
          appScope: payload.appScope,
          suspendedAt: timestamp,
          liftedAt: null,
          history: [nextHistoryRecord, ...user.history],
        };
      })
    );

    const target = users.find((u) => u.id === payload.userId);
    if (target) {
      if (payload.action === "suspend") {
        setBannerMessage(
          `${target.name} has been suspended from ${payload.appScope}. Other apps remain unaffected.`
        );
      } else if (payload.action === "lift") {
        setBannerMessage(
          `${target.name}'s suspension has been lifted for ${payload.appScope}. Access can be restored.`
        );
      } else {
        setBannerMessage(
          `${target.name} has been permanently banned from ${payload.appScope}.`
        );
      }
    }

    closeActionModal();
  }

  const modalUser = users.find((u) => u.id === modalState.userId) ?? null;

  return (
    <Box data-admin-page="partner-management" sx={{ py: 2, width: "100%" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "230px minmax(0, 1fr)",
          gap: 3,
          alignItems: "start",
        }}
      >
        <AdminSidebar />

        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
                Partner access management
              </Typography>
              <Typography sx={{ mt: 0.75, color: "#6b7280", maxWidth: 760 }}>
                Suspend, lift, or permanently ban partner access to the Talent
                Platform without affecting other apps.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.2} alignItems="center">
              <TextField
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search partners"
                sx={{
                  width: 240,
                  "& .MuiOutlinedInput-root": {
                    height: 38,
                    backgroundColor: "#fff",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <IconButton
                aria-label="Notifications"
                sx={{ border: "1px solid #d9dde3", backgroundColor: "#fff" }}
              >
                <NotificationsNoneRoundedIcon />
              </IconButton>

              <Avatar sx={{ width: 36, height: 36, bgcolor: "#6b7f96" }}>A</Avatar>
            </Stack>
          </Stack>

          {bannerMessage ? (
            <Alert sx={{ mb: 2.5 }} severity="success">
              {bannerMessage}
            </Alert>
          ) : null}

          <Card
            sx={{
              borderRadius: "10px",
              overflow: "hidden",
              mb: 2.5,
              border: "1px solid #dbe4ef",
              boxShadow: "none",
              background:
                "linear-gradient(120deg, #f7f9fc 0%, #eef3f8 62%, #e7edf5 100%)",
            }}
          >
            <CardContent
              sx={{
                px: 3,
                py: 3.1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Box sx={{ color: "#334155", maxWidth: 620 }}>
                <Typography sx={{ fontSize: 12, color: "#64748b", mb: 1 }}>
                  App-specific enforcement
                </Typography>

                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    mb: 1,
                    color: "#1f2937",
                  }}
                >
                  Enforce platform rules without cross-app side effects
                </Typography>

                <Typography sx={{ color: "#4b5563" }}>
                  Suspensions on this page are scoped to the Talent Platform
                  only. Use suspend for temporary restriction, lift to restore
                  access, and ban for permanent removal.
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                  <Chip
                    label="Per-app suspension"
                    sx={{
                      color: "#516074",
                      backgroundColor: "#edf2f8",
                      border: "1px solid #ced9e6",
                    }}
                  />
                  <Chip
                    label="History retained for audit"
                    sx={{
                      color: "#516074",
                      backgroundColor: "#edf2f8",
                      border: "1px solid #ced9e6",
                    }}
                  />
                </Stack>
              </Box>

              <Box
                sx={{
                  minWidth: 230,
                  borderRadius: 3,
                  p: 2.2,
                  backgroundColor: "#eff4f9",
                  border: "1px solid #d3deea",
                }}
              >
                <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                  Current scope
                </Typography>
                <Typography
                  sx={{ color: "#334155", fontSize: 28, fontWeight: 800, my: 0.75 }}
                >
                  Talent Platform
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                  Suspension checks should happen inside app-specific access control
                </Typography>
              </Box>
            </CardContent>
          </Card>

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
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: card.bg,
                      color: card.color,
                      mb: 1.5,
                    }}
                  >
                    {card.icon}
                  </Box>

                  <Typography sx={{ fontSize: 12, color: "#8a8f98" }}>
                    {card.title}
                  </Typography>
                  <Typography sx={{ fontSize: 28, fontWeight: 700, mt: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
                    {card.note}
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
                onOpenAction={openActionModal}
              />
            </Box>

            <Box sx={{ width: "100%" }}>
              <SuspensionHistoryPanel user={selectedUser} />
            </Box>
          </Box>
        </Box>
      </Box>

      <SuspensionActionModal
        isOpen={modalState.isOpen}
        action={modalState.action}
        user={modalUser}
        onClose={closeActionModal}
        onConfirm={handleConfirmAction}
      />
    </Box>
  );
}
