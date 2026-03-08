import {
  Avatar,
  Box,
  Button,
  Card,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AdminSidebar from "./AdminSidebar";
import AdminStatsCards from "./AdminStatsCards";
import PartnersTable from "./PartnersTable";

export default function AdminPartnersPage() {
  return (
    <Box
      sx={{
        py: 2,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "230px minmax(0, 1fr)",
          gap: 3,
          alignItems: "start",
        }}
      >
        <AdminSidebar />

        <Box>
          <Box
            sx={{
              backgroundColor: "#fff",
              border: "1px solid #e6e8ec",
              borderRadius: "10px",
              px: 2,
              py: 1.25,
              mb: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <IconButton size="small">
                <GridViewRoundedIcon fontSize="small" />
              </IconButton>

              <Box
                sx={{
                  px: 1.2,
                  py: 0.5,
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#374151",
                  backgroundColor: "#fff",
                }}
              >
                Acme Corp
              </Box>

              <Box
                sx={{
                  px: 0.9,
                  py: 0.3,
                  borderRadius: "999px",
                  fontSize: "11px",
                  color: "#6b7280",
                  backgroundColor: "#f3f4f6",
                }}
              >
                Free
              </Box>

              <TextField
                size="small"
                placeholder="⌘ K"
                sx={{
                  width: 100,
                  "& .MuiOutlinedInput-root": {
                    height: 34,
                    fontSize: 13,
                    backgroundColor: "#fff",
                  },
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1.2} alignItems="center">
              <IconButton size="small">
                <GridViewRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small">
                <NotificationsNoneRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small">
                <SettingsRoundedIcon fontSize="small" />
              </IconButton>
              <Avatar sx={{ width: 34, height: 34, bgcolor: "#44a6ff" }}>A</Avatar>
            </Stack>
          </Box>

          <Typography
            sx={{
              fontSize: 12,
              color: "#8a8f98",
              mb: 0.75,
            }}
          >
            Home / Dashboard / Partners
          </Typography>

          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 600,
              color: "#1f2937",
              mb: 2.5,
            }}
          >
            Analytics
          </Typography>

          <Card
            sx={{
              borderRadius: "10px",
              overflow: "hidden",
              mb: 2.5,
              border: "1px solid #d8e7ff",
              boxShadow: "none",
              background:
                "linear-gradient(90deg, #0b63d7 0%, #2d8df5 55%, #8fd0ff 100%)",
            }}
          >
            <Box
              sx={{
                px: 4,
                py: 4,
                minHeight: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 3,
              }}
            >
              <Box sx={{ color: "#fff", maxWidth: 430 }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    opacity: 0.95,
                    mb: 1,
                  }}
                >
                  Welcome back Admin
                </Typography>

                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    mb: 1,
                  }}
                >
                  Here is the latest activity overview of the Alliances Platform
                </Typography>

                <Button
                  variant="outlined"
                  sx={{
                    mt: 2,
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.7)",
                    textTransform: "none",
                    fontSize: 12,
                    px: 2,
                    py: 0.75,
                    "&:hover": {
                      borderColor: "#fff",
                      backgroundColor: "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  Download Report
                </Button>
              </Box>

              <Box
                sx={{
                  flexShrink: 0,
                  width: 250,
                  height: 150,
                  borderRadius: "18px",
                  position: "relative",
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0.08))",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 25,
                    left: 45,
                    width: 150,
                    height: 90,
                    borderRadius: "18px",
                    background: "rgba(255,255,255,0.22)",
                    border: "2px solid rgba(255,255,255,0.55)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 48,
                    left: 70,
                    width: 100,
                    height: 44,
                    borderTop: "2px solid rgba(255,255,255,0.8)",
                    borderLeft: "2px solid rgba(255,255,255,0.8)",
                    borderRight: "2px solid rgba(255,255,255,0.8)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 48,
                    left: 118,
                    width: 2,
                    height: 44,
                    backgroundColor: "rgba(255,255,255,0.8)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 70,
                    left: 70,
                    width: 100,
                    height: 2,
                    backgroundColor: "rgba(255,255,255,0.8)",
                  }}
                />
              </Box>
            </Box>
          </Card>

          <AdminStatsCards />

          <Box sx={{ mt: 2.5 }}>
            <PartnersTable />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}