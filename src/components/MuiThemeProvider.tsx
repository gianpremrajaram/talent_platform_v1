// src/components/MuiThemeProvider.tsx
"use client";

import { ReactNode } from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    text: {
      primary: "#141414",
      secondary: "#4b5563",
      disabled: "rgba(0,0,0,0.38)",
    },
  },
});

type Props = {
  children: ReactNode;
};

export default function MuiThemeProvider({ children }: Props) {
  return (
    <ThemeProvider theme={theme}>
      {/* Inject global MUI baseline styles */}
      <CssBaseline />

      {/* Your own layout wrapper */}
      <div className="page-wrapper">
        {children}
      </div>
    </ThemeProvider>
  );
}
