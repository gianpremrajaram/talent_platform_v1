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
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PartnersTable from "./PartnersTable";

type AdminPartnersPageProps = {
  showPartnersTable?: boolean;
  showTopToolbar?: boolean;
};

type StatsResponse = {
  totalJobs: number;
  activeJobs: number;
  expiredJobs: number;
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
      if (!res.ok) { setStats(null); return; }
      const data: StatsResponse = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const statCards = [
    {
      title: "Total job postings",
      value: stats?.totalJobs,
      note: "All postings across all companies",
      icon: <WorkOutlineRoundedIcon />,
    },
    {
      title: "Active postings",
      value: stats?.activeJobs,
      note: "Currently visible to students",
      icon: <CheckCircleOutlineRoundedIcon />,
    },
    {
      title: "Expired postings",
      value: stats?.expiredJobs,
      note: "Past expiry date",
      icon: <ScheduleRoundedIcon />,
    },
    {
      title: "Partner companies",
      value: stats?.activePartners,
      note: "Companies with at least one posting",
      icon: <BusinessRoundedIcon />,
    },
  ];

  return (
    <Box data-admin-page="partners">
      {showTopToolbar && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Typography
            component="h1"
            sx={{ fontSize: 21, fontWeight: 600, color: "#1f2937" }}
          >
            All Job Postings
          </Typography>
        </Stack>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 1.8,
          mb: 2.5,
        }}
      >
        {statCards.map((card) => {
          const valueText = statsLoading ? "Loading" : String(card.value ?? 0);
          return (
            <Card
              key={card.title}
              aria-label={`${valueText} ${card.title}. ${card.note}.`}
              sx={{ borderRadius: "8px", border: "1px solid #e8eaef", boxShadow: "none" }}
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
                  {statsLoading ? (
                    <CircularProgress size={18} />
                  ) : (
                    <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>
                      {card.value ?? 0}
                    </Typography>
                  )}
                </Box>
                <Typography sx={{ fontSize: 14, color: "#8a8f98" }}>{card.title}</Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {showPartnersTable && <PartnersTable onRowsChanged={loadStats} />}
    </Box>
  );
}
