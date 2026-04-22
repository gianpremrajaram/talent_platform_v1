"use client";
// src/components/talent-discovery/PartnerFullView.tsx
// Recruiter view with three tabs: Job Board (Silver+), Talent Search (Silver+),
// and Recommended Students (Platinum only). Each tab is gated twice: TierGate
// on the button and panel for UX, and the API route re-checks server-side.

import { useState, useRef } from "react";
import TierGate from "@/components/TierGate";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import RecruiterJobsPanel from "@/components/talent-discovery/RecruiterJobsPanel";
import RecruiterTalentSearchPanel from "@/components/talent-discovery/RecruiterTalentSearchPanel";
import RecommendedStudentsPanel from "@/components/talent-discovery/RecommendedStudentsPanel";
import RecruiterApplicationsPanel from "@/components/talent-discovery/RecruiterApplicationsPanel";

type Tab = "job-board" | "talent-search" | "recommended" | "applications";

type Props = {
  title: string;
  description: string;
};

const ALL_TABS: Tab[] = ["job-board", "talent-search", "recommended", "applications"];

export default function TalentDiscoveryPartnerFullView({ title, description }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("job-board");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: "0.5rem 1.25rem",
    border: "none",
    borderBottom: activeTab === tab ? "2px solid currentColor" : "2px solid transparent",
    background: "none",
    cursor: "pointer",
    fontWeight: activeTab === tab ? 600 : 400,
    fontSize: "0.9375rem",
  });

  function handleTabKeyDown(e: React.KeyboardEvent, currentIndex: number) {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % ALL_TABS.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + ALL_TABS.length) % ALL_TABS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = ALL_TABS.length - 1;
    }
    if (nextIndex !== null) {
      setActiveTab(ALL_TABS[nextIndex]);
      tabRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <section className="content-section">
      <header className="content-header">
        <h1>{title}</h1>
        <p>{description}</p>
      </header>

      {/* Tab bar */}
      <div
        role="tablist"
        style={{
          display: "flex",
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "1.5rem",
          gap: "0.25rem",
        }}
      >
        <button
          ref={(el) => { tabRefs.current[0] = el; }}
          id="tab-job-board"
          role="tab"
          aria-selected={activeTab === "job-board"}
          aria-controls="panel-job-board"
          tabIndex={activeTab === "job-board" ? 0 : -1}
          style={tabStyle("job-board")}
          onClick={() => setActiveTab("job-board")}
          onKeyDown={(e) => handleTabKeyDown(e, 0)}
        >
          Job Board
        </button>

        {/* Talent Search tab: Silver and above */}
        <TierGate requiredTier="SILVER">
          <button
            ref={(el) => { tabRefs.current[1] = el; }}
            id="tab-talent-search"
            role="tab"
            aria-selected={activeTab === "talent-search"}
            aria-controls="panel-talent-search"
            tabIndex={activeTab === "talent-search" ? 0 : -1}
            style={tabStyle("talent-search")}
            onClick={() => setActiveTab("talent-search")}
            onKeyDown={(e) => handleTabKeyDown(e, 1)}
          >
            Talent Search
          </button>
        </TierGate>

        {/* Recommended Students tab: Platinum only */}
        <TierGate requiredTier="PLATINUM">
          <button
            ref={(el) => { tabRefs.current[2] = el; }}
            id="tab-recommended"
            role="tab"
            aria-selected={activeTab === "recommended"}
            aria-controls="panel-recommended"
            tabIndex={activeTab === "recommended" ? 0 : -1}
            style={tabStyle("recommended")}
            onClick={() => setActiveTab("recommended")}
            onKeyDown={(e) => handleTabKeyDown(e, 2)}
          >
            Recommended Students
          </button>
        </TierGate>

        {/* Applications tab: all recruiters */}
        <button
          ref={(el) => { tabRefs.current[3] = el; }}
          id="tab-applications"
          role="tab"
          aria-selected={activeTab === "applications"}
          aria-controls="panel-applications"
          tabIndex={activeTab === "applications" ? 0 : -1}
          style={tabStyle("applications")}
          onClick={() => setActiveTab("applications")}
          onKeyDown={(e) => handleTabKeyDown(e, 3)}
        >
          Applications
        </button>
      </div>

      {/* Tab panels */}
      {activeTab === "job-board" && (
        <div role="tabpanel" id="panel-job-board" aria-labelledby="tab-job-board">
          <ErrorBoundary>
            <RecruiterJobsPanel />
          </ErrorBoundary>
        </div>
      )}

      {activeTab === "talent-search" && (
        <div role="tabpanel" id="panel-talent-search" aria-labelledby="tab-talent-search">
          <TierGate
            requiredTier="SILVER"
            fallback={
              <p>
                Talent Search is available to <strong>Silver, Gold, and Platinum</strong>{" "}
                members. Upgrade your membership to access this feature.
              </p>
            }
          >
            <ErrorBoundary>
              <RecruiterTalentSearchPanel />
            </ErrorBoundary>
          </TierGate>
        </div>
      )}

      {activeTab === "recommended" && (
        <div role="tabpanel" id="panel-recommended" aria-labelledby="tab-recommended">
          <TierGate
            requiredTier="PLATINUM"
            fallback={
              <p>
                Recommended Students is a <strong>Platinum-only</strong> feature.
                Upgrade your membership to see students curated for your organisation.
              </p>
            }
          >
            <ErrorBoundary>
              <RecommendedStudentsPanel />
            </ErrorBoundary>
          </TierGate>
        </div>
      )}

      {activeTab === "applications" && (
        <div role="tabpanel" id="panel-applications" aria-labelledby="tab-applications">
          <ErrorBoundary>
            <RecruiterApplicationsPanel />
          </ErrorBoundary>
        </div>
      )}
    </section>
  );
}
