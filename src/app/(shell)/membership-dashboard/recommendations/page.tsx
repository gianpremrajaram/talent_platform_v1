import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import AdminRecommendationPage from "@/components/membership-dashboard/AdminRecommendationPage";

export default async function RecommendationsPage() {
  const session = await getServerAuthSession();
  const roleKeys: string[] = session?.user?.roleKeys ?? [];
  if (!roleKeys.includes("ADMIN")) {
    redirect("/membership-dashboard");
  }
  return <AdminRecommendationPage />;
}
