"use client";
// src/components/talent-discovery/PartnerFullView.tsx
// Gold/Platinum partner view with tabs: Job Board | Student Search.
// Student search is consent-gated — only consented students appear.
// Issue #34.

import { useState, useCallback } from "react";
import TierGate from "@/components/TierGate";
import type { StudentSearchResult, PaginatedStudentResults } from "@/types/index";

type Tab = "job-board" | "student-search";

type Props = {
  title: string;
  description: string;
};

// ─── Search filters state ─────────────────────────────────────────────────────

type Filters = {
  location: string;
  degreeProgram: string;
  skills: string;
};

const EMPTY_FILTERS: Filters = { location: "", degreeProgram: "", skills: "" };

// ─── Student result card ──────────────────────────────────────────────────────

function StudentCard({ student }: { student: StudentSearchResult }) {
  return (
    <article
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        padding: "1rem 1.25rem",
        marginBottom: "0.75rem",
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <strong>
            {student.firstName} {student.lastName}
          </strong>
          {student.degreeProgram && (
            <span style={{ marginLeft: "0.75rem", opacity: 0.7, fontSize: "0.875rem" }}>
              {student.degreeProgram}
            </span>
          )}
        </div>
        {student.location && (
          <span style={{ fontSize: "0.875rem", opacity: 0.65 }}>
            📍 {student.location}
          </span>
        )}
      </div>
      {student.skills.length > 0 && (
        <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {student.skills.map((skill) => (
            <span
              key={skill}
              style={{
                fontSize: "0.75rem",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: "9999px",
                padding: "0.125rem 0.625rem",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

// ─── Search panel ─────────────────────────────────────────────────────────────

function StudentSearchPanel() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const buildUrl = useCallback(
    (cursor?: string) => {
      const params = new URLSearchParams();
      if (filters.location) params.set("location", filters.location);
      if (filters.degreeProgram) params.set("degreeProgram", filters.degreeProgram);
      filters.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => params.append("skills", s));
      if (cursor) params.set("cursor", cursor);
      return `/api/recruiter/search?${params.toString()}`;
    },
    [filters],
  );

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStudents([]);
    setNextCursor(null);
    setSearched(false);

    try {
      const res = await fetch(buildUrl());
      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message ?? "Search failed.");
        return;
      }

      const result: PaginatedStudentResults = data.data;
      setStudents(result.students);
      setNextCursor(result.nextCursor);
      setSearched(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadMore() {
    if (!nextCursor) return;
    setLoading(true);

    try {
      const res = await fetch(buildUrl(nextCursor));
      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message ?? "Failed to load more results.");
        return;
      }

      const result: PaginatedStudentResults = data.data;
      setStudents((prev) => [...prev, ...result.students]);
      setNextCursor(result.nextCursor);
    } catch {
      setError("Something went wrong loading more results.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p style={{ marginBottom: "1.25rem", opacity: 0.8 }}>
        Search students who have consented to share their profile with your
        organisation. Contact details are available at the next tier of the
        platform.
      </p>

      {/* Search filters */}
      <form
        onSubmit={handleSearch}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1.25rem",
          alignItems: "end",
        }}
      >
        <div className="auth-field">
          <label className="auth-label" htmlFor="search-location">
            Location
          </label>
          <input
            className="auth-input"
            id="search-location"
            type="text"
            placeholder="e.g. London"
            value={filters.location}
            onChange={(e) =>
              setFilters((f) => ({ ...f, location: e.target.value }))
            }
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="search-degree">
            Degree programme
          </label>
          <input
            className="auth-input"
            id="search-degree"
            type="text"
            placeholder="e.g. Computer Science"
            value={filters.degreeProgram}
            onChange={(e) =>
              setFilters((f) => ({ ...f, degreeProgram: e.target.value }))
            }
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="search-skills">
            Skills{" "}
            <span style={{ fontWeight: 400, opacity: 0.65 }}>
              (comma-separated)
            </span>
          </label>
          <input
            className="auth-input"
            id="search-skills"
            type="text"
            placeholder="e.g. Python, React"
            value={filters.skills}
            onChange={(e) =>
              setFilters((f) => ({ ...f, skills: e.target.value }))
            }
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <button
            type="submit"
            className="button-link button-link--primary"
            disabled={loading}
            style={{ whiteSpace: "nowrap" }}
          >
            {loading ? "Searching…" : "Search"}
          </button>
          {searched && (
            <button
              type="button"
              className="button-link button-link--secondary"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setStudents([]);
                setNextCursor(null);
                setSearched(false);
                setError(null);
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && (
        <p role="alert" className="small" style={{ marginBottom: "1rem" }}>
          {error}
        </p>
      )}

      {/* Results */}
      {searched && (
        <>
          <p className="small" style={{ marginBottom: "0.75rem", opacity: 0.7 }}>
            {students.length === 0
              ? "No matching students found."
              : `Showing ${students.length} result${students.length !== 1 ? "s" : ""}`}
          </p>
          {students.map((s) => (
            <StudentCard key={s.id} student={s} />
          ))}
          {nextCursor && (
            <button
              type="button"
              className="button-link button-link--secondary"
              onClick={handleLoadMore}
              disabled={loading}
              style={{ marginTop: "0.5rem" }}
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TalentDiscoveryPartnerFullView({ title, description }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("job-board");

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: "0.5rem 1.25rem",
    border: "none",
    borderBottom: activeTab === tab ? "2px solid currentColor" : "2px solid transparent",
    background: "none",
    cursor: "pointer",
    fontWeight: activeTab === tab ? 600 : 400,
    fontSize: "0.9375rem",
  });

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
          role="tab"
          aria-selected={activeTab === "job-board"}
          style={tabStyle("job-board")}
          onClick={() => setActiveTab("job-board")}
        >
          Job Board
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "student-search"}
          style={tabStyle("student-search")}
          onClick={() => setActiveTab("student-search")}
        >
          Student Search
        </button>
      </div>

      {/* Tab panels */}
      {activeTab === "job-board" && (
        <div role="tabpanel">
          <p>
            Post and manage job opportunities visible to UCL CS students.{" "}
            <em>(Job board posting UI — coming soon.)</em>
          </p>
        </div>
      )}

      {activeTab === "student-search" && (
        <div role="tabpanel">
          <TierGate requiredTier="gold" fallback={
            <p>
              Student search is available to <strong>Gold and Platinum</strong>{" "}
              members only. Upgrade your membership to access this feature.
            </p>
          }>
            <StudentSearchPanel />
          </TierGate>
        </div>
      )}
    </section>
  );
}
