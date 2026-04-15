"use client";

import { useState } from "react";
import { Box, Button, TextField, Stack, Typography, MenuItem, Select, Card, Divider } from "@mui/material";
import { updateOrganisation } from "./actions";

interface OrgProp {
  id?: number;
  slug?: string;
  domain?: string;
  type?: string;
  status?: string;
}

export default function CompanyProfileForm({ 
  org, 
  userId, 
  tier, 
  email 
}: { 
  org: OrgProp | null;
  userId: string;
  tier: string;
  email: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Initialize form data (handle cases where there is no associated org)
  const [formData, setFormData] = useState({
    slug: org?.slug || "",
    domain: org?.domain || "",
    type: org?.type || "INDUSTRY",
    status: org?.status || "APPROVED",
  });

  const handleSave = async () => {
    if (!org?.id) return alert("No organisation linked to this user.");
    setLoading(true);
    try {
      await updateOrganisation(org.id, userId, formData);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save organisation details.");
    }
    setLoading(false);
  };

  return (
    <Card sx={{ p: 4, borderRadius: 2, boxShadow: "none", border: "1px solid #e7e9ee", position: "relative" }}>
      {/* Title and top-right EDIT button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Company Information</Typography>
        {!isEditing && (
          <Button variant="outlined" size="small" onClick={() => setIsEditing(true)}>
            EDIT
          </Button>
        )}
      </Box>

      <Stack spacing={3}>
        {/* Slug (Company Name) */}
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>Company Name (Slug)</Typography>
          {isEditing ? (
            <TextField fullWidth size="small" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} disabled={loading} />
          ) : (
            <Typography>{org?.slug || "Not provided"}</Typography>
          )}
        </Box>

        {/* Domain */}
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>Domain</Typography>
          {isEditing ? (
            <TextField fullWidth size="small" value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} disabled={loading} />
          ) : (
            <Typography>{org?.domain || "Not provided"}</Typography>
          )}
        </Box>

        {/* Mixed layout: Two columns side-by-side */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
          {/* Org Type */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>Organisation Type</Typography>
            {isEditing ? (
              <Select fullWidth size="small" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} disabled={loading}>
                <MenuItem value="INDUSTRY">INDUSTRY</MenuItem>
                <MenuItem value="UNIVERSITY">UNIVERSITY</MenuItem>
                <MenuItem value="OTHER">OTHER</MenuItem>
              </Select>
            ) : (
              <Typography>{org?.type || "INDUSTRY"}</Typography>
            )}
          </Box>

          {/* Status */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>Approval Status</Typography>
            {isEditing ? (
              <Select fullWidth size="small" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} disabled={loading}>
                <MenuItem value="APPROVED">APPROVED</MenuItem>
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
                <MenuItem value="BANNED">BANNED</MenuItem>
              </Select>
            ) : (
              <Typography>{org?.status || "PENDING"}</Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Read-only Information (Email & Tier) */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>Primary Email</Typography>
            <Typography color="text.disabled">{email} (Non-editable here)</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>Membership Tier</Typography>
            <Typography color="text.disabled">{tier} (Non-editable here)</Typography>
          </Box>
        </Box>
      </Stack>

      {/* Bottom button area (only shown in edit mode) */}
      {isEditing && (
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button variant="outlined" color="inherit" onClick={() => setIsEditing(false)} disabled={loading}>CANCEL</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>SAVE</Button>
        </Stack>
      )}
    </Card>
  );
}