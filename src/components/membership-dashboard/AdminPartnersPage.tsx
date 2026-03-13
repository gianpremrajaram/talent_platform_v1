"use client";

import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
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
    <Box data-admin-page="partners">
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
              </Box>

            </Stack>
          ) : null}

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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "10px",
                        display: "grid",
                        placeItems: "center",
                        backgroundColor: "#edf1f5",
                        color: "#55667c",
                        flexShrink: 0,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
                      {card.value}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: 12, color: "#8a8f98" }}>
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {showPartnersTable ? <PartnersTable /> : null}
    </Box>
  );
}
