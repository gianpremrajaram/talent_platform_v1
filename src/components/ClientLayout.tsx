// src/components/ClientLayout.tsx
"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import MuiThemeProvider from "@/components/MuiThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFullWidth = pathname?.startsWith("/membership-dashboard");

  return (
    <SessionProvider>
      <MuiThemeProvider>
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <Header />

        <main
          id="main"
          className={isFullWidth ? "site-main site-main--full" : "site-main"}
          role="main"
        >
          {children}
        </main>

        <Footer />
      </MuiThemeProvider>
    </SessionProvider>
  );
}
