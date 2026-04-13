import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import AdminPartnersPage from "@/components/membership-dashboard/AdminPartnersPage";

export default async function ProjectPage() {
  const session = await getServerAuthSession();
  const roleKeys: string[] = session?.user?.roleKeys ?? [];
  if (!roleKeys.includes("ADMIN")) {
    redirect("/membership-dashboard");
  }
  return <AdminPartnersPage />;
}
