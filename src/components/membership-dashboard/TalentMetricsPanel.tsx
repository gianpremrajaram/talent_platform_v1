// src/components/membership-dashboard/TalentMetricsPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { Box, Card, Typography, Grid, CircularProgress } from "@mui/material";
import { PieChart } from "@mui/x-charts";

// 定义后端返回的数据格式
interface MetricsData {
  totalStudents: number;
  consentedStudents: number;
  approvedFirms: number;
  matchablePairs: number;
}

export default function TalentMetricsPanel() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  // 页面加载时请求数据
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/admin/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        } else {
          console.error("[UI_ERROR] Failed to fetch metrics");
        }
      } catch (error) {
        console.error("[UI_ERROR] Network error:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 如果请求失败，给个兜底显示
  if (!metrics) {
    return <Typography color="error">Failed to load metrics data.</Typography>;
  }

  // 饼图数据：同意的学生 vs 未同意的学生
  const chartData = [
    { id: 0, value: metrics.consentedStudents, label: "Consented", color: "#2e7d32" },
    { id: 1, value: metrics.totalStudents - metrics.consentedStudents, label: "Not Consented", color: "#e0e0e0" },
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        {/* 顶部 4 个统计卡片 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Total Students" value={metrics.totalStudents} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Consented Students" value={metrics.consentedStudents} color="#2e7d32" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Approved Firms" value={metrics.approvedFirms} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Matchable Pairs" value={metrics.matchablePairs.toLocaleString()} />
        </Grid>

        {/* 底部饼图区域 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Student Consent Rate</Typography>
            <PieChart
              series={[
                {
                  data: chartData,
                  innerRadius: 40, 
                  outerRadius: 100,
                  paddingAngle: 2,
                  cornerRadius: 4,
                },
              ]}
              width={400}
              height={250}
              margin={{ right: 5 }}
            />
          </Card>
        </Grid>

        {/* 右侧说明 */}
        <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 3, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none", height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>About these metrics</Typography>
                <Typography variant="body2" color="text.secondary">
                    These metrics represent the "North Star" health of the Talent Platform.
                    It tracks users who have passed initial verification and can use the platform without friction.
                </Typography>
            </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function MetricCard({ title, value, color = "#111827" }: { title: string, value: string | number, color?: string }) {
  return (
    <Card sx={{ p: 3, borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "none" }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", mb: 1 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 28, fontWeight: 700, color: color }}>
        {value}
      </Typography>
    </Card>
  );
}