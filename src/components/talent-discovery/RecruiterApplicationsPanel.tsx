"use client";
// src/components/talent-discovery/RecruiterApplicationsPanel.tsx
// Recruiter view of all applications across their firm's job postings.
// Each job is shown as a collapsible card listing every applicant with
// their name, applied date, attached CV link, and cover letter preview.

import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import type { JobApplicationsForJob, JobApplicationResult } from "@/types/index";

export default function RecruiterApplicationsPanel() {
  const [groups, setGroups] = useState<JobApplicationsForJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/recruiter/applications");
        const data = await res.json();
        if (!data.success) {
          setError(data.error?.message ?? "Failed to load applications.");
          return;
        }
        setGroups(data.data);
      } catch {
        setError("Something went wrong loading applications.");
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  if (loading) return <LoadingState message="Loading applications…" />;

  if (error) {
    return (
      <Box sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 3, bgcolor: "background.paper" }}>
        <Typography role="alert" sx={{ fontSize: 13, color: "error.main" }}>{error}</Typography>
      </Box>
    );
  }

  const totalApplications = groups.reduce((sum, g) => sum + g.applications.length, 0);
  const jobsWithApplicants = groups.filter((g) => g.applications.length > 0);

  if (groups.length === 0) {
    return (
      <EmptyState
        message="No job postings yet."
        description="Post a job first — applicants will appear here once students start applying."
      />
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
        <Typography sx={{ fontSize: 14, color: "#4b5563" }}>
          {totalApplications === 0
            ? "No applications received yet."
            : `${totalApplications} application${totalApplications !== 1 ? "s" : ""} across ${jobsWithApplicants.length} job${jobsWithApplicants.length !== 1 ? "s" : ""}.`}
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        {groups.map((group) => (
          <JobApplicationGroup key={group.jobId} group={group} />
        ))}
      </Stack>
    </Box>
  );
}

// ─── Job group card ───────────────────────────────────────────────────────────

function JobApplicationGroup({ group }: { group: JobApplicationsForJob }) {
  const [expanded, setExpanded] = useState(group.applications.length > 0);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      {/* Job header row — full row is a button for keyboard/screen-reader access */}
      <Box
        component="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={`job-applicants-${group.jobId}`}
        aria-label={`${expanded ? "Collapse" : "Expand"} applicants for ${group.jobTitle}`}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          px: 2,
          py: 1.5,
          cursor: "pointer",
          background: "none",
          border: "none",
          textAlign: "left",
          "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: -2 },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar
            aria-hidden="true"
            sx={{ width: 34, height: 34, fontSize: 14, bgcolor: "primary.light", flexShrink: 0 }}
          >
            {group.jobTitle.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {group.jobTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {group.organisationName}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
          <Chip
            label={`${group.applications.length} applicant${group.applications.length !== 1 ? "s" : ""}`}
            size="small"
            color={group.applications.length > 0 ? "primary" : "default"}
            sx={{ fontWeight: 600, fontSize: 11 }}
            aria-hidden="true"
          />
          {expanded
            ? <ExpandLessIcon fontSize="small" aria-hidden="true" />
            : <ExpandMoreIcon fontSize="small" aria-hidden="true" />}
        </Stack>
      </Box>

      {/* Applicant list */}
      <Collapse in={expanded} id={`job-applicants-${group.jobId}`}>
        {group.applications.length === 0 ? (
          <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              No applications yet for this posting.
            </Typography>
          </Box>
        ) : (
          <>
            <Divider />
            <Stack divider={<Divider />}>
              {group.applications.map((app) => (
                <ApplicantRow key={app.id} application={app} />
              ))}
            </Stack>
          </>
        )}
      </Collapse>
    </Box>
  );
}

// ─── Individual applicant row ─────────────────────────────────────────────────

function ApplicantRow({ application }: { application: JobApplicationResult }) {
  const [coverOpen, setCoverOpen] = useState(false);

  const appliedDate = new Date(application.appliedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={1}>
        {/* Student info */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar aria-hidden="true" sx={{ width: 36, height: 36, fontSize: 14, bgcolor: "grey.200", color: "text.primary" }}>
            {application.student.firstName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700}>
              {application.student.firstName} {application.student.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {application.student.email}
            </Typography>
          </Box>
        </Stack>

        {/* Meta + actions */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} aria-hidden="true" />
            <Typography variant="caption" color="text.secondary">
              Applied {appliedDate}
            </Typography>
          </Stack>

          <Button
            component={Link}
            href={`/talent-discovery/student-profile/${application.studentId}`}
            size="small"
            variant="outlined"
            startIcon={<PersonOutlineIcon fontSize="small" aria-hidden="true" />}
            aria-label={`View profile for ${application.student.firstName} ${application.student.lastName}`}
            sx={{ fontSize: 11, borderRadius: 1.5, height: 28 }}
          >
            View Profile
          </Button>

          {application.cv ? (
            <Tooltip title={`Download CV: ${application.cv.label}`}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DescriptionOutlinedIcon fontSize="small" aria-hidden="true" />}
                href={application.cv.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Download CV: ${application.cv.label} for ${application.student.firstName} ${application.student.lastName}`}
                sx={{ fontSize: 11, borderRadius: 1.5, height: 28 }}
              >
                {application.cv.label}
              </Button>
            </Tooltip>
          ) : (
            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
              No CV attached
            </Typography>
          )}

          {application.coverLetter && (
            <Button
              size="small"
              variant="text"
              onClick={() => setCoverOpen((v) => !v)}
              aria-expanded={coverOpen}
              aria-label={`${coverOpen ? "Hide" : "View"} cover letter for ${application.student.firstName} ${application.student.lastName}`}
              sx={{ fontSize: 11, borderRadius: 1.5, height: 28 }}
            >
              {coverOpen ? "Hide letter" : "View letter"}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Cover letter expand */}
      <Collapse in={coverOpen}>
        {application.coverLetter && (
          <Box
            sx={{
              mt: 1.5,
              ml: 6,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              p: 1.5,
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", fontSize: 13 }}>
              {application.coverLetter}
            </Typography>
          </Box>
        )}
      </Collapse>
    </Box>
  );
}
