// src/app/(shell)/talent-discovery/student-profile/[studentId]/page.tsx
// Read-only student profile — recruiter context (TalentPortalShell).
// Back button returns to /talent-discovery.

import { notFound, redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import {
  getStudentPublicProfile,
  canViewStudentProfile,
} from "@/lib/services/student-services";
import StudentPublicProfileView from "@/components/talent-discovery/StudentPublicProfileView";

type Props = { params: Promise<{ studentId: string }> };

export default async function StudentProfilePage({ params }: Props) {
  const { studentId } = await params;

  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser?.id) redirect("/sign-in");

  const roleKeys: string[] = (sessionUser as Record<string, unknown>).roleKeys as string[] ?? [];
  if (!roleKeys.includes("RECRUITER") && !roleKeys.includes("ADMIN")) {
    redirect("/talent-discovery");
  }

  const allowed = await canViewStudentProfile(sessionUser.id, studentId);
  if (!allowed) notFound();

  const profile = await getStudentPublicProfile(studentId);
  if (!profile) notFound();

  return (
    <StudentPublicProfileView
      profile={profile}
      backHref="/talent-discovery"
      backLabel="Back to Talent Discovery"
    />
  );
}
