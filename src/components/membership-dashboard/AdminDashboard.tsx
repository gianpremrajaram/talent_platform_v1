// src/components/membership-dashboard/AdminDashboard.tsx
import AdminDashboardClient from "./AdminDashboardClient";
import AdminSidebar from "./AdminSidebar";
import type { AdminDashboardSummary } from "@/lib/membership-dashboard";
import type {
  AdminBenefitRedemptionStat,
  AdminMemberListItem,
  AdminSelectedMember,
} from "@/lib/membership-dashboard-admin";
import type { HandbookRenderResult } from "@/lib/handbook";

type AdminDashboardProps = AdminDashboardSummary & {
  title?: string;
  intro?: string;

  totalUsers: number;
  payingRevenue: number;
  mostUtilisedBenefitLabel: string;

  members: AdminMemberListItem[];
  selectedUserId?: string | null;
  selectedMember: AdminSelectedMember | null;

  benefitStats: AdminBenefitRedemptionStat[];

  initialTab?: string | null;
  handbook: HandbookRenderResult;
};

function gbp(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function AdminDashboard({
  totalMembers,
  title = "Membership Dashboard – Admin View",
  intro,
  totalUsers,
  payingRevenue,
  mostUtilisedBenefitLabel,
  members,
  selectedUserId = null,
  selectedMember,
  benefitStats,
  initialTab = null,
  handbook,
}: AdminDashboardProps) {
  return (
    <div style={{ paddingTop: "16px", paddingBottom: "16px", width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "230px minmax(0, 1fr)", gap: "24px", alignItems: "start" }}>
        <div style={{ position: "sticky", top: "16px" }}>
          <AdminSidebar />
        </div>

        <div className="admin-dashboard">
          <header className="content-header">
            <h1>{title}</h1>
            {intro && <p>{intro}</p>}
          </header>

          <section className="admin-section">
            <h2 style={{ marginTop: 0 }}>Overview</h2>

            <p>
              The platform has <strong>{totalUsers}</strong> registered users, of
              which <strong>{totalMembers}</strong> are members of the Friends of
              UCL Computer Science programme. Paying members bring in{" "}
              <strong>{gbp(payingRevenue)}</strong> revenue. The most utilised
              benefit is <strong>{mostUtilisedBenefitLabel}</strong>.
            </p>
          </section>

          <AdminDashboardClient
            members={members}
            selectedUserId={selectedUserId}
            selectedMember={selectedMember}
            benefitStats={benefitStats}
            initialTab={initialTab}
            handbook={handbook}
          />
        </div>
      </div>
    </div>
  );
}
