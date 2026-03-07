// src/components/talent-discovery/student-components/DashboardStatsRow.tsx
"use client";

import { Grid } from "@mui/material";
import StatisticsCard from "./StatisticsCard";

export type StatCardItem = {
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleColor?: string;
};

type DashboardStatsRowProps = {
  items: StatCardItem[];
};

export default function DashboardStatsRow({ items }: DashboardStatsRowProps) {
  return (
    <Grid container spacing={3}>
      {items.map((item, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
          <StatisticsCard
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            subtitleColor={item.subtitleColor}
          />
        </Grid>
      ))}
    </Grid>
  );
}
