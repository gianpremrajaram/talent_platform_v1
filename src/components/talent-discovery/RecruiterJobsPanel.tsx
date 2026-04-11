"use client";
// src/components/talent-discovery/RecruiterJobsPanel.tsx
// Recruiter's own firm job management panel — Issue #28.
// Displayed in the "Job Board" tab of PartnerFullView (Gold+).
// Lists the firm's own postings with create, edit, deactivate/reactivate, and delete.

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import RecruiterJobPostForm from "./RecruiterJobPostForm";
import type { JobPostingResult } from "@/types/index";

export default function RecruiterJobsPanel() {
  const [jobs, setJobs] = useState<JobPostingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPostingResult | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recruiter/jobs");
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message ?? "Failed to load job postings.");
        return;
      }
      setJobs(data.data);
    } catch {
      setError("Something went wrong loading your postings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  function handleSaved(job: JobPostingResult) {
    setError(null);
    setJobs((prev) => {
      const idx = prev.findIndex((j) => j.id === job.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = job;
        return next;
      }
      return [job, ...prev];
    });
  }

  async function handleToggleActive(job: JobPostingResult) {
    setError(null);
    // Guard: expired jobs cannot be reactivated from the toggle — the user must
    // extend the expiry date first. Skip the network call entirely.
    if (
      !job.isActive &&
      job.expiresAt !== null &&
      new Date(job.expiresAt) <= new Date()
    ) {
      setError("This job posting has expired. Please extend the expiry date to reactivate it.");
      return;
    }

    try {
      const res = await fetch(`/api/recruiter/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !job.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        handleSaved(data.data);
      } else {
        setError(data.error?.message ?? "Failed to update job visibility.");
      }
    } catch {
      setError("Something went wrong updating job visibility.");
    }
  }

  async function handleDelete(jobId: string) {
    if (!confirm("Permanently delete this job posting?")) return;
    setError(null);
    const res = await fetch(`/api/recruiter/jobs/${jobId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) setJobs((prev) => prev.filter((j) => j.id !== jobId));
  }

  if (loading) return <LoadingState message="Loading your job postings…" />;

  return (
    <ErrorBoundary>
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography sx={{ fontSize: 14, color: "#6b7280" }}>
            Postings are visible to UCL CS students on the job board.
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => { setError(null); setEditingJob(null); setFormOpen(true); }}
            sx={{ whiteSpace: "nowrap", boxShadow: "none" }}
          >
            + Post a job
          </Button>
        </Stack>

        {/* Always-present live region so screen readers announce errors when they appear */}
        <Box role="alert" aria-live="assertive" aria-atomic="true">
          {error && (
            <Typography sx={{ fontSize: 13, color: "error.main", mb: 2 }}>
              {error}
            </Typography>
          )}
        </Box>

        {!error && jobs.length === 0 && (
          <EmptyState
            message="No job postings yet."
            description="Post your first opportunity to make it visible to UCL students."
            actionLabel="Post a job"
            onAction={() => { setError(null); setEditingJob(null); setFormOpen(true); }}
          />
        )}

        {jobs.map((job) => (
          <JobPostingCard
            key={job.id}
            job={job}
            onEdit={() => { setError(null); setEditingJob(job); setFormOpen(true); }}
            onToggleActive={() => handleToggleActive(job)}
            onDelete={() => handleDelete(job.id)}
          />
        ))}
      </Box>

      <RecruiterJobPostForm
        open={formOpen}
        editJob={editingJob}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />
    </ErrorBoundary>
  );
}

// ─── Job posting card ─────────────────────────────────────────────────────────

function JobPostingCard({
  job,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  job: JobPostingResult;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const postedDate = new Date(job.postedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: job.isActive ? "divider" : "#f3f4f6",
        borderRadius: 2,
        p: 2,
        mb: 1.5,
        bgcolor: job.isActive ? "background.paper" : "#fafafa",
        opacity: job.isActive ? 1 : 0.65,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={1}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
              {job.title}
            </Typography>
            <Chip label={job.roleType} size="small" sx={{ fontSize: 11, height: 20 }} />
            {!job.isActive && (
              <Chip
                label="Inactive"
                size="small"
                color="default"
                sx={{ fontSize: 11, height: 20 }}
              />
            )}
          </Stack>
          <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.5 }}>
            {job.location}
            {job.salaryBand ? ` · ${job.salaryBand}` : ""}
            {` · Posted ${postedDate}`}
            {job.expiresAt
              ? ` · Expires ${new Date(job.expiresAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}`
              : ""}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={onEdit} aria-label="Edit job posting">
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={job.isActive ? "Deactivate" : "Reactivate"}>
            <IconButton
              size="small"
              onClick={onToggleActive}
              aria-label={job.isActive ? "Deactivate job posting" : "Reactivate job posting"}
            >
              {job.isActive ? (
                <VisibilityOffOutlinedIcon fontSize="small" />
              ) : (
                <VisibilityOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete permanently">
            <IconButton
              size="small"
              onClick={onDelete}
              aria-label="Delete job posting"
              sx={{ color: "error.main" }}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}
