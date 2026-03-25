import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import AdminStudentManagementPage from "@/components/membership-dashboard/AdminStudentManagementPage";

export default async function StudentUsersPage() {
  const session = await getServerAuthSession();
  const roleKeys: string[] = (session?.user as any)?.roleKeys ?? [];
  if (!roleKeys.includes("ADMIN")) {
    redirect("/membership-dashboard");
  }
  return <AdminStudentManagementPage />;
}
