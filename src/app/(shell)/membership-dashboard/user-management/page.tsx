import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import AdminUserManagementPage from "@/components/membership-dashboard/AdminUserManagementPage";

export default async function UserManagementPage() {
  const session = await getServerAuthSession();
  const roleKeys: string[] = session?.user?.roleKeys ?? [];
  if (!roleKeys.includes("ADMIN")) {
    redirect("/membership-dashboard");
  }
  return <AdminUserManagementPage />;
}
