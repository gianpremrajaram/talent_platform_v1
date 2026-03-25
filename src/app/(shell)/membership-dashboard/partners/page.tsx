import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

export default async function PartnersPage() {
  const session = await getServerAuthSession();
  const roleKeys: string[] = (session?.user as any)?.roleKeys ?? [];
  if (!roleKeys.includes("ADMIN")) {
    redirect("/membership-dashboard");
  }
  redirect("/membership-dashboard/project");
}
