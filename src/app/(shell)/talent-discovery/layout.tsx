import TalentPortalShell from "@/components/talent-discovery/TalentPortalShell";

export default function TalentDiscoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TalentPortalShell>{children}</TalentPortalShell>;
}
