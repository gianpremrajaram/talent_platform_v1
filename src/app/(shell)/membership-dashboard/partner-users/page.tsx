import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import AdminPartnerManagementPage from "@/components/membership-dashboard/AdminPartnerManagementPage";

export default async function PartnerUsersPage() {
  const session = await getServerAuthSession();
  const roleKeys: string[] = session?.user?.roleKeys ?? [];
  if (!roleKeys.includes("ADMIN")) {
    redirect("/membership-dashboard");
  }
  return <AdminPartnerManagementPage />;
}
