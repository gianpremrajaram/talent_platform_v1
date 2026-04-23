// src/components/ClientLayout.tsx
"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import MuiThemeProvider from "@/components/MuiThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Paths that use their own portal shell layout (AdminPortalShell / StudentPortalShell).
// On these paths we skip the global UCL website header and footer so all roles
// see the same kind of dashboard experience instead of a mix of website nav +
// portal sidebar.
const PORTAL_PREFIXES = [
  "/membership-dashboard",
  "/talent-discovery",
];

function isPortalPath(pathname: string | null) {
  if (!pathname) return false;
  return PORTAL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPortal = isPortalPath(pathname);

  return (
    <SessionProvider>
      <MuiThemeProvider>
        {isPortal ? (
          // Portal pages (membership-dashboard, talent-discovery) supply their
          // own full-page shell (AdminPortalShell) so we just pass children
          // through — SessionProvider + MuiThemeProvider are still provided.
          <>{children}</>
        ) : (
          // Public / marketing pages keep the UCL branded header + footer.
          <>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <Header />
            <main
              id="main"
              className={
                pathname?.startsWith("/membership-dashboard")
                  ? "site-main site-main--full"
                  : "site-main"
              }
            >
              {children}
            </main>
            <Footer />
          </>
        )}
      </MuiThemeProvider>
    </SessionProvider>
  );
}
