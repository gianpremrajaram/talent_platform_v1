"use client";
// src/components/talent-discovery/student-components/ApplyJobModal.tsx
// Modal for a student to apply to a job posting.
// Shows job info, optional CV selector from the student's library, and a cover letter.

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export type CV = {
  id: string;
  label: string;
  fileUrl: string;
};

type Job = {
  id: string;
  title: string;
  companyName: string;
  roleType: string;
  location: string;
  salaryBand: string;
};

type Props = {
  open: boolean;
  job: Job | null;
  cvs: CV[];
  onClose: () => void;
  onApplied: (jobId: string) => void;
};

export default function ApplyJobModal({ open, job, cvs, onClose, onApplied }: Props) {
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleClose() {
    if (submitting) return;
    setSelectedCvId("");
    setCoverLetter("");
    setError(null);
    setSuccess(false);
    onClose();
  }

  async function handleSubmit() {
    if (!job) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${job.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvId: selectedCvId || undefined,
          coverLetter: coverLetter.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message ?? "Failed to submit application.");
        return;
      }

      setSuccess(true);
      onApplied(job.id);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!job) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth aria-labelledby="apply-dialog-title">
      <DialogTitle id="apply-dialog-title" sx={{ pb: 1 }}>
        Apply for Position
      </DialogTitle>

      <DialogContent>
        {/* Job summary */}
        <Box
          sx={{
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            {job.title}
          </Typography>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BusinessOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} aria-hidden="true" />
              <Typography variant="body2" color="text.secondary">{job.companyName}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOnOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} aria-hidden="true" />
              <Typography variant="body2" color="text.secondary">{job.location}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <WorkOutlineOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} aria-hidden="true" />
              <Typography variant="body2" color="text.secondary">
                {job.roleType}{job.salaryBand && job.salaryBand !== "—" ? ` · ${job.salaryBand}` : ""}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {success ? (
          <Stack alignItems="center" spacing={1.5} py={2}>
            <CheckCircleOutlineIcon sx={{ fontSize: 48, color: "success.main" }} aria-hidden="true" />
            <Typography variant="subtitle1" fontWeight={600}>Application submitted!</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Your application has been sent to {job.companyName}. Good luck!
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            {/* CV selector */}
            <FormControl fullWidth size="small">
              <InputLabel id="cv-select-label">Attach a CV (optional)</InputLabel>
              <Select
                labelId="cv-select-label"
                value={selectedCvId}
                label="Attach a CV (optional)"
                onChange={(e) => setSelectedCvId(e.target.value)}
              >
                <MenuItem value="">
                  <em>No CV — apply without one</em>
                </MenuItem>
                {cvs.map((cv) => (
                  <MenuItem key={cv.id} value={cv.id}>
                    {cv.label}
                  </MenuItem>
                ))}
              </Select>
              {cvs.length === 0 && (
                <FormHelperText>
                  No CVs uploaded yet. You can add one in your CV Library.
                </FormHelperText>
              )}
            </FormControl>

            <Divider />

            {/* Cover letter */}
            <TextField
              label="Cover letter (optional)"
              multiline
              rows={5}
              fullWidth
              size="small"
              placeholder="Tell the recruiter why you're a great fit for this role…"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              inputProps={{ maxLength: 2000 }}
              helperText={`${coverLetter.length}/2000`}
            />

            {error && (
              <Typography variant="body2" color="error.main" role="alert">
                {error}
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {success ? (
          <Button onClick={handleClose} variant="contained" disableElevation>
            Done
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disableElevation
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
