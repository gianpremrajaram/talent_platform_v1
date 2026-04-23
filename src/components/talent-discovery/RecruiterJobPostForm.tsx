"use client";
// src/components/talent-discovery/RecruiterJobPostForm.tsx
// MUI Dialog form for creating or editing a job posting — Issue #28.
// Used by RecruiterJobsPanel for both create and edit flows.

import { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { jobPostingSchema, updateJobPostingSchema } from "@/lib/validation/JobPosting";
import type { JobPostingResult } from "@/types/index";

type Props = {
  open: boolean;
  /** When provided the form is in edit mode; otherwise create mode. */
  editJob?: JobPostingResult | null;
  onClose: () => void;
  onSaved: (job: JobPostingResult) => void;
};

const EMPTY_FORM = {
  title: "",
  description: "",
  location: "",
  salaryBand: "",
  roleType: "",
  expiresAt: "",
};

export default function RecruiterJobPostForm({ open, editJob, onClose, onSaved }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEdit = !!editJob;

  // Populate form when dialog opens
  useEffect(() => {
    if (!open) return;
    if (editJob) {
      setForm({
        title: editJob.title,
        description: editJob.description,
        location: editJob.location,
        salaryBand: editJob.salaryBand ?? "",
        roleType: editJob.roleType,
        expiresAt: editJob.expiresAt ? editJob.expiresAt.slice(0, 10) : "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
    setFieldErrors({});
  }, [open, editJob]);

  function handleChange(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // In edit mode we send expiresAt: null to explicitly clear the date.
    // In create mode we omit the field entirely — absence means evergreen.
    const payload = isEdit
      ? {
          title: form.title,
          description: form.description,
          location: form.location,
          roleType: form.roleType,
          ...(form.salaryBand ? { salaryBand: form.salaryBand } : {}),
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }
      : {
          title: form.title,
          description: form.description,
          location: form.location,
          roleType: form.roleType,
          ...(form.salaryBand ? { salaryBand: form.salaryBand } : {}),
          ...(form.expiresAt ? { expiresAt: new Date(form.expiresAt).toISOString() } : {}),
        };

    // Client-side validation before hitting the network.
    // Edit mode uses the update schema which accepts null for expiresAt.
    const schema = isEdit ? updateJobPostingSchema : jobPostingSchema;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "");
        if (field) errs[field] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/recruiter/jobs/${editJob!.id}` : "/api/recruiter/jobs";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message ?? "Failed to save job posting.");
        return;
      }

      onSaved(data.data);
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit job posting" : "Post a new job"}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {error && (
              <Typography role="alert" sx={{ fontSize: 13, color: "error.main" }}>
                {error}
              </Typography>
            )}

            <TextField
              label="Job title"
              required
              fullWidth
              size="small"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              error={!!fieldErrors.title}
              helperText={fieldErrors.title}
              inputProps={{ "aria-label": "Job title" }}
            />

            <TextField
              label="Role type"
              placeholder="e.g. Full-time, Internship, Graduate"
              required
              fullWidth
              size="small"
              value={form.roleType}
              onChange={(e) => handleChange("roleType", e.target.value)}
              error={!!fieldErrors.roleType}
              helperText={fieldErrors.roleType}
              inputProps={{ "aria-label": "Role type" }}
            />

            <TextField
              label="Location"
              required
              fullWidth
              size="small"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              error={!!fieldErrors.location}
              helperText={fieldErrors.location}
              inputProps={{ "aria-label": "Location" }}
            />

            <TextField
              label="Salary band (optional)"
              placeholder="e.g. £30,000 – £40,000"
              fullWidth
              size="small"
              value={form.salaryBand}
              onChange={(e) => handleChange("salaryBand", e.target.value)}
              error={!!fieldErrors.salaryBand}
              helperText={fieldErrors.salaryBand}
              inputProps={{ "aria-label": "Salary band" }}
            />

            <TextField
              label="Description"
              required
              fullWidth
              multiline
              minRows={4}
              size="small"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              error={!!fieldErrors.description}
              helperText={fieldErrors.description ?? "Minimum 20 characters"}
              inputProps={{ "aria-label": "Job description" }}
            />

            <TextField
              label="Expires on (optional)"
              type="date"
              fullWidth
              size="small"
              value={form.expiresAt}
              onChange={(e) => handleChange("expiresAt", e.target.value)}
              error={!!fieldErrors.expiresAt}
              helperText={fieldErrors.expiresAt}
              InputLabelProps={{ shrink: true }}
              inputProps={{ "aria-label": "Expiry date" }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ boxShadow: "none" }}
          >
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Post job"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
