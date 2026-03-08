import {
  Box,
  Card,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

const groups = [
  {
    title: "Dashboard",
    items: [{ label: "Dashboard", icon: <DashboardRoundedIcon fontSize="small" />, active: false }],
  },
  {
    title: "Manage",
    items: [
      { label: "Partners", icon: <HandshakeRoundedIcon fontSize="small" />, active: true },
      { label: "Students", icon: <SchoolRoundedIcon fontSize="small" />, active: false },
    ],
  },
  {
    title: "Widgets",
    items: [{ label: "Statistics", icon: <BarChartRoundedIcon fontSize="small" />, active: false }],
  },
  {
    title: "Application",
    items: [
      { label: "Mail", icon: <MailOutlineRoundedIcon fontSize="small" />, active: false },
      { label: "Calendar", icon: <CalendarMonthRoundedIcon fontSize="small" />, active: false },
    ],
  },
];

export default function AdminSidebar() {
  return (
    <Card
      sx={{
        borderRadius: "10px",
        border: "1px solid #e5e7eb",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #eef0f3" }}>
        <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>Dashboard</Typography>
      </Box>

      <Box sx={{ py: 1 }}>
        {groups.map((group) => (
          <Box key={group.title} sx={{ mb: 1.2 }}>
            <Typography
              sx={{
                px: 2,
                pt: 1,
                pb: 0.5,
                fontSize: 11,
                color: "#9ca3af",
              }}
            >
              {group.title}
            </Typography>

            <List sx={{ px: 1, py: 0 }}>
              {group.items.map((item) => (
                <ListItemButton
                  key={item.label}
                  selected={item.active}
                  sx={{
                    minHeight: 38,
                    borderRadius: "8px",
                    px: 1.25,
                    "&.Mui-selected": {
                      backgroundColor: "#eaf3ff",
                      color: "#0b63d7",
                      borderRight: "2px solid #0b63d7",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "#eaf3ff",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 28,
                      color: item.active ? "#0b63d7" : "#6b7280",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: item.active ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          mt: 2,
          px: 2,
          py: 1.5,
          borderTop: "1px solid #eef0f3",
          display: "flex",
          alignItems: "center",
          gap: 1.2,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            backgroundColor: "#f4c26b",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 13,
            color: "#fff",
          }}
        >
          S
        </Box>

        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
            Stein Ben
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
            Administrator
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}