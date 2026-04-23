"use client";
// src/components/talent-discovery/student-components/JobDetailApplySection.tsx
// Apply button + modal for the job detail page.

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
          bgcolor: "#ffffff",
          border: "1px solid",
          borderColor: "#bbf7d0",
          borderRadius: 2,
        }}
      >
        <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20 }} />
        <Typography variant="body2" fontWeight={600} color="text.primary">
          You&apos;ve already applied for this role
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
