// src/components/talent-discovery/StudentPublicProfileView.tsx
// Shared read-only profile UI used by both the recruiter route
// (/talent-discovery/student-profile/[id]) and the admin route
// (/membership-dashboard/student-profile/[id]).
// Caller supplies the profile data and the back-navigation href.

import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import CodeIcon from "@mui/icons-material/Code";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkIcon from "@mui/icons-material/Link";
import type { getStudentPublicProfile } from "@/lib/services/student-services";

type Profile = NonNullable<Awaited<ReturnType<typeof getStudentPublicProfile>>>;

type Props = {
  profile: Profile;
  backHref: string;
  backLabel: string;
};

function formatDate(d: Date | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function DateRange({ start, end }: { start: Date | null | undefined; end: Date | null | undefined }) {
  const s = formatDate(start);
  const e = formatDate(end);
  if (!s && !e) return null;
  return (
    <Typography variant="caption" color="text.secondary">
      {s ?? "?"} — {e ?? "Present"}
    </Typography>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
      <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
    </Stack>
  );
}

function socialIcon(platform: string) {
  if (platform === "LINKEDIN") return <LinkedInIcon fontSize="small" />;
  if (platform === "GITHUB") return <GitHubIcon fontSize="small" />;
  return <LinkIcon fontSize="small" />;
}

export default function StudentPublicProfileView({ profile, backHref, backLabel }: Props) {
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initial = profile.firstName.charAt(0).toUpperCase();

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* Back */}
      <Link href={backHref} style={{ textDecoration: "none" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="text"
          size="small"
          sx={{ mb: 3, color: "text.secondary", fontWeight: 500 }}
        >
          {backLabel}
        </Button>
      </Link>

      {/* Profile header */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
        <Box sx={{ height: 6, bgcolor: "primary.main" }} />
        <Box sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems={{ xs: "flex-start", sm: "center" }}>
            <Avatar
              aria-label={`Profile picture for ${fullName}`}
              sx={{
                width: 72,
                height: 72,
                bgcolor: "primary.main",
                color: "#fff",
                fontSize: "1.75rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initial}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" fontWeight={700}>{fullName}</Typography>
              <Chip
                label="UCL CS Student"
                size="small"
                sx={{ mt: 0.75, bgcolor: "primary.lighter", color: "primary.main", fontWeight: 600, fontSize: "0.7rem" }}
              />
              {profile.bio && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: "60ch" }}>
                  {profile.bio}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Social links */}
          {profile.socialLinks.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
              {profile.socialLinks.map((link) => (
                <Button
                  key={link.id}
                  component="a"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  variant="outlined"
                  startIcon={socialIcon(link.platform)}
                  sx={{ borderRadius: 2, fontSize: "0.75rem", textTransform: "none" }}
                >
                  {link.platform.charAt(0) + link.platform.slice(1).toLowerCase()}
                </Button>
              ))}
            </Stack>
          )}
        </Box>
      </Paper>

      <Stack spacing={3}>
        {/* Education */}
        {profile.universities.length > 0 && (
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
            <SectionHeader icon={<SchoolOutlinedIcon />} title="Education" />
            <Stack spacing={2} divider={<Divider />}>
              {profile.universities.map((u) => (
                <Box key={u.id}>
                  <Typography variant="body1" fontWeight={700}>{u.degreeProgram}</Typography>
                  <Typography variant="body2" color="text.secondary">{u.universityName}</Typography>
                  <Typography variant="body2" color="text.secondary">{u.fieldOfStudy}</Typography>
                  {u.grade && (
                    <Typography variant="body2" color="text.secondary">Grade: {u.grade}</Typography>
                  )}
                  <DateRange start={u.startDate} end={u.endDate} />
                </Box>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Work experience */}
        {profile.workExperiences.length > 0 && (
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
            <SectionHeader icon={<WorkOutlineIcon />} title="Work Experience" />
            <Stack spacing={2.5} divider={<Divider />}>
              {profile.workExperiences.map((w) => (
                <Box key={w.id}>
                  <Typography variant="body1" fontWeight={700}>{w.title}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>{w.company}</Typography>
                  <DateRange start={w.startDate} end={w.endDate} />
                  {w.description && (
                    <Typography variant="body2" sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}>
                      {w.description}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Skills + achievements */}
        {(profile.skills.length > 0 || profile.achievements.length > 0) && (
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
            <SectionHeader icon={<CodeIcon />} title="Skills & Achievements" />
            {profile.skills.length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Technical Skills
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1, mb: profile.achievements.length > 0 ? 2 : 0 }}>
                  {profile.skills.map((s) => (
                    <Chip key={s.id} label={s.name} size="small" variant="outlined" />
                  ))}
                </Stack>
              </>
            )}
            {profile.achievements.length > 0 && (
              <>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                  <EmojiEventsOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Achievements
                  </Typography>
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {profile.achievements.map((a) => (
                    <Chip
                      key={a.id}
                      label={a.name}
                      size="small"
                      sx={{ bgcolor: "#fff8e1", color: "#e65100" }}
                    />
                  ))}
                </Stack>
              </>
            )}
          </Paper>
        )}

        {/* Projects */}
        {profile.projects.length > 0 && (
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
            <SectionHeader icon={<FolderOutlinedIcon />} title="Projects" />
            <Stack spacing={2.5} divider={<Divider />}>
              {profile.projects.map((p) => (
                <Box key={p.id}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="body1" fontWeight={700}>{p.title}</Typography>
                    {p.projectLink && (
                      <Button
                        component="a"
                        href={p.projectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        variant="text"
                        startIcon={<LinkIcon fontSize="small" />}
                        sx={{ fontSize: "0.75rem", p: 0, minWidth: 0, textTransform: "none" }}
                      >
                        View
                      </Button>
                    )}
                  </Stack>
                  <DateRange start={p.startDate} end={p.endDate} />
                  {p.description && (
                    <Typography variant="body2" sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}>
                      {p.description}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Empty state */}
        {profile.universities.length === 0 &&
          profile.workExperiences.length === 0 &&
          profile.skills.length === 0 &&
          profile.projects.length === 0 && (
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
              <Typography color="text.secondary" variant="body2">
                This student hasn&apos;t filled in their profile yet.
              </Typography>
            </Paper>
          )}
      </Stack>
    </Box>
  );
}
