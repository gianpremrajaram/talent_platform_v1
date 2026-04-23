// src/components/membership-dashboard/HandbookPanel.tsx
import Link from "next/link";
import { renderHandbookChapterBySlug } from "@/lib/handbook";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

export default async function HandbookPanel(props: { chapterSlug?: string | null }) {
  const slug = props.chapterSlug ?? "toc";
  const { chapters, active, html, prev, next } = await renderHandbookChapterBySlug(slug);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "240px 1fr" },
        gap: 3,
        alignItems: "start",
      }}
    >
      {/* Table of contents sidebar */}
      <Paper
        variant="outlined"
        component="nav"
        aria-label="Handbook table of contents"
        sx={{ borderRadius: 2, overflow: "hidden" }}
      >
        <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>
            Contents
          </Typography>
        </Box>

        <List disablePadding dense>
          {chapters.map((c, i) => {
            const isActive = c.slug === active.slug;
            return (
              <ListItem key={c.slug} disablePadding divider={i < chapters.length - 1}>
                {isActive ? (
                  <ListItemButton
                    selected
                    aria-current="page"
                    disableRipple
                    sx={{ cursor: "default", "&:hover": { bgcolor: "primary.lighter" } }}
                  >
                    <ListItemText
                      primary={c.title}
                      primaryTypographyProps={{ variant: "body2", fontWeight: 700, color: "primary.main" }}
                    />
                  </ListItemButton>
                ) : (
                  <ListItemButton
                    component={Link}
                    href={`/membership-dashboard?chapter=${encodeURIComponent(c.slug)}&tab=handbook`}
                  >
                    <ListItemText
                      primary={c.title}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItemButton>
                )}
              </ListItem>
            );
          })}
        </List>
      </Paper>

      {/* Chapter content */}
      <Box>
        {/* Pager */}
        <Box
          component="nav"
          aria-label="Handbook navigation"
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
            mb: 3,
          }}
        >
          {prev ? (
            <Button
              component={Link}
              href={`/membership-dashboard?chapter=${encodeURIComponent(prev.slug)}&tab=handbook`}
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
            >
              Previous
            </Button>
          ) : (
            <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} disabled>
              Previous
            </Button>
          )}

          <Button
            component={Link}
            href={`/membership-dashboard?chapter=${encodeURIComponent(chapters[0]?.slug ?? "toc")}&tab=handbook`}
            variant="outlined"
            size="small"
            startIcon={<FormatListBulletedIcon />}
          >
            Contents
          </Button>

          {next ? (
            <Button
              component={Link}
              href={`/membership-dashboard?chapter=${encodeURIComponent(next.slug)}&tab=handbook`}
              variant="outlined"
              size="small"
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          ) : (
            <Button variant="outlined" size="small" endIcon={<ArrowForwardIcon />} disabled>
              Next
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Rendered markdown — .handbook-prose scopes heading sizes away from public-site globals */}
        <Box
          component="article"
          className="handbook-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Box>
    </Box>
  );
}
