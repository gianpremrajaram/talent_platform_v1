"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import type {
  PaginatedCandidates,
  RecommendationCandidate,
  RecommendationRow,
} from "@/types/index";

type Firm = { id: number; name: string };

export default function AdminRecommendationPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [firmId, setFirmId] = useState<number | "">("");

  // Candidate filter form state
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [degreeProgram, setDegreeProgram] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [cvTagsInput, setCvTagsInput] = useState("");

  // Results
  const [candidates, setCandidates] = useState<RecommendationCandidate[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());

  // Active recommendations for selected firm
  const [recommendations, setRecommendations] = useState<RecommendationRow[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadRecommendations = useCallback(async (fid: number) => {
    setLoadingRecs(true);
    const res = await fetch(`/api/admin/recommendations?firmId=${fid}`);
    const data: RecommendationRow[] = await res.json();
    setRecommendations(Array.isArray(data) ? data : []);
    setLoadingRecs(false);
  }, []);

  // Load firms once on mount, then kick off the first recommendations fetch.
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/firms");
      const data: Firm[] = await res.json();
      const safe = Array.isArray(data) ? data : [];
      setFirms(safe);
      if (safe.length > 0) {
        setFirmId(safe[0].id);
        loadRecommendations(safe[0].id);
      }
    })();
  }, [loadRecommendations]);

  const handleFirmChange = (value: string) => {
    const next = value === "" ? "" : Number(value);
    setFirmId(next);
    setCandidates([]);
    setNextCursor(null);
    setShortlist(new Set());
    if (typeof next === "number") {
      loadRecommendations(next);
    }
  };

  const buildCandidateQuery = useCallback(
    (fid: number, cursor: string | null) => {
      const params = new URLSearchParams();
      params.set("firmId", String(fid));
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
    if (typeof firmId !== "number") return;
    setLoadingCandidates(true);
    const res = await fetch(
      `/api/admin/recommendations/candidates?${buildCandidateQuery(firmId, null)}`,
    );
    const data: PaginatedCandidates = await res.json();
    setCandidates(data.candidates ?? []);
    setNextCursor(data.nextCursor ?? null);
    setLoadingCandidates(false);
  };

  const handleLoadMore = async () => {
    if (typeof firmId !== "number" || !nextCursor) return;
    setLoadingCandidates(true);
    const res = await fetch(
      `/api/admin/recommendations/candidates?${buildCandidateQuery(firmId, nextCursor)}`,
    );
    const data: PaginatedCandidates = await res.json();
    setCandidates((prev) => [...prev, ...(data.candidates ?? [])]);
    setNextCursor(data.nextCursor ?? null);
    setLoadingCandidates(false);
  };

  const toggleShortlist = (studentId: string) => {
    setShortlist((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const recommendStudent = async (studentId: string) => {
    if (typeof firmId !== "number") return;
    setBusyId(studentId);
    const res = await fetch("/api/admin/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, firmId }),
    });
    setBusyId(null);
    if (!res.ok) {
      alert("Failed to create recommendation.");
      return;
    }
    await loadRecommendations(firmId);
  };

  const recommendShortlist = async () => {
    if (typeof firmId !== "number" || shortlist.size === 0) return;
    setBusyId("__batch__");
    await Promise.all(
      Array.from(shortlist).map((studentId) =>
        fetch("/api/admin/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, firmId }),
        }),
      ),
    );
    setShortlist(new Set());
    setBusyId(null);
    await loadRecommendations(firmId);
  };

  const revokeRow = async (id: string) => {
    if (typeof firmId !== "number") return;
    if (!window.confirm("Revoke this recommendation? The audit trail will be preserved.")) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/recommendations/${id}`, {
      method: "DELETE",
    });
    setBusyId(null);
    if (!res.ok) {
      alert("Failed to revoke recommendation.");
      return;
    }
    await loadRecommendations(firmId);
  };

  const activeRecommendedStudentIds = useMemo(
    () =>
      new Set(
        recommendations
          .filter((r) => r.revokedAt == null)
          .map((r) => r.studentId),
      ),
    [recommendations],
  );

  const activeRecs = useMemo(
    () => recommendations.filter((r) => r.revokedAt == null),
    [recommendations],
  );
  const revokedRecs = useMemo(
    () => recommendations.filter((r) => r.revokedAt != null),
    [recommendations],
  );

  return (
    <Box data-admin-page="recommendations">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography sx={{ fontSize: 21, fontWeight: 600, color: "#1f2937" }}>
            Admin recommendations
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.5 }}>
            Dual-proxy: shortlist consented students on behalf of a firm and match them for the student.
          </Typography>
        </Box>
      </Stack>

      {/* Firm selector */}
      <Card
        sx={{
          borderRadius: "8px",
          border: "1px solid #e7e9ee",
          boxShadow: "none",
          p: 2,
          mb: 2.5,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            select
            label="Firm"
            size="small"
            value={firmId}
            onChange={(e) => handleFirmChange(e.target.value)}
            sx={{ minWidth: 260 }}
          >
            {firms.length === 0 ? (
              <MenuItem value="" disabled>
                No approved firms found
              </MenuItem>
            ) : (
              firms.map((firm) => (
                <MenuItem key={firm.id} value={firm.id}>
                  {firm.name}
                </MenuItem>
              ))
            )}
          </TextField>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
            Each firm only sees its own recommendations.
          </Typography>
        </Stack>
      </Card>

      {/* Two-panel layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        {/* Left: filters + candidate results */}
        <Card
          sx={{
            borderRadius: "8px",
            border: "1px solid #e7e9ee",
            boxShadow: "none",
            p: 2,
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1.5 }}>
            Consented candidates
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
              disabled={typeof firmId !== "number" || loadingCandidates}
              sx={{ textTransform: "none" }}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              onClick={recommendShortlist}
              disabled={shortlist.size === 0 || busyId === "__batch__"}
              startIcon={<PersonAddAltRoundedIcon />}
              sx={{ textTransform: "none" }}
            >
              Recommend shortlist ({shortlist.size})
            </Button>
          </Stack>

          <Stack spacing={1.2}>
            {candidates.length === 0 && !loadingCandidates ? (
              <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                No candidates yet. Choose a firm, enter filters, then click Search.
              </Typography>
            ) : (
              candidates.map((c) => {
                const alreadyRecommended = activeRecommendedStudentIds.has(c.id);
                const isShortlisted = shortlist.has(c.id);
                return (
                  <Box
                    key={c.id}
                    sx={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      p: 1.5,
                      backgroundColor: isShortlisted ? "#eef4ff" : "#fff",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1.5}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                          {c.firstName} {c.lastName}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                          {c.degreeProgram ?? "Degree not set"}. {c.location ?? "Location not set"}. {c.cvCount} CV(s).
                        </Typography>
                        {c.skills.length > 0 && (
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: "wrap", gap: 0.5 }}>
                            {c.skills.slice(0, 6).map((s) => (
                              <Chip key={s} label={s} size="small" />
                            ))}
                            {c.skills.length > 6 && (
                              <Chip label={`+${c.skills.length - 6}`} size="small" />
                            )}
                          </Stack>
                        )}
                      </Box>

                      <Stack spacing={0.75} alignItems="flex-end">
                        <Button
                          size="small"
                          variant={isShortlisted ? "contained" : "outlined"}
                          onClick={() => toggleShortlist(c.id)}
                          sx={{ textTransform: "none", minWidth: 96 }}
                        >
                          {isShortlisted ? "Shortlisted" : "Shortlist"}
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => recommendStudent(c.id)}
                          disabled={busyId === c.id || alreadyRecommended}
                          sx={{ textTransform: "none", minWidth: 96 }}
                        >
                          {alreadyRecommended
                            ? "Recommended"
                            : busyId === c.id
                              ? "..."
                              : "Recommend"}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })
            )}

            {loadingCandidates && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            )}

            {nextCursor && !loadingCandidates && (
              <Button
                onClick={handleLoadMore}
                variant="text"
                sx={{ textTransform: "none" }}
              >
                Load more
              </Button>
            )}
          </Stack>
        </Card>

        {/* Right: active recommendations for the selected firm */}
        <Card
          sx={{
            borderRadius: "8px",
            border: "1px solid #e7e9ee",
            boxShadow: "none",
            p: 2,
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>
            Current recommendations
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 1.5 }}>
            Visible to the firm&apos;s Platinum recruiters only. Revoked rows remain in the audit trail below.
          </Typography>

          {loadingRecs ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : activeRecs.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
              No active recommendations for this firm.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {activeRecs.map((r) => (
                <Box
                  key={r.id}
                  sx={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    p: 1.25,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                      {r.student.firstName} {r.student.lastName}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                      {r.student.email}. Added {new Date(r.createdAt).toLocaleDateString()}.
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => revokeRow(r.id)}
                    disabled={busyId === r.id}
                    aria-label="Revoke recommendation"
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          )}

          {revokedRecs.length > 0 && (
            <Box sx={{ mt: 2.5 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#6b7280", mb: 1 }}>
                Revoked audit trail
              </Typography>
              <Stack spacing={0.75}>
                {revokedRecs.map((r) => (
                  <Box
                    key={r.id}
                    sx={{
                      border: "1px dashed #e5e7eb",
                      borderRadius: "8px",
                      p: 1,
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                      {r.student.firstName} {r.student.lastName}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                      Added {new Date(r.createdAt).toLocaleDateString()}. Revoked{" "}
                      {r.revokedAt ? new Date(r.revokedAt).toLocaleDateString() : ""}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
