// src/app/talent-discovery-standalone/student-job/[jobId]/page.tsx
// Full job detail page for students — shows JD, company info, and apply button.
"use server";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { getJobById } from "@/lib/services/job-board";
import { getStudentCVs } from "@/lib/services/student-services";
import { getStudentApplications } from "@/lib/services/applications";

import StudentPortalShell from "@/components/talent-discovery/student-components/StudentPortalShell";
import JobDetailApplySection from "@/components/talent-discovery/student-components/JobDetailApplySection";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type Props = { params: Promise<{ jobId: string }> };

export default async function StudentJobDetailPage({ params }: Props) {
  const { jobId } = await params;

  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser?.id) redirect("/sign-in");

  const [job, cvs, applications] = await Promise.all([
    getJobById(jobId),
    getStudentCVs(sessionUser.id),
    getStudentApplications(sessionUser.id),
  ]);

  if (!job || !job.isActive) notFound();

  const alreadyApplied = applications.some((a) => a.jobId === jobId);

  const cvProps = cvs.map((cv) => ({
    id: cv.id,
    label: cv.label,
    fileUrl: cv.fileUrl,
  }));

  const expiresText = job.expiresAt
    ? `Closes ${formatDate(job.expiresAt)}`
    : "No closing date set";

  return (
    <StudentPortalShell
      title="Job Details"
      userInitial={sessionUser.name?.charAt(0).toUpperCase() ?? ""}
    >
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        {/* Back link — fully server-compatible, keeps MUI button styling */}
        <Link
          href="/talent-discovery-standalone/student-dashboard"
          style={{ textDecoration: "none" }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            variant="text"
            size="small"
            sx={{ mb: 3, color: "text.secondary", fontWeight: 500 }}
          >
            Back to Job Board
          </Button>
        </Link>

        {/* Header card */}
        <Paper
          variant="outlined"
          sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}
        >
          <Box sx={{ height: 6, bgcolor: "primary.main" }} />

          <Box sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={2}
            >
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {job.title}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                  <BusinessOutlinedIcon
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    {job.organisation.name}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  flexWrap="wrap"
                  spacing={1}
                  useFlexGap
                  mt={1.5}
                >
                  <Chip
                    icon={<LocationOnOutlinedIcon sx={{ fontSize: 14 }} />}
                    label={job.location}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<WorkOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
                    label={job.roleType}
                    size="small"
                    variant="outlined"
                  />
                  {job.salaryBand && (
                    <Chip
                      icon={<AttachMoneyIcon sx={{ fontSize: 14 }} />}
                      label={job.salaryBand}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  <Chip
                    icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />}
                    label={`Posted ${formatDate(job.postedAt)}`}
                    size="small"
                    variant="outlined"
                    sx={{ color: "text.secondary" }}
                  />
                </Stack>
              </Box>

              {/* Apply button — client island */}
              <Box sx={{ flexShrink: 0, pt: { xs: 1, sm: 0 } }}>
                <JobDetailApplySection
                  job={{
                    id: job.id,
                    title: job.title,
                    companyName: job.organisation.name,
                    roleType: job.roleType,
                    location: job.location,
                    salaryBand: job.salaryBand ?? "—",
                  }}
                  cvs={cvProps}
                  alreadyApplied={alreadyApplied}
                />
              </Box>
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 2 }}
            >
              {expiresText}
            </Typography>
          </Box>
        </Paper>

        {/* Job description */}
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Job Description
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              "& p": {
                fontSize: "0.9375rem",
                lineHeight: 1.75,
                mb: 1.5,
                color: "text.primary",
              },
              "& ul, & ol": { pl: 3, mb: 1.5 },
              "& li": {
                fontSize: "0.9375rem",
                lineHeight: 1.7,
                mb: 0.5,
              },
              "& h1, & h2, & h3": {
                fontWeight: 700,
                mt: 2,
                mb: 1,
              },
              whiteSpace: "pre-wrap",
            }}
          >
            <Typography
              variant="body1"
              sx={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}
            >
              {job.description}
            </Typography>
          </Box>
        </Paper>

      </Box>
    </StudentPortalShell>
  );
}
