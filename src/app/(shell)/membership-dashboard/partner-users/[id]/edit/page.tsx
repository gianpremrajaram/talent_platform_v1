import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Box, Button, Stack, Card, Typography, MenuList, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BusinessIcon from "@mui/icons-material/Business";
import SecurityIcon from "@mui/icons-material/Security";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import prisma from "@/lib/prisma";
import AccessControlButtons from "./AccessControlButtons";
import CompanyProfileForm from "./CompanyProfileForm";

// 1. Define the two Tabs needed for the Partner page
type Tab = "profile" | "access";

export default async function PartnerEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  // --- Permission check (keeping the original logic) ---
  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser?.id) redirect("/sign-in");

  const roleKeys: string[] = sessionUser.roleKeys ?? [];
  if (!roleKeys.includes("ADMIN")) redirect("/membership-dashboard");

  // --- Get routing parameters ---
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: Tab = tabParam === "access" ? "access" : "profile";

// --- Connect to the real database to query Partner data ---
  const dbUser = await prisma.user.findUnique({
    where: { 
      id: id 
    },
    // Use include to fetch related tables together
    include: {
      organisation: true, // Get the associated company/organization information
      memberships: {
        include: {
          membershipTier: true // Get nested membership tier information (Bronze, Silver, etc.)
        }
      }
    }
  });

  // If this ID is not found in the database, return a 404 page directly
  if (!dbUser) notFound();

  // Map the raw data from the database to the format needed by our UI
  const partnerUser = {
    id: dbUser.id,
    // Get the name from the organisation table
    companyName: dbUser.organisation?.name || "Unknown Company", 
    email: dbUser.email,
    // Get the label of the first tier from the memberships array
    tier: dbUser.memberships?.[0]?.membershipTier?.label || "No Tier", 
  };

  // --- Query current suspension status ---
  const activeSuspension = await prisma.appSuspension.findFirst({
    where: { 
      userId: id, 
      appKey: "TALENT_DISCOVERY", 
      liftedAt: null // If liftedAt is null, it means the suspension is still active
    },
    orderBy: { suspendedAt: "desc" }
  });

  let currentStatus: "ACTIVE" | "SUSPENDED" | "BANNED" = "ACTIVE";
  if (activeSuspension) {
    currentStatus = activeSuspension.reason === "BANNED" ? "BANNED" : "SUSPENDED";
  }

  const baseUrl = `/membership-dashboard/partner-users/${id}/edit`;

  // --- Left sidebar navigation configuration ---
  const menuItems = [
    {
      label: "Company Profile",
      icon: <BusinessIcon fontSize="small" />,
      tabId: "profile",
      href: `${baseUrl}?tab=profile`,
    },
    {
      label: "Manage Access",
      icon: <SecurityIcon fontSize="small" />,
      tabId: "access",
      href: `${baseUrl}?tab=access`,
    },
  ];

  // --- Right content area: Company Profile Tab ---
  let profileContent = null;
  if (tab === "profile") {
    profileContent = (
      <CompanyProfileForm 
        org={dbUser.organisation} 
        userId={dbUser.id} 
        tier={partnerUser.tier} 
        email={dbUser.email} 
      />
    );
  }

  // --- Right content area: Access Management Tab (Issue #33 focus) ---
  let accessContent = null;
  if (tab === "access") {
    accessContent = (
      <Card sx={{ p: 4, borderRadius: 2, boxShadow: "none", border: "1px solid #e7e9ee" }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: "#d32f2f" }}>
          Access & Security Control
        </Typography>
        <Typography sx={{ mb: 4, color: "#4b5563" }}>
          Manage platform access for this partner. Suspending a partner revokes their access to the Talent Platform temporarily, while a ban is permanent.
        </Typography>

        <Stack spacing={3} sx={{ maxWidth: 400 }}>
          {/* TODO: Bind the Issue #33 suspension logic here */}
          <AccessControlButtons 
          userId={partnerUser.id} 
          currentStatus={currentStatus} 
        />
        </Stack>
      </Card>
    );
  }

  return (
    <Box>
      {/* Back to previous page button */}
      <Link href="/membership-dashboard/partner-users" style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2, bgcolor: "#1e3a5f", textTransform: "none", fontSize: 15, px: 3, py: 1, "&:hover": { bgcolor: "#162f4d" } }}
        >
          Back to Partners
        </Button>
      </Link>

      {/* Main page layout: Left menu + Right content */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "260px 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* Left custom Sidebar */}
        <Card sx={{ borderRadius: 2, boxShadow: "none", border: "1px solid #e7e9ee" }}>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Box sx={{ width: 64, height: 64, bgcolor: "#e2e8f0", borderRadius: "50%", mx: "auto", mb: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BusinessIcon sx={{ color: "#64748b", fontSize: 32 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: 18 }}>{partnerUser.companyName}</Typography>
            <Typography sx={{ fontSize: 13, color: "gray" }}>Partner</Typography>
          </Box>
          <Divider />
          <MenuList sx={{ py: 1 }}>
            {menuItems.map((item) => {
              const isActive = tab === item.tabId;
              return (
                <Link href={item.href} key={item.tabId} style={{ textDecoration: "none", color: "inherit" }}>
                  <MenuItem sx={{ py: 1.5, px: 3, bgcolor: isActive ? "#f1f5f9" : "transparent", borderRight: isActive ? "3px solid #1e3a5f" : "none" }}>
                    <ListItemIcon sx={{ color: isActive ? "#1e3a5f" : "gray" }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{ sx: { fontWeight: isActive ? 600 : 400, color: isActive ? "#1e3a5f" : "#4b5563" } }} 
                    />
                  </MenuItem>
                </Link>
              );
            })}
          </MenuList>
        </Card>

        {/* Render right content area */}
        {profileContent ?? accessContent}
      </Box>
    </Box>
  );
}