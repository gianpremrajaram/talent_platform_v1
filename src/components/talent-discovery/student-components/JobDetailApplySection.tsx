"use client";
// src/components/talent-discovery/student-components/JobDetailApplySection.tsx
// Apply button + modal for the job detail page.

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ApplyJobModal, { type CV } from "./ApplyJobModal";

type Props = {
  job: {
    id: string;
    title: string;
    companyName: string;
    roleType: string;
    location: string;
    salaryBand: string;
  };
  cvs: CV[];
  alreadyApplied: boolean;
};

export default function JobDetailApplySection({ job, cvs, alreadyApplied }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [applied, setApplied] = useState(alreadyApplied);

  if (applied) {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: 2.5,
          py: 1.25,
          bgcolor: "success.lighter",
          border: "1px solid",
          borderColor: "success.light",
          borderRadius: 2,
        }}
      >
        <CheckCircleOutlineIcon sx={{ color: "success.main", fontSize: 20 }} />
        <Typography variant="body2" fontWeight={600} color="success.dark">
          You've already applied for this role
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Button
        variant="contained"
        size="large"
        disableElevation
        onClick={() => setModalOpen(true)}
        sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
      >
        Apply Now
      </Button>

      <ApplyJobModal
        open={modalOpen}
        job={job}
        cvs={cvs}
        onClose={() => setModalOpen(false)}
        onApplied={() => setApplied(true)}
      />
    </>
  );
}
