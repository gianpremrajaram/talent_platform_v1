"use client";

import { useState, useEffect } from "react";
import { Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Chip } from "@mui/material";

interface SuspendedCompany {
  id: string;
  name: string;
  domain: string;
  email: string;
}

export default function SuspendedCompanyPanel() {
  const [suspendedCompanies, setSuspendedCompanies] = useState<SuspendedCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuspended = async () => {
      try {
        const res = await fetch("/api/admin/suspended-partners"); // 👈 调用我们刚写的新 API
        if (res.ok) {
          const data = await res.json();
          setSuspendedCompanies(data);
        }
      } catch (error) {
        console.error("Failed to fetch suspended companies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuspended();
  }, []);

  if (loading) return <CircularProgress size={24} sx={{ mt: 2 }} />;

  if (suspendedCompanies.length === 0) return null; // 如果没人被拒绝，就不显示这个面板

  return (
    <Card sx={{ borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "none", mt: 4 }}>
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #fca5a5", bgcolor: "#fef2f2" }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#991b1b" }}>
          Rejected / Suspended Registrations
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#b91c1c", mt: 0.5 }}>
          These companies have been denied access to the platform.
        </Typography>
      </Box>

      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#fff" }}>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>COMPANY NAME</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>DOMAIN</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>EMAIL</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textAlign: "right" }}>STATUS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {suspendedCompanies.map((company) => (
            <TableRow key={company.id}>
              <TableCell sx={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{company.name}</TableCell>
              <TableCell sx={{ fontSize: 14, color: "#6b7280" }}>{company.domain}</TableCell>
              <TableCell sx={{ fontSize: 14, color: "#6b7280" }}>{company.email}</TableCell>
              <TableCell align="right">
                <Chip label="Rejected" color="error" size="small" variant="outlined" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}