"use client";

import {
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
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import AdminSidebar from "./AdminSidebar";
import PartnersTable from "./PartnersTable";

type AdminPartnersPageProps = {
  showPartnersTable?: boolean;
  showTopToolbar?: boolean;
};

export default function AdminPartnersPage({
  showPartnersTable = true,
  showTopToolbar = true,
}: AdminPartnersPageProps) {
  const statCards = [
    {
      title: "Pending partner projects",
      value: "8",
      note: "Awaiting admin decision",
      icon: <AssignmentTurnedInRoundedIcon />,
    },
    {
      title: "Approved today",
      value: "3",
      note: "Ready for partner visibility",
      icon: <TaskAltRoundedIcon />,
    },
    {
      title: "Rejected today",
      value: "1",
      note: "Not published to partner feed",
      icon: <BlockRoundedIcon />,
    },
    {
      title: "Active partner companies",
      value: "18",
      note: "Submitting project opportunities",
      icon: <BusinessRoundedIcon />,
    },
  ];

  return (
    <Box data-admin-page="partners" sx={{ py: 2, width: "100%" }}>
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
          {showTopToolbar ? (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
                  Partner Project Approvals
                </Typography>
                <Typography sx={{ mt: 0.75, color: "#6b7280", maxWidth: 760 }}>
                  Review partner-submitted projects, validate listing quality, and approve
                  or reject publication in the platform.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.2} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search partner projects"
                  sx={{
                    width: 230,
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
                  sx={{
                    border: "1px solid #d9dde3",
                    backgroundColor: "#fff",
                  }}
                >
                  <NotificationsNoneRoundedIcon />
                </IconButton>

                <Avatar sx={{ width: 36, height: 36, bgcolor: "#6b7f96" }}>A</Avatar>
              </Stack>
            </Stack>
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
                  Partner review workflow
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
                  Validate partner project postings before publishing them to talent
                </Typography>

                <Typography sx={{ color: "#4b5563" }}>
                  Approved projects become discoverable to eligible users. Rejected
                  projects remain hidden until the partner submits a revised version.
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                  <Chip
                    label="Silver / Gold / Platinum partner tiers"
                    sx={{
                      color: "#516074",
                      backgroundColor: "#edf2f8",
                      border: "1px solid #ced9e6",
                    }}
                  />
                  <Chip
                    label="Pending projects hidden by default"
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
                  Publishing rule
                </Typography>
                <Typography
                  sx={{ color: "#334155", fontSize: 28, fontWeight: 800, my: 0.75 }}
                >
                  PARTNER LIVE
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                  Applied only after admin approval of the submitted project listing
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
            {statCards.map((card) => (
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
                      backgroundColor: "#edf1f5",
                      color: "#55667c",
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

          {showPartnersTable ? <PartnersTable /> : null}
        </Box>
      </Box>
    </Box>
  );
}
