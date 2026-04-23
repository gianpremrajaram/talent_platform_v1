"use client";
// src/components/talent-discovery/RecruiterTalentSearchPanel.tsx
// Proactive Talent Search for Silver+ recruiters. UI mirrors the admin
// recommendation search so the experience is consistent.
//
// Backend scoping: calls /api/admin/recommendations/candidates, which force-
// rewrites firmId to the recruiter's own organisationId server-side. Cross-
// firm visibility is server-enforced; we never trust a client-side firm id.

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import type {
  PaginatedCandidates,
  RecommendationCandidate,
} from "@/types/index";

export default function RecruiterTalentSearchPanel() {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [degreeProgram, setDegreeProgram] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [cvTagsInput, setCvTagsInput] = useState("");

  const [candidates, setCandidates] = useState<RecommendationCandidate[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback(
    (cursor: string | null) => {
      const params = new URLSearchParams();
      if (city.trim()) params.set("city", city.trim());
      if (country.trim()) params.set("country", country.trim());
      if (degreeProgram.trim()) params.set("degreeProgram", degreeProgram.trim());
      if (skillsInput.trim()) params.set("skills", skillsInput.trim());
      if (cvTagsInput.trim()) params.set("cvTags", cvTagsInput.trim());
      if (cursor) params.set("cursor", cursor);
      return params.toString();
    },
    [city, country, degreeProgram, skillsInput, cvTagsInput],
  );

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setCandidates([]);
    setNextCursor(null);
    setSearched(false);
    try {
      const res = await fetch(
        `/api/admin/recommendations/candidates?${buildQuery(null)}`,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "Search failed.");
        return;
      }
      const data: PaginatedCandidates = await res.json();
      setCandidates(data.candidates ?? []);
      setNextCursor(data.nextCursor ?? null);
      setSearched(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/recommendations/candidates?${buildQuery(nextCursor)}`,
      );
      if (!res.ok) return;
      const data: PaginatedCandidates = await res.json();
      setCandidates((prev) => [...prev, ...(data.candidates ?? [])]);
      setNextCursor(data.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCity("");
    setCountry("");
    setDegreeProgram("");
    setSkillsInput("");
    setCvTagsInput("");
    setCandidates([]);
    setNextCursor(null);
    setSearched(false);
    setError(null);
  };

  return (
    <Card
      sx={{
        borderRadius: "8px",
        border: "1px solid #e7e9ee",
        boxShadow: "none",
        p: 2,
      }}
    >
      <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>
        Consented candidates
      </Typography>
      <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 1.5 }}>
        Only students who have explicitly consented to your organisation are shown.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <TextField
          label="City (exact)"
          size="small"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <TextField
          label="Country (exact)"
          size="small"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <TextField
          label="Degree programme (exact)"
          size="small"
          value={degreeProgram}
          onChange={(e) => setDegreeProgram(e.target.value)}
        />
        <TextField
          label="Skills (comma-separated)"
          size="small"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
        />
        <TextField
          label="CV tags (comma-separated)"
          size="small"
          value={cvTagsInput}
          onChange={(e) => setCvTagsInput(e.target.value)}
          sx={{ gridColumn: { sm: "span 2" } }}
        />
      </Box>

      <Stack direction="row" spacing={1.2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Search
        </Button>
        {searched && (
          <Button
            variant="outlined"
            onClick={handleClear}
            sx={{ textTransform: "none" }}
          >
            Clear
          </Button>
        )}
      </Stack>

      {error && (
        <Typography sx={{ fontSize: 13, color: "#b91c1c", mb: 1.5 }} role="alert">
          {error}
        </Typography>
      )}

      <Stack spacing={1.2}>
        {searched && candidates.length === 0 && !loading ? (
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
            No matching students found.
          </Typography>
        ) : !searched && candidates.length === 0 && !loading ? (
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
            Enter filters and click Search to discover consented candidates.
          </Typography>
        ) : (
          candidates.map((c) => (
            <Box
              key={c.id}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                p: 1.5,
                backgroundColor: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 1.5,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {c.firstName} {c.lastName}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                  {c.degreeProgram ?? "Degree not set"}.{" "}
                  {c.location ?? "Location not set"}. {c.cvCount} CV(s).
                </Typography>
                {c.skills.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ mt: 0.75, flexWrap: "wrap", gap: 0.5 }}
                  >
                    {c.skills.slice(0, 6).map((s) => (
                      <Chip key={s} label={s} size="small" />
                    ))}
                    {c.skills.length > 6 && (
                      <Chip label={`+${c.skills.length - 6}`} size="small" />
                    )}
                  </Stack>
                )}
              </Box>
              <Button
                component={Link}
                href={`/talent-discovery/student-profile/${c.id}`}
                size="small"
                variant="outlined"
                startIcon={<PersonOutlineIcon fontSize="small" />}
                sx={{ fontSize: 12, borderRadius: 1.5, whiteSpace: "nowrap", textTransform: "none", flexShrink: 0 }}
              >
                View Profile
              </Button>
            </Box>
          ))
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        )}

        {nextCursor && !loading && (
          <Button
            onClick={handleLoadMore}
            variant="text"
            sx={{ textTransform: "none", alignSelf: "flex-start" }}
          >
            Load more
          </Button>
        )}
      </Stack>
    </Card>
  );
}
