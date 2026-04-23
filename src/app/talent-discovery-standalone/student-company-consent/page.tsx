import { Box } from "@mui/material";
import StudentPortalShell from "@/components/talent-discovery/student-components/StudentPortalShell";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { redirect } from "next/navigation";
import CompanyAccessConsentCard from "@/components/talent-discovery/student-components/CompanyAccessConsentCard";
import { getMembersWithConsentStatus } from "@/lib/services/student-services";

export default async function StudentCompanyConsentPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser?.id) {
    redirect("/sign-in");
  }
  const userId = sessionUser.id;
  const membersStatus = await getMembersWithConsentStatus(userId);

  return (
    <StudentPortalShell
      title="Company Access Consent"
      userInitial={sessionUser.name?.charAt(0).toUpperCase() ?? ""}
    >
      <Box sx={{ p: 3, maxWidth: 1200, width: "100%", mx: "auto" }}>
        <CompanyAccessConsentCard members={membersStatus} />
      </Box>
    </StudentPortalShell>
  );
}
