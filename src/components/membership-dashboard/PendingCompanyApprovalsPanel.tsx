"use client";

import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Select, MenuItem, Stack, CircularProgress
} from "@mui/material";
import { useRouter } from "next/navigation";

// Define data types
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

  // Fetch the pending approval list from the database on page load
  const fetchPendingCompanies = async () => {
    try {
      const res = await fetch("/api/admin/pending-partners");
      if (res.ok) {
        const data = await res.json();
        setPendingCompanies(data);
      }
    } catch (error) {
      console.error("Failed to fetch pending companies:", error);
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

    // Find the currently clicked company to get its specific details
    const targetCompany = pendingCompanies.find(c => c.id === companyId);

    try {
      const response = await fetch("/api/account/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 1. Target the specific user ID
          targetUserId: companyId, 
          
          // 2. Strictly wrap user details inside the user object
          user: {
            email: targetCompany?.email,
            firstName: targetCompany?.firstName,
            lastName: targetCompany?.lastName,
          },
          
          // 3. Admin transaction operations payload
          admin: {
            userStatus: "ACTIVE",
            // 👉 Prompt the backend to create the organisation first
            pending: {
              organisations: [
                { 
                  clientId: "temp-org-1", // Temporary placeholder ID for transaction linking
                  name: targetCompany?.name || "New Partner", 
                  type: "INDUSTRY" 
                }
              ]
            },
            // 👉 Bind the newly created organisation to this user
            organisationChoice: {
              kind: "pending",
              clientId: "temp-org-1"
            },
            
            // 👉 Assign platform roles (must use this exact array format)
            roleChoices: [
              { kind: "existing", key: "MEMBER" }
            ],

            // 👉 Finally, assign the selected membership tier
            membership: { 
              membershipTierId: tier, // Passing the numeric tier ID, e.g., "1"
              isActive: true 
            }
          }
        }),
      });

      // Handle successful approval response
      if (response.ok) {
        alert("Approved successfully!");
        setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId));
        router.refresh();
      } else {
        const errorText = await response.text(); 
        console.error("Backend error response:", errorText);
        try {
          const errorJson = JSON.parse(errorText);
          alert(`Failed to approve: ${errorJson.error || "Unknown error"}`);
        } catch (e) {
          alert(`Server failed with status ${response.status}. Check console.`);
        }
      }
    } catch (error) {
      console.error("Network or parsing error:", error);
      alert("An error occurred while approving. Check console.");
    }
  }; 

  const handleReject = async (companyId: string) => {
    const targetCompany = pendingCompanies.find(c => c.id === companyId);
    
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
            userStatus: "SUSPENDED"
          }
        }),
      });

      if (response.ok) {
        alert("Rejected successfully.");
        setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId));
        router.refresh();
      } else {
        // 👇 3. 顺手把错误捕获也加进来，防止悄悄崩溃
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          alert(`Failed to reject: ${errorJson.error || "Unknown error"}`);
        } catch {
          alert(`Server failed with status ${response.status}.`);
        }
      }
    } catch (error) {
      console.error("Error rejecting company:", error);
    }
  };

  if (loading) {
    return <CircularProgress size={24} sx={{ mb: 2 }} />;
  }

  // Display a placeholder message if there are no pending registrations
  if (pendingCompanies.length === 0) {
    return (
      <Card sx={{ borderRadius: "8px", border: "1px solid #e8eaef", boxShadow: "none", mb: 2, p: 3, textAlign: 'center' }}>
        <Typography sx={{ color: "#6b7280" }}>
          No pending company registrations at the moment.
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: "8px", border: "1px solid #e8eaef", boxShadow: "none", mb: 2 }}>
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #e8eaef" }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1f2937" }}>
          Pending Company Registrations
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.5 }}>
          Review and approve or reject newly registered recruiter accounts. Assign a membership tier to approve.
        </Typography>
      </Box>

      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f9fafb" }}>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>COMPANY NAME</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>DOMAIN</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>EMAIL</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>DATE</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>TIER ASSIGNMENT</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textAlign: "right" }}>ACTION</TableCell>
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
                  <Button variant="outlined" color="error" size="small" onClick={() => handleReject(company.id)} sx={{ textTransform: "none" }}>Reject</Button>
                  <Button variant="contained" color="success" size="small" onClick={() => handleApprove(company.id)} sx={{ textTransform: "none", boxShadow: "none" }}>Approve</Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}