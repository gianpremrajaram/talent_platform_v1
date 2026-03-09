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
import PendingCompanyRegistrationsTable from "./PendingCompanyRegistrationsTable";

export default function AdminApprovalsPage() {
  const statCards = [
    {
      title: "Pending registrations",
      value: "8",
      note: "Awaiting admin action",
      icon: <AssignmentTurnedInRoundedIcon />,
    },
    {
      title: "Approved today",
      value: "3",
      note: "Tier + organisation assigned",
      icon: <TaskAltRoundedIcon />,
    },
    {
      title: "Rejected today",
      value: "1",
      note: "No platform access",
      icon: <BlockRoundedIcon />,
    },
    {
      title: "New company domains",
      value: "5",
      note: "Needs verification review",
      icon: <BusinessRoundedIcon />,
    },
  ];

  return (
    <Box data-admin-page="approvals" sx={{ py: 2, width: "100%" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "230px minmax(0, 1fr)",
          gap: 3,
          alignItems: "start",
        }}
      >
        <AdminSidebar activeItem="approvals" />

        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography sx={{ fontSize: 12, color: "#8a8f98", mb: 0.75 }}>
                Home / Admin / Approvals
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
                Pending Company Registrations
              </Typography>
              <Typography sx={{ mt: 0.75, color: "#6b7280", maxWidth: 760 }}>
                Review recruiter company sign-ups, verify organisation details,
                assign a membership tier, and approve or reject access to the
                talent platform.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search companies"
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

              <Avatar sx={{ width: 36, height: 36, bgcolor: "#2f7df6" }}>A</Avatar>
            </Stack>
          </Stack>

          <Card
            sx={{
              borderRadius: "10px",
              overflow: "hidden",
              mb: 2.5,
              border: "1px solid #d8e7ff",
              boxShadow: "none",
              background:
                "linear-gradient(90deg, #0b63d7 0%, #2d8df5 55%, #8fd0ff 100%)",
            }}
          >
            <CardContent
              sx={{
                px: 3,
                py: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Box sx={{ color: "#fff", maxWidth: 620 }}>
                <Typography sx={{ fontSize: 12, opacity: 0.95, mb: 1 }}>
                  Approval workflow
                </Typography>

                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    mb: 1,
                  }}
                >
                  Verify recruiter registrations before enabling talent platform access
                </Typography>

                <Typography sx={{ opacity: 0.95 }}>
                  Approving a registration should assign the selected membership
                  tier, link or create the organisation, and grant MEMBER access.
                  Bronze is intentionally excluded because it is equivalent to rejection.
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                  <Chip
                    label="Silver / Gold / Platinum only"
                    sx={{
                      color: "#fff",
                      backgroundColor: "rgba(255,255,255,0.16)",
                      border: "1px solid rgba(255,255,255,0.24)",
                    }}
                  />
                  <Chip
                    label="Pending recruiters blocked by default"
                    sx={{
                      color: "#fff",
                      backgroundColor: "rgba(255,255,255,0.16)",
                      border: "1px solid rgba(255,255,255,0.24)",
                    }}
                  />
                </Stack>
              </Box>

              <Box
                sx={{
                  minWidth: 230,
                  borderRadius: 3,
                  p: 2.2,
                  backgroundColor: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <Typography sx={{ color: "#fff", opacity: 0.92, fontSize: 13 }}>
                  Approval rule
                </Typography>
                <Typography
                  sx={{ color: "#fff", fontSize: 28, fontWeight: 800, my: 0.75 }}
                >
                  MEMBER
                </Typography>
                <Typography sx={{ color: "#fff", opacity: 0.92, fontSize: 13 }}>
                  Granted only after admin approval with a valid tier selection
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
                      backgroundColor: "#eef4ff",
                      color: "#0b63d7",
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
                  <Typography sx={{ fontSize: 12, color: "#2e7d32", mt: 0.5 }}>
                    {card.note}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <PendingCompanyRegistrationsTable />
        </Box>
      </Box>
    </Box>
  );
}