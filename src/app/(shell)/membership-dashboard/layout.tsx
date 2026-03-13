import AdminSidebar from "@/components/membership-dashboard/AdminSidebar";

export default function MembershipDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={{ flexGrow: 1, padding: "1.5rem", minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
