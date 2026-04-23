// src/components/MuiThemeProvider.tsx
// Mantis-inspired MUI theme — consistent design system for all roles.
// UCL blue as primary; extended palette for tier chips, sidebar active states.
"use client";

import { ReactNode } from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

// ─── Palette constants ────────────────────────────────────────────────────────

const UCL_BLUE = "#005bbb";
const UCL_BLUE_LIGHT = "#3378cc";
const UCL_BLUE_DARK = "#004490";
const UCL_AZURE = "#e9f2ff"; // sidebar selected bg / "lighter" shade

// ─── Theme ────────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    primary: {
      light: UCL_BLUE_LIGHT,
      main: UCL_BLUE,
      dark: UCL_BLUE_DARK,
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#3f51b5",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F5F7FA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1C2536",
      secondary: "#637381",
      disabled: "rgba(0,0,0,0.38)",
    },
    divider: "#E5E8EB",
    success: {
      light: "#57CA22",
      main: "#2E7D32",
      dark: "#1B5E20",
      contrastText: "#fff",
    },
    warning: {
      light: "#FFB547",
      main: "#ED6C02",
      dark: "#C77700",
      contrastText: "#fff",
    },
    error: {
      light: "#EF5350",
      main: "#D32F2F",
      dark: "#B71C1C",
      contrastText: "#fff",
    },
    info: {
      main: "#0288D1",
      contrastText: "#fff",
    },
  },

  // ─── Typography ─────────────────────────────────────────────────────────────
  typography: {
    fontFamily: '"Inter", "Public Sans", Arial, Helvetica, sans-serif',
    h1: { fontWeight: 700, fontSize: "2.25rem", lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: "1.875rem", lineHeight: 1.25 },
    h3: { fontWeight: 600, fontSize: "1.5rem", lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: "1.25rem", lineHeight: 1.35 },
    h5: { fontWeight: 600, fontSize: "1.125rem", lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: "1rem", lineHeight: 1.5 },
    subtitle1: { fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.57 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.57 },
    body1: { fontSize: "0.9375rem", lineHeight: 1.57 },
    body2: { fontSize: "0.875rem", lineHeight: 1.57 },
    caption: { fontSize: "0.8125rem", lineHeight: 1.5 },
    overline: {
      fontSize: "0.6875rem",
      fontWeight: 700,
      letterSpacing: "1px",
      textTransform: "uppercase",
    },
    button: { fontWeight: 600, fontSize: "0.9375rem", textTransform: "none" },
  },

  // ─── Shape ──────────────────────────────────────────────────────────────────
  shape: {
    borderRadius: 8,
  },

  // ─── Component overrides ─────────────────────────────────────────────────────
  components: {
    // Button
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          "&:focus-visible": {
            outline: `2px solid ${UCL_BLUE}`,
            outlineOffset: 2,
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: `0 8px 16px rgba(0,91,187,0.24)`,
          },
        },
        outlined: {
          borderColor: "#CBD5E1",
          "&:hover": {
            borderColor: UCL_BLUE,
            backgroundColor: UCL_AZURE,
          },
        },
        sizeSmall: { fontSize: "0.8125rem", padding: "4px 10px" },
      },
    },

    // Icon button
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&:focus-visible": {
            outline: `2px solid ${UCL_BLUE}`,
            outlineOffset: 2,
          },
        },
      },
    },

    // Card
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow:
            "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
          backgroundImage: "none",
        },
      },
    },

    // Paper
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        elevation1: {
          boxShadow:
            "0 1px 4px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)",
        },
      },
    },

    // AppBar — used by DashboardTopBar
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderBottom: "1px solid #E5E8EB",
        },
        colorInherit: {
          backgroundColor: "#FFFFFF",
        },
      },
    },

    // Inputs
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#FAFAFA",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: UCL_BLUE,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: UCL_BLUE,
          },
        },
        notchedOutline: {
          borderColor: "#CBD5E1",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          "&.Mui-focused": { color: UCL_BLUE },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },

    // Select
    MuiSelect: {
      styleOverrides: {
        select: { borderRadius: 8 },
      },
    },

    // Chip
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: "0.8125rem",
        },
        colorPrimary: {
          backgroundColor: UCL_AZURE,
          color: UCL_BLUE,
        },
        colorSuccess: {
          backgroundColor: "#E8F5E9",
          color: "#2E7D32",
        },
        colorWarning: {
          backgroundColor: "#FFF3E0",
          color: "#E65100",
        },
        colorError: {
          backgroundColor: "#FEECEB",
          color: "#C62828",
        },
      },
    },

    // Sidebar list items
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&.Mui-selected": {
            backgroundColor: UCL_AZURE,
            color: UCL_BLUE,
            "& .MuiListItemIcon-root": {
              color: UCL_BLUE,
            },
            "&:hover": {
              backgroundColor: "#d4e8ff",
            },
          },
          "&:hover": {
            backgroundColor: "#F5F7FA",
          },
          "&:focus-visible": {
            outline: `2px solid ${UCL_BLUE}`,
            outlineOffset: 2,
          },
        },
      },
    },

    // Tabs — used in PartnerFullView
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #E5E8EB",
          minHeight: 48,
        },
        indicator: {
          height: 2,
          backgroundColor: UCL_BLUE,
          borderRadius: "2px 2px 0 0",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 400,
          fontSize: "0.9375rem",
          color: "#637381",
          minHeight: 48,
          padding: "8px 20px",
          "&.Mui-selected": {
            color: UCL_BLUE,
            fontWeight: 600,
          },
          "&:focus-visible": {
            outline: `2px solid ${UCL_BLUE}`,
            outlineOffset: -2,
            borderRadius: 4,
          },
        },
      },
    },

    // Dialog (modals)
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontWeight: 700, fontSize: "1.125rem" },
      },
    },

    // Tooltip
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: "0.8125rem",
          backgroundColor: "#1C2536",
          padding: "6px 12px",
        },
        arrow: { color: "#1C2536" },
      },
    },

    // Divider
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "#E5E8EB" },
      },
    },

    // Avatar
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: "0.9375rem",
        },
        colorDefault: {
          backgroundColor: UCL_AZURE,
          color: UCL_BLUE,
        },
      },
    },

    // Skeleton
    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },

    // Alert
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },

    // Table
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#F5F7FA",
            color: "#637381",
            fontWeight: 700,
            fontSize: "0.8125rem",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#F0F2F5",
          fontSize: "0.875rem",
        },
      },
    },
  },
});

// Ensure `primary.lighter` resolves to UCL azure across the theme.
// Components reference `bgcolor: "primary.lighter"` in inline sx props;
// MUI resolves these via the palette so we augment the token here.
(theme.palette.primary as unknown as Record<string, string>).lighter = UCL_AZURE;

// ─── Provider ─────────────────────────────────────────────────────────────────

type Props = { children: ReactNode };

export default function MuiThemeProvider({ children }: Props) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="page-wrapper">{children}</div>
    </ThemeProvider>
  );
}
