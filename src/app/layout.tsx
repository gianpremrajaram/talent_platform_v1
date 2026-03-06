// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

export const metadata: Metadata = {
  title: "Alliances Platform - UCL Computer Science",
  description:
    "A self-service application intended for use by industry partners, academic staff, and students; maintained by the Strategic Alliances Team at UCL Computer Science.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ key: "mui" }}>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
