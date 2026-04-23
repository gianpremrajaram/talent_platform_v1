"use client";

import { useRouter } from "next/navigation";

const backLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  marginBottom: "1rem",
  fontSize: "0.9rem",
  fontWeight: 500,
  color: "#1d4ed8",
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
} as const;

type BackLinkProps = {
  fallbackHref?: string;
  label?: string;
};

export default function BackLink({
  fallbackHref = "/",
  label = "Back",
}: BackLinkProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${label} to previous page`}
      style={backLinkStyle}
    >
      ← {label}
    </button>
  );
}
