"use client";
// src/components/talent-discovery/RecruiterSideBar.tsx
// Left-hand navigation sidebar for the recruiter / talent-discovery portal.
// Nav items link to /talent-discovery?tab=<key>; active state is derived from
// the current URL tab param so sidebar and the MUI Tabs in PartnerFullView
// always stay in sync.

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SearchIcon from "@mui/icons-material/Search";
import RecommendOutlinedIcon from "@mui/icons-material/RecommendOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

// Canonical tier-rank values — matches TIER_RANK_MAP in TierGate.tsx
const TIER_RANK_MAP: Record<string, number> = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
};

type NavItem = {
  label: string;
  tab: string;
  icon: React.ReactNode;
  minTier?: number; // minimum tier rank required; omit for all tiers
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 3,
        pt: 2,
        pb: 1,
        display: "block",
        color: "text.secondary",
        fontSize: 13,
        fontWeight: 600,
        textTransform: "none",
      }}
    >
      {children}
    </Typography>
  );
}

export default function RecruiterSideBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const roleKeys: string[] = session?.user?.roleKeys ?? [];
  const isAdmin = roleKeys.includes("ADMIN");
  const tierRank: number = session?.user?.membershipTierRank ?? 1;
  const effectiveTierRank = isAdmin ? 99 : tierRank;

  const name = session?.user?.name ?? "";
  const userInitial = name.trim().charAt(0).toUpperCase() || "R";
  const displayRole = isAdmin
    ? "Administrator"
    : roleKeys.includes("RECRUITER")
    ? "Recruiter"
    : "Member";

  // Determine which tab is currently active from the URL
  const currentTab = searchParams?.get("tab") ?? "job-board";
  const isOnTalentDiscovery = pathname === "/talent-discovery";

  const allItems: NavItem[] = [
    {
      label: "Job Board",
      tab: "job-board",
      icon: <WorkOutlineIcon />,
    },
    {
      label: "Talent Search",
      tab: "talent-search",
      icon: <SearchIcon />,
      minTier: TIER_RANK_MAP.GOLD,
    },
    {
      label: "Recommended Students",
      tab: "recommended",
      icon: <RecommendOutlinedIcon />,
      minTier: TIER_RANK_MAP.PLATINUM,
    },
    {
      label: "Applications",
      tab: "applications",
      icon: <AssignmentOutlinedIcon />,
    },
  ];

  // Only show items the recruiter has access to
  const visibleItems = allItems.filter(
    (item) =>
      item.minTier == null || effectiveTierRank >= item.minTier,
  );

  return (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar>
        <Typography variant="h6" fontWeight={700}>
          Recruiter Portal
        </Typography>
      </Toolbar>

      <Divider />

      <List disablePadding sx={{ px: 2, pt: 1 }}>
        <ListItemButton
          component={Link}
          href="/"
          aria-label="Back to Alliances home page"
          sx={{
            minHeight: 44,
            borderRadius: 2,
            mb: 0.5,
            color: "text.secondary",
            "&:hover": {
              bgcolor: "action.hover",
              color: "primary.main",
              "& .MuiListItemIcon-root": { color: "primary.main" },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }} aria-hidden="true">
            <ArrowBackRoundedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Back to Alliances"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </ListItemButton>
      </List>

      <Divider sx={{ mt: 1 }} />

      <SectionTitle>Talent Discovery</SectionTitle>
      <List disablePadding sx={{ px: 2 }}>
        {visibleItems.map((item) => {
          const href = `/talent-discovery?tab=${item.tab}`;
          const selected = isOnTalentDiscovery && currentTab === item.tab;

          return (
            <ListItemButton
              key={item.tab}
              component={Link}
              href={href}
              selected={selected}
              aria-current={selected ? "page" : undefined}
              sx={{
                minHeight: 48,
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }} aria-hidden="true">
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>

      {/* User info at the bottom — mirrors AdminSidebar */}
      <Box sx={{ mt: "auto" }}>
        <Divider />
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              bgcolor: "primary.main",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: 13,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {userInitial}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}
              noWrap
            >
              {name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
              {displayRole}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
