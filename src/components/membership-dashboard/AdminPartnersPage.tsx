"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
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

type StatsResponse = {
  pending: number;
  approvedToday: number;
  rejectedToday: number;
  activePartners: number;
};

export default function AdminPartnersPage({
  showPartnersTable = true,
  showTopToolbar = true,
}: AdminPartnersPageProps) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/partner-projects/stats");
      if (!res.ok) {
        setStats(null);
        return;
      }
      const data: StatsResponse = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = [
    {
      title: "Pending partner projects",
      value: stats?.pending,
      note: "Awaiting admin decision",
      icon: <AssignmentTurnedInRoundedIcon />,
    },
    {
      title: "Approved today",
      value: stats?.approvedToday,
      note: "Ready for partner visibility",
      icon: <TaskAltRoundedIcon />,
    },
    {
      title: "Rejected today",
      value: stats?.rejectedToday,
      note: "Not published to partner feed",
      icon: <BlockRoundedIcon />,
    },
    {
      title: "Active partner companies",
      value: stats?.activePartners,
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
            <Typography sx={{ fontSize: 21, fontWeight: 600, color: "#1f2937" }}>
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  mb: 1.5,
                }}
              >
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
                {statsLoading ? (
                  <CircularProgress size={18} />
                ) : (
                  <Typography
                    sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}
                  >
                    {card.value ?? 0}
                  </Typography>
                )}
              </Box>

              <Typography sx={{ fontSize: 14, color: "#8a8f98" }}>
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {showPartnersTable ? <PartnersTable onRowsChanged={loadStats} /> : null}
    </Box>
  );
}
