import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

export default async function PartnerManagementPage() {
  const session = await getServerAuthSession();
  const roleKeys: string[] = session?.user?.roleKeys ?? [];
  if (!roleKeys.includes("ADMIN")) {
    redirect("/membership-dashboard");
  }
  redirect("/membership-dashboard/user-management");
}
