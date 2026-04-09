// src/components/membership-dashboard/BenefitsFilterToolbar.tsx
"use client";

type BenefitFilter = "redeemed" | "available" | "locked" | null;

type Props = {
  value: BenefitFilter;
  onChange: (next: BenefitFilter) => void;
  counts: { redeemed: number; available: number; locked: number };
};

function toggle(next: Exclude<BenefitFilter, null>, current: BenefitFilter) {
  return current === next ? null : next;
}

export default function BenefitsFilterToolbar({ value, onChange, counts }: Props) {
  return (
    <div className="benefits-filter-row">
      <div role="toolbar" aria-label="Filter" className="benefits-filter-toolbar">
        <button
          type="button"
          className={["filter-toggle", value === "redeemed" ? "is-on" : ""]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={value === "redeemed"}
          onClick={() => onChange(toggle("redeemed", value))}
        >
          <span aria-hidden="true">✅</span>{" "}Redeemed ({counts.redeemed})
        </button>

        <button
          type="button"
          className={["filter-toggle", value === "available" ? "is-on" : ""]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={value === "available"}
          onClick={() => onChange(toggle("available", value))}
        >
          <span aria-hidden="true">🟡</span>{" "}Available ({counts.available})
        </button>

        <button
          type="button"
          className={["filter-toggle", value === "locked" ? "is-on" : ""]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={value === "locked"}
          onClick={() => onChange(toggle("locked", value))}
        >
          <span aria-hidden="true">🔒</span>{" "}Not included ({counts.locked})
        </button>

        <button
          type="button"
          className="filter-clear"
          onClick={() => onChange(null)}
          disabled={value === null}
          aria-disabled={value === null ? "true" : undefined}
        >
          Clear filter
        </button>
      </div>
    </div>
  );
}
