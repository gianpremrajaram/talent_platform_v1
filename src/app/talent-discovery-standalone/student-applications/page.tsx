import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import StudentPortalShell from "@/components/talent-discovery/student-components/StudentPortalShell";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { redirect } from "next/navigation";
import { getStudentApplications } from "@/lib/services/applications";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Link from "next/link";
import CoverLetterPreview from "@/components/talent-discovery/student-components/CoverLetterPreview";

export default async function StudentApplicationsPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser?.id) redirect("/sign-in");

  const applications = await getStudentApplications(sessionUser.id);

  return (
    <StudentPortalShell
      title="My Applications"
      userInitial={sessionUser.name?.charAt(0).toUpperCase() ?? ""}
    >
      <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h5" fontWeight={700}>
              My Applications
            </Typography>
            <Chip
              label={`${applications.length} total`}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          {applications.length === 0 ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                p: 6,
                textAlign: "center",
                bgcolor: "background.paper",
              }}
            >
              <WorkOutlineOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                No applications yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Head to your{" "}
                <Link
                  href="/talent-discovery-standalone/student-dashboard"
                  style={{ color: "inherit", fontWeight: 600 }}
                >
                  dashboard
                </Link>{" "}
                to browse open positions and apply.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {applications.map((app) => (
                <Box
                  key={app.id}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    p: 2.5,
                    bgcolor: "background.paper",
                  }}
                >
                  {/* Header row */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {app.job.title}
                      </Typography>
                      <Stack direction="row" spacing={2} mt={0.5} flexWrap="wrap">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <BusinessOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            {app.job.organisation.name}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            Applied{" "}
                            {new Date(app.appliedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                    <Chip
                      label="Submitted"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: 11 }}
                    />
                  </Stack>

                  {/* CV attached */}
                  {app.cv && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <DescriptionOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          CV attached:{" "}
                          <a
                            href={app.cv.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontWeight: 600, color: "inherit" }}
                          >
                            {app.cv.label}
                          </a>
                        </Typography>
                      </Stack>
                    </>
                  )}

                  {/* Cover letter */}
                  {app.coverLetter && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>
                        Cover letter
                      </Typography>
                      <CoverLetterPreview text={app.coverLetter} />
                    </>
                  )}
                </Box>
              ))}
            </Stack>
          )}
      </Box>
    </StudentPortalShell>
  );
}
