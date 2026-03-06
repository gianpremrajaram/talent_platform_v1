"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";

type DashboardStatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleColor?: string;
};

export default function StatisticsCard({
  title,
  value,
  subtitle,
  subtitleColor = "text.secondary",
}: DashboardStatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        minHeight: 90, // reduced from 120
        boxShadow: "none",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {" "}
        {/* reduced from 2.5 */}
        <Box>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontWeight: 500, mb: 0.5 }}
          >
            {title}
          </Typography>

          <Typography
            variant="h5" // reduced from h4
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.25 }}
          >
            {value}
          </Typography>

          {subtitle && (
            <Typography
              variant="caption" // smaller text
              sx={{ color: subtitleColor, fontWeight: 500 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
