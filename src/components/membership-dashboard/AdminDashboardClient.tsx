// src/components/membership-dashboard/AdminDashboardClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { BENEFITS, type BenefitId } from "@/content/benefits";
import type {
  AdminBenefitRedemptionStat,
  AdminMemberListItem,
  AdminSelectedMember,
} from "@/lib/membership-dashboard-admin";
import type { HandbookRenderResult } from "@/lib/handbook";
import { canAccessBenefit } from "@/lib/membership-dashboard-admin";
import { saveRedeemedBenefitsAction } from "@/lib/membership-dashboard-actions";
import TalentMetricsPanel from "./TalentMetricsPanel";
import AdminDataTable, { type AdminTableColumn } from "./AdminDataTable";

const MEMBER_COLUMNS: AdminTableColumn[] = [
  { key: "organisationName", label: "COMPANY NAME", width: "26%" },
  { key: "contactName", label: "CONTACT NAME", width: "22%" },
  { key: "tierLabel", label: "TIER", width: "14%" },
  { key: "lastSignedInLabel", label: "LAST SIGN-IN", width: "20%" },
  { key: "action", label: "ACTIONS", width: "18%" },
];

function tierChipSx(label: string) {
  const k = label.toLowerCase();
  if (k.includes("platinum")) return { backgroundColor: "#ede9fe", color: "#5b21b6" };
  if (k.includes("gold"))     return { backgroundColor: "#fef08a", color: "#713f12" };
  if (k.includes("silver"))   return { backgroundColor: "#e2e8f0", color: "#1e293b" };
  if (k.includes("bronze"))   return { backgroundColor: "#fed7aa", color: "#7c2d12" };
  return { backgroundColor: "#f3f4f6", color: "#374151" };
}

type TabKey = "members" | "benefits" | "handbook" | "metrics";

function asTabKey(v: string | null | undefined): TabKey | null {
  if (v === "members" || v === "benefits" || v === "handbook" || v === "metrics") return v;
  return null;
}

function formatDateGB(d: Date | string | null | undefined) {
  if (!d) return "Not set";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}

function tierIcon(tierMin: string) {
  const k = tierMin.toLowerCase();
  if (k.includes("platinum")) return { glyph: "🏆", label: "Platinum tier" };
  if (k.includes("gold")) return { glyph: "🥇", label: "Gold tier" };
  if (k.includes("silver")) return { glyph: "🥈", label: "Silver tier" };
  return { glyph: "🥉", label: "Bronze tier" };
}

