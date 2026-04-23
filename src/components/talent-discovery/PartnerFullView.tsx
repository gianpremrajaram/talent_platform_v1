"use client";
// src/components/talent-discovery/PartnerFullView.tsx
// Recruiter view — four tabs: Job Board, Talent Search (Silver+),
// Recommended Students (Platinum only), Applications (all).
// Active tab syncs with the URL ?tab= param so the sidebar and
// direct links deep-link to the right section.

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SearchIcon from "@mui/icons-material/Search";
import RecommendOutlinedIcon from "@mui/icons-material/RecommendOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import TierGate from "@/components/TierGate";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import RecruiterJobsPanel from "@/components/talent-discovery/RecruiterJobsPanel";
import RecruiterTalentSearchPanel from "@/components/talent-discovery/RecruiterTalentSearchPanel";
import RecommendedStudentsPanel from "@/components/talent-discovery/RecommendedStudentsPanel";
import RecruiterApplicationsPanel from "@/components/talent-discovery/RecruiterApplicationsPanel";

type TabKey = "job-board" | "talent-search" | "recommended" | "applications";

const TIER_RANK_MAP: Record<string, number> = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
};

type Props = {
  title: string;
  description: string;
};

export default function TalentDiscoveryPartnerFullView({ title, description }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const roleKeys: string[] = session?.user?.roleKeys ?? [];
  const isAdmin = roleKeys.includes("ADMIN");
  const tierRank: number = session?.user?.membershipTierRank ?? 1;
  const effectiveTierRank = isAdmin ? 99 : tierRank;

  const hasGold = effectiveTierRank >= TIER_RANK_MAP.GOLD;
  const hasPlatinum = effectiveTierRank >= TIER_RANK_MAP.PLATINUM;

  // Build the list of tabs this user can actually see.
  // This fixes an index-mismatch bug where TierGate returning null inside <Tabs>
  // caused the active-tab index to point at the wrong panel.
  const visibleTabs: TabKey[] = [
    "job-board",
    ...(hasGold     ? (["talent-search"] as TabKey[]) : []),
    ...(hasPlatinum ? (["recommended"]   as TabKey[]) : []),
    "applications",
  ];

  function tabFromParam(param: string | null): TabKey {
    if (param && visibleTabs.includes(param as TabKey)) return param as TabKey;
    return "job-board";
  }

  const [activeTab, setActiveTab] = useState<TabKey>(() =>
    tabFromParam(searchParams?.get("tab") ?? null),
  );

  // Keep internal state in sync when the URL changes (e.g. sidebar click)
  useEffect(() => {
    const tab = tabFromParam(searchParams?.get("tab") ?? null);
    if (tab !== activeTab) setActiveTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleTabChange(_: React.SyntheticEvent, newIndex: number) {
    const newTab = visibleTabs[newIndex];
    if (!newTab) return;
    setActiveTab(newTab);
    // Update URL so the sidebar highlights the right item and the link is shareable
    router.replace(`/talent-discovery?tab=${newTab}`, { scroll: false });
  }

  const activeIndex = visibleTabs.indexOf(activeTab);

  return (
    <Box
      component="section"
      aria-label={title}
      sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      {/* Page header */}
      <Box component="header" sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      </Box>

      {/* Tab bar — only render visible tabs so indices are always correct */}
      <Tabs
        value={activeIndex === -1 ? 0 : activeIndex}
        onChange={handleTabChange}
        aria-label="Talent discovery sections"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 3 }}
      >
        <Tab
          id="tab-job-board"
          aria-controls="panel-job-board"
          label="Job Board"
          icon={<WorkOutlineIcon fontSize="small" />}
          iconPosition="start"
          sx={{ gap: 0.75 }}
        />

        {hasGold && (
          <Tab
            id="tab-talent-search"
            aria-controls="panel-talent-search"
            label="Talent Search"
            icon={<SearchIcon fontSize="small" />}
            iconPosition="start"
            sx={{ gap: 0.75 }}
          />
        )}

        {hasPlatinum && (
          <Tab
            id="tab-recommended"
            aria-controls="panel-recommended"
            label="Recommended Students"
            icon={<RecommendOutlinedIcon fontSize="small" />}
            iconPosition="start"
            sx={{ gap: 0.75 }}
          />
        )}

        <Tab
          id="tab-applications"
          aria-controls="panel-applications"
          label="Applications"
          icon={<AssignmentOutlinedIcon fontSize="small" />}
          iconPosition="start"
          sx={{ gap: 0.75 }}
        />
      </Tabs>

      {/* Tab panels */}
      <Box
        role="tabpanel"
        id="panel-job-board"
        aria-labelledby="tab-job-board"
        hidden={activeTab !== "job-board"}
      >
        {activeTab === "job-board" && (
          <ErrorBoundary>
            <RecruiterJobsPanel />
          </ErrorBoundary>
        )}
      </Box>

      <Box
        role="tabpanel"
        id="panel-talent-search"
        aria-labelledby="tab-talent-search"
        hidden={activeTab !== "talent-search"}
      >
        {activeTab === "talent-search" && (
          <TierGate
            requiredTier="GOLD"
            fallback={
              <Box sx={{ p: 4, borderRadius: 2, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", textAlign: "center" }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Gold membership or above required
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Talent Search is available to <strong>Gold and Platinum</strong>{" "}
                  members. Upgrade your membership to access this feature.
                </Typography>
              </Box>
            }
          >
            <ErrorBoundary>
              <RecruiterTalentSearchPanel />
            </ErrorBoundary>
          </TierGate>
        )}
      </Box>

      <Box
        role="tabpanel"
        id="panel-recommended"
        aria-labelledby="tab-recommended"
        hidden={activeTab !== "recommended"}
      >
        {activeTab === "recommended" && (
          <TierGate
            requiredTier="PLATINUM"
            fallback={
              <Box sx={{ p: 4, borderRadius: 2, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", textAlign: "center" }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Platinum membership required
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recommended Students is a <strong>Platinum-only</strong> feature.
                  Upgrade your membership to see students curated for your organisation.
                </Typography>
              </Box>
            }
          >
            <ErrorBoundary>
              <RecommendedStudentsPanel />
            </ErrorBoundary>
          </TierGate>
        )}
      </Box>

      <Box
        role="tabpanel"
        id="panel-applications"
        aria-labelledby="tab-applications"
        hidden={activeTab !== "applications"}
      >
        {activeTab === "applications" && (
          <ErrorBoundary>
            <RecruiterApplicationsPanel canViewProfiles={effectiveTierRank >= TIER_RANK_MAP.GOLD} />
          </ErrorBoundary>
        )}
      </Box>
    </Box>
  );
}
