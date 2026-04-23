"use client";

import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Select, MenuItem, Stack, CircularProgress
} from "@mui/material";
import { useRouter } from "next/navigation";

interface PendingCompany {
  id: string;
  name: string;
  domain: string;
  email: string;
  date: string;
  firstName?: string;
  lastName?: string;
}

export default function PendingCompanyApprovalsPanel() {
  const router = useRouter();
  const [pendingCompanies, setPendingCompanies] = useState<PendingCompany[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchPendingCompanies = async () => {
    try {
      const res = await fetch("/api/admin/pending-partners");
      if (res.ok) {
        const data = await res.json();
        setPendingCompanies(data);
      }
    } catch (error) {
      console.error("[UI_ERROR] Failed to fetch pending companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const handleTierChange = (companyId: string, tier: string) => {
    setSelectedTiers((prev) => ({ ...prev, [companyId]: tier }));
  };

  const handleApprove = async (companyId: string) => {
    const tier = selectedTiers[companyId];
    if (!tier) {
      alert("Please select a tier (Silver, Gold, or Platinum) before approving.");
      return;
    }

    const targetCompany = pendingCompanies.find((c) => c.id === companyId);

    try {
      const response = await fetch("/api/account/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: companyId,
          user: {
            email: targetCompany?.email,
            firstName: targetCompany?.firstName,
            lastName: targetCompany?.lastName,
          },
          admin: {
            userStatus: "ACTIVE",
            pending: {
              organisations: [
                {
                  clientId: "temp-org-1",
                  name: targetCompany?.name || "New Partner",
                  type: "INDUSTRY",
                },
              ],
            },
            organisationChoice: {
              kind: "pending",
              clientId: "temp-org-1",
            },
            roleChoices: [
              { kind: "existing", key: "MEMBER" }
            ],
            membership: {
              membershipTierId: tier,
              isActive: true,
            },
          },
        }),
      });

      if (response.ok) {
        alert("Approved successfully!");
        setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId));
        router.refresh();
      } else {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          alert(`Failed to approve: ${errorJson.error || "Unknown error"}`);
        } catch {
          alert(`Server failed with status ${response.status}. Check console.`);
        }
      }
    } catch (error) {
      console.error("[UI_ERROR] Error approving company:", error);
      alert("An error occurred while approving. Check console.");
    }
  };

  const handleReject = async (companyId: string) => {
    const targetCompany = pendingCompanies.find((c) => c.id === companyId);

    try {
      const response = await fetch("/api/account/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: companyId,
          user: {
            email: targetCompany?.email,
            firstName: targetCompany?.firstName,
            lastName: targetCompany?.lastName,
          },
          admin: {
            userStatus: "SUSPENDED",
          },
        }),
      });

      if (response.ok) {
        alert("Rejected successfully.");
        setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId));
        router.refresh();
      } else {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          alert(`Failed to reject: ${errorJson.error || "Unknown error"}`);
        } catch {
          alert(`Server failed with status ${response.status}.`);
        }
      }
    } catch (error) {
      console.error("[UI_ERROR] Error rejecting company:", error);
    }
  };

  if (loading) {
    return <CircularProgress size={24} sx={{ mb: 2 }} />;
  }

  if (pendingCompanies.length === 0) {
    return (
      <Card
        role="region"
        aria-label="Pending Company Registrations panel. No new recruiter accounts are awaiting review at the moment."
        sx={{ borderRadius: "8px", border: "1px solid #e8eaef", boxShadow: "none", mb: 2, p: 3, textAlign: "center" }}
      >
        <Typography sx={{ color: "#4b5563" }}>
          No pending company registrations at the moment.
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      role="region"
      aria-label={`Pending Company Registrations panel. ${pendingCompanies.length} newly registered recruiter account${pendingCompanies.length === 1 ? "" : "s"} awaiting your review. For each row, choose a membership tier and then approve or reject.`}
      sx={{ borderRadius: "8px", border: "1px solid #e8eaef", boxShadow: "none", mb: 2 }}
    >
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #e8eaef" }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1f2937" }}>
          Pending Company Registrations
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#4b5563", mt: 0.5 }}>
          Review and approve or reject newly registered recruiter accounts. Assign a membership tier to approve.
        </Typography>
      </Box>

      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f9fafb" }}>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#4b5563" }}>COMPANY NAME</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#4b5563" }}>DOMAIN</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#4b5563" }}>EMAIL</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#4b5563" }}>DATE</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#4b5563" }}>TIER ASSIGNMENT</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#4b5563", textAlign: "right" }}>ACTION</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingCompanies.map((company) => (
            <TableRow key={company.id}>
              <TableCell sx={{ fontSize: 14, fontWeight: 500 }}>{company.name}</TableCell>
              <TableCell sx={{ fontSize: 14, color: "#4b5563" }}>{company.domain}</TableCell>
              <TableCell sx={{ fontSize: 14, color: "#4b5563" }}>{company.email}</TableCell>
              <TableCell sx={{ fontSize: 14, color: "#4b5563" }}>{company.date}</TableCell>
              <TableCell>
                <Select
                  size="small"
                  displayEmpty
                  value={selectedTiers[company.id] || ""}
                  onChange={(e) => handleTierChange(company.id, e.target.value)}
                  inputProps={{
                    "aria-label": `Select tier for ${company.name}`,
                  }}
                  sx={{ minWidth: 120, fontSize: 14 }}
                >
                  <MenuItem value="" disabled>Select Tier</MenuItem>
                  <MenuItem value="1">Bronze</MenuItem>
                  <MenuItem value="2">Silver</MenuItem>
                  <MenuItem value="3">Gold</MenuItem>
                  <MenuItem value="4">Platinum</MenuItem>
                </Select>
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleReject(company.id)}
                    aria-label={`Reject registration for ${company.name}`}
                    sx={{ textTransform: "none" }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleApprove(company.id)}
                    aria-label={`Approve registration for ${company.name}`}
                    sx={{ textTransform: "none", boxShadow: "none" }}
                  >
                    Approve
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}