export default function AdminDashboardClient(props: {
  members: AdminMemberListItem[];
  selectedUserId: string | null;
  selectedMember: AdminSelectedMember | null;
  benefitStats: AdminBenefitRedemptionStat[];
  initialTab?: string | null;
  handbook: HandbookRenderResult;
}) {
  const {
    members,
    selectedUserId,
    selectedMember,
    benefitStats,
    initialTab,
    handbook,
  } = props;

  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const tocSlug = handbook.chapters[0]?.slug ?? "table-of-contents";

  // Local select state fixes "snap back" during RSC refresh
  const [localSelectedUserId, setLocalSelectedUserId] = useState(
    selectedUserId ?? "",
  );

  useEffect(() => {
    setLocalSelectedUserId(selectedUserId ?? "");
  }, [selectedUserId]);

  // URL controls initial state; default is "members"
  const urlTab = asTabKey(sp?.get("tab"));
  const bootTab = asTabKey(initialTab) ?? urlTab ?? "members";
  const [activeTab, setActiveTab] = useState<TabKey>(bootTab);

  const ADMIN_TABS: TabKey[] = ["members", "benefits", "handbook", "metrics"];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleTabKeyDown(e: React.KeyboardEvent, currentIndex: number) {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % ADMIN_TABS.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + ADMIN_TABS.length) % ADMIN_TABS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = ADMIN_TABS.length - 1;
    }
    if (nextIndex !== null) {
      changeTab(ADMIN_TABS[nextIndex]);
      tabRefs.current[nextIndex]?.focus();
    }
  }

  useEffect(() => {
    const next = asTabKey(sp?.get("tab"));
    if (next && next !== activeTab) setActiveTab(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const hasSelection = Boolean(selectedUserId && selectedMember);

  function pushWithParams(nextParams: URLSearchParams) {
    router.replace(`/membership-dashboard?${nextParams.toString()}`);
  }

  function setSelectedUser(nextUserId: string) {
    const params = new URLSearchParams(sp?.toString());
    if (!nextUserId) params.delete("userId");
    else params.set("userId", nextUserId);

    startTransition(() => {
      pushWithParams(params);
      router.refresh();
    });
  }

  function changeTab(next: TabKey) {
    setActiveTab(next);
    const params = new URLSearchParams(sp?.toString());
    params.set("tab", next);

    // If entering handbook and no chapter is set, default to the ToC chapter.
    if (next === "handbook" && !params.get("chapter")) {
      params.set("chapter", tocSlug);
    }

    startTransition(() => {
      pushWithParams(params);
      router.refresh();
    });
  }

  const [memberSearch, setMemberSearch] = useState("");

  const filteredMembers = useMemo(() => {
    const keyword = memberSearch.trim().toLowerCase();
    if (!keyword) return members;
    return members.filter((m) =>
      m.organisationName.toLowerCase().includes(keyword),
    );
  }, [members, memberSearch]);

  const benefitStatsMap = useMemo(() => {
    const m = new Map<string, AdminBenefitRedemptionStat>();
    benefitStats.forEach((s) => m.set(s.benefitId, s));
    return m;
  }, [benefitStats]);

  const [draftRedeemed, setDraftRedeemed] = useState<Set<BenefitId>>(
    new Set((selectedMember?.redeemedBenefitCodes ?? []) as BenefitId[]),
  );

  useEffect(() => {
    setDraftRedeemed(
      new Set((selectedMember?.redeemedBenefitCodes ?? []) as BenefitId[]),
    );
  }, [selectedUserId, selectedMember]);

  async function saveBenefits() {
    if (!selectedUserId) return;
    const redeemedBenefitCodes = Array.from(draftRedeemed);

    startTransition(async () => {
      await saveRedeemedBenefitsAction({
        userId: selectedUserId,
        redeemedBenefitCodes,
      });
      router.refresh();
    });
  }

  function handbookHref(chapterSlug: string) {
    const params = new URLSearchParams(sp?.toString());
    params.set("tab", "handbook");
    params.set("chapter", chapterSlug);
    return `/membership-dashboard?${params.toString()}`;
  }

  const isTocPage = handbook.active.slug === tocSlug;

  return (
    <>
      {/* Account selector */}
      <section className="admin-section">
        <h2 style={{ marginTop: 0 }}>Select an account</h2>

        <div className="admin-selector-row">
          <p style={{ margin: 0, maxWidth: "60ch" }}>
            Select an organisation to view member details and benefit redemption
            status. If no account is selected, you will see summary views.
          </p>

          <label className="sr-only" htmlFor="adminAccountSelector">
            Select account
          </label>
          <select
            id="adminAccountSelector"
            className="auth-input"
            value={localSelectedUserId}
            onChange={(e) => {
              const next = e.target.value;
              setLocalSelectedUserId(next);
              setSelectedUser(next);
            }}
            style={{ width: "min(28rem, 100%)" }}
          >
            <option value="">No account selected (summary view)</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.organisationName} ({m.contactName})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Tabs + panels */}
      <section className="admin-section">
        <div className="tabs">
          <div className="tab-list" role="tablist">
            <button
              ref={(el) => { tabRefs.current[0] = el; }}
              type="button"
              role="tab"
              className={`tab ${activeTab === "members" ? "is-active" : ""}`}
              aria-selected={activeTab === "members"}
              aria-controls="panel-members"
              id="tab-members"
              tabIndex={activeTab === "members" ? 0 : -1}
              onClick={() => changeTab("members")}
              onKeyDown={(e) => handleTabKeyDown(e, 0)}
            >
              Members
            </button>

            <button
              ref={(el) => { tabRefs.current[1] = el; }}
              type="button"
              role="tab"
              className={`tab ${activeTab === "benefits" ? "is-active" : ""}`}
              aria-selected={activeTab === "benefits"}
              aria-controls="panel-benefits"
              id="tab-benefits"
              tabIndex={activeTab === "benefits" ? 0 : -1}
              onClick={() => changeTab("benefits")}
              onKeyDown={(e) => handleTabKeyDown(e, 1)}
            >
              Benefits
            </button>

            <button
              ref={(el) => { tabRefs.current[2] = el; }}
              type="button"
              role="tab"
              className={`tab ${activeTab === "handbook" ? "is-active" : ""}`}
              aria-selected={activeTab === "handbook"}
              aria-controls="panel-handbook"
              id="tab-handbook"
              tabIndex={activeTab === "handbook" ? 0 : -1}
              onClick={() => changeTab("handbook")}
              onKeyDown={(e) => handleTabKeyDown(e, 2)}
            >
              Handbook
            </button>

            <button
              ref={(el) => { tabRefs.current[3] = el; }} // 注意这里是 [3]
              type="button"
              role="tab"
              className={`tab ${activeTab === "metrics" ? "is-active" : ""}`}
              aria-selected={activeTab === "metrics"}
              aria-controls="panel-metrics"
              id="tab-metrics"
              tabIndex={activeTab === "metrics" ? 0 : -1}
              onClick={() => changeTab("metrics")}
              onKeyDown={(e) => handleTabKeyDown(e, 3)} // 注意这里是 3
            >
              Talent Platform
            </button>
          </div>

          {/* Members panel */}
          <div
            role="tabpanel"
            id="panel-members"
            aria-labelledby="tab-members"
            className="tab-panel tab-panel--scroll"
            hidden={activeTab !== "members"}
          >
            {!hasSelection ? (
              <Card
                sx={{
                  borderRadius: "8px",
                  border: "1px solid #e7e9ee",
                  boxShadow: "none",
                  overflow: "hidden",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ px: 2, py: 1.4, borderBottom: "1px solid #eceef2" }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 17, fontWeight: 600, color: "#111827" }}>
                      Members overview
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#4b5563", mt: 0.25 }}>
                      {filteredMembers.length} of {members.length} members
                    </Typography>
                  </Box>
                  <TextField
                    size="small"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search by company"
                    slotProps={{ htmlInput: { "aria-label": "Search members by company" } }}
                    sx={{
                      width: 240,
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                        backgroundColor: "#f9fafb",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" sx={{ color: "#4b5563" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>

                <AdminDataTable
                  columns={MEMBER_COLUMNS}
                  rows={filteredMembers}
                  getRowKey={(row) => row.userId}
                  getCells={(row) => [
                    {
                      key: "organisationName",
                      content: (
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                          {row.organisationName}
                        </Typography>
                      ),
                    },
                    { key: "contactName", content: row.contactName },
                    {
                      key: "tierLabel",
                      content: (
                        <Chip
                          label={row.tierLabel}
                          size="small"
                          sx={{ fontWeight: 600, ...tierChipSx(row.tierLabel) }}
                        />
                      ),
                    },
                    { key: "lastSignedInLabel", content: row.lastSignedInLabel },
                    {
                      key: "action",
                      content: (
                        <Button
                          size="small"
                          variant="outlined"
                          aria-label={`View details for ${row.organisationName}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocalSelectedUserId(row.userId);
                            setSelectedUser(row.userId);
                          }}
                          sx={{
                            minWidth: 0,
                            px: 1.2,
                            py: 0.25,
                            fontSize: 13,
                            textTransform: "none",
                            borderColor: "#cbd5e1",
                            color: "#1f2937",
                            "&:hover": {
                              borderColor: "#94a3b8",
                              backgroundColor: "#f8fafc",
                            },
                          }}
                        >
                          View
                        </Button>
                      ),
                    },
                  ]}
                  emptyState={
                    <>
                      <Typography sx={{ fontWeight: 600, color: "#374151" }}>
                        No members found
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: "#4b5563", mt: 0.5 }}>
                        Try another search term.
                      </Typography>
                    </>
                  }
                />
              </Card>
            ) : (
              <>
                <h3 style={{ marginTop: 0 }}>Member details</h3>

                <ul>
                  <li>
                    <strong>Organisation:</strong>{" "}
                    {selectedMember?.organisationName ?? "Unknown"}
                  </li>
                  <li>
                    <strong>Contact:</strong>{" "}
                    {selectedMember?.contactName ?? "Unknown"}
                  </li>
                  <li>
                    <strong>Membership tier:</strong>{" "}
                    {selectedMember?.membershipTierLabel ?? "Unknown"}
                  </li>
                  <li>
                    <strong>Expiry date:</strong>{" "}
                    {formatDateGB(selectedMember?.membershipExpiry)}
                  </li>
                  <li>
                    <strong>Client experience manager:</strong>{" "}
                    {selectedMember?.membershipManagerName?.trim()
                      ? selectedMember.membershipManagerName
                      : "Not set"}
                  </li>
                  <li>
                    <strong>Status:</strong>{" "}
                    {selectedMember?.membershipStatus ?? "Not set"}
                  </li>
                  <li>
                    <strong>User role(s):</strong>{" "}
                    {selectedMember?.roleKeys?.length
                      ? selectedMember.roleKeys.join(", ")
                      : "None"}
                  </li>
                  <li>
                    <strong>Default app:</strong>{" "}
                    {selectedMember?.defaultAppName
                      ? `${selectedMember.defaultAppName} (${selectedMember.defaultAppKey})`
                      : "Not set"}
                  </li>
                </ul>

                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    className="button-link button-link--secondary"
                    onClick={() => {
                      setLocalSelectedUserId("");
                      setSelectedUser("");
                    }}
                    aria-label="Back to members list"
                  >
                    Back
                  </button>
                  <Link
                    className="button-link button-link--secondary"
                    href={`/account?userId=${encodeURIComponent(selectedUserId ?? "")}`}
                  >
                    Edit profile
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Benefits panel */}
          <div
            role="tabpanel"
            id="panel-benefits"
            aria-labelledby="tab-benefits"
            className="tab-panel tab-panel--scroll"
            hidden={activeTab !== "benefits"}
          >
            {!hasSelection ? (
              <>
                <h3 style={{ marginTop: 0 }}>Benefits overview</h3>

                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Benefit</th>
                        <th>Eligible members</th>
                        <th>Redeemed</th>
                        <th>% Redeemed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BENEFITS.map((b) => {
                        const stat = benefitStatsMap.get(b.id);
                        const pct =
                          stat?.percent == null ? "—" : `${stat.percent}%`;

                        const icon = tierIcon(b.tierMin);

                        return (
                          <tr key={b.id}>
                            <td>
                              <strong>{b.label}</strong>{" "}
                              <span>
                                {icon.glyph}
                              </span>
                            </td>
                            <td>{stat?.eligible ?? "—"}</td>
                            <td>{stat?.redeemed ?? "—"}</td>
                            <td>{pct}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ marginTop: 0 }}>Benefit redemption checklist</h3>

                <ul className="list-plain" style={{ marginTop: ".75rem" }}>
                  {BENEFITS.map((b) => {
                    const included = canAccessBenefit(
                      selectedMember?.membershipTierRank ?? null,
                      b.tierMin,
                    );
                    const checked = draftRedeemed.has(b.id);

                    if (!included) {
                      return (
                        <li
                          key={b.id}
                          className="tile"
                          style={{
                            padding: ".5rem .75rem",
                            marginBottom: ".5rem",
                          }}
                        >
                          <span role="img" aria-label="Locked">
                            🔒
                          </span>{" "}
                          <strong>{b.label}</strong>
                        </li>
                      );
                    }

                    return (
                      <li
                        key={b.id}
                        className="tile"
                        style={{
                          padding: ".5rem .75rem",
                          marginBottom: ".5rem",
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            gap: ".5rem",
                            alignItems: "flex-start",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = new Set(draftRedeemed);
                              if (e.target.checked) next.add(b.id);
                              else next.delete(b.id);
                              setDraftRedeemed(next);
                            }}
                          />
                          <span>
                            <strong>{b.label}</strong>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>

                <div
                  style={{
                    display: "flex",
                    gap: ".75rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="button-link"
                    onClick={saveBenefits}
                    disabled={isPending}
                    aria-disabled={isPending ? "true" : undefined}
                  >
                    Save changes
                  </button>
                  {isPending && <span className="small">Saving…</span>}
                </div>
              </>
            )}
          </div>

          {/* Handbook panel */}
          <div
            role="tabpanel"
            id="panel-handbook"
            aria-labelledby="tab-handbook"
            className="tab-panel tab-panel--scroll"
            hidden={activeTab !== "handbook"}
          >
            {/* ToC page = two column layout; chapter pages = pager + content only */}
            {isTocPage ? (
              <div className="handbook-grid">
                <nav className="handbook-toc">
                  <h4 style={{ marginTop: 0 }}>Contents</h4>
                  <ol>
                    {handbook.chapters.map((c, idx) => (
                      <li key={c.slug}>
                        {c.slug === handbook.active.slug ? (
                          <strong aria-current="page">
                            {idx + 1}. {c.title}
                          </strong>
                        ) : (
                          <Link href={handbookHref(c.slug)}>
                            {idx + 1}. {c.title}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>

                <article className="handbook-content">
                  <div className="handbook-pager">
                    <button
                      className="button-link button-link--secondary"
                      disabled
                      aria-disabled="true"
                    >
                      Previous
                    </button>

                    <button
                      className="button-link button-link--secondary"
                      disabled
                      aria-disabled="true"
                    >
                      Table of contents
                    </button>

                    {handbook.next ? (
                      <Link
                        className="button-link button-link--secondary"
                        href={handbookHref(handbook.next.slug)}
                      >
                        Next
                      </Link>
                    ) : (
                      <button
                        className="button-link button-link--secondary"
                        disabled
                        aria-disabled="true"
                      >
                        Next
                      </button>
                    )}
                  </div>

                  <div
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ __html: handbook.html }}
                  />
                </article>
              </div>
            ) : (
              <article className="handbook-content">
                <div className="handbook-pager">
                  {handbook.prev ? (
                    <Link
                      className="button-link button-link--secondary"
                      href={handbookHref(handbook.prev.slug)}
                    >
                      Previous
                    </Link>
                  ) : (
                    <button
                      className="button-link button-link--secondary"
                      disabled
                      aria-disabled="true"
                    >
                      Previous
                    </button>
                  )}

                  <Link
                    className="button-link button-link--secondary"
                    href={handbookHref(tocSlug)}
                  >
                    Table of contents
                  </Link>

                  {handbook.next ? (
                    <Link
                      className="button-link button-link--secondary"
                      href={handbookHref(handbook.next.slug)}
                    >
                      Next
                    </Link>
                  ) : (
                    <button
                      className="button-link button-link--secondary"
                      disabled
                      aria-disabled="true"
                    >
                      Next
                    </button>
                  )}
                </div>
                {/* No extra title here; Markdown owns the chapter heading */}
                <div
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ __html: handbook.html }}
                />
              </article>
            )}
          </div>
          <div
            role="tabpanel"
            id="panel-metrics"
            aria-labelledby="tab-metrics"
            className="tab-panel tab-panel--scroll"
            hidden={activeTab !== "metrics"}
          >
            <h3 style={{ marginTop: 0 }}>Talent Platform Metrics</h3>
            {activeTab === "metrics" && <TalentMetricsPanel />}
          </div>
        </div>
      </section>
    </>
  );
}
