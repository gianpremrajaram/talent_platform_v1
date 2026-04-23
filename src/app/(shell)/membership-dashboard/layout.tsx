import AdminPortalShell from "@/components/membership-dashboard/AdminPortalShell";

export default function MembershipDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPortalShell>{children}</AdminPortalShell>;
}
