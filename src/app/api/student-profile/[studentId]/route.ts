// src/app/api/student-profile/[studentId]/route.ts
// Privacy-safe student profile endpoint for recruiters and admins.
// Enforces consent/application-based access control server-side.

import { getServerAuthSession } from "@/lib/getServerAuthSession";
import {
  getStudentPublicProfile,
  canViewStudentProfile,
} from "@/lib/services/student-services";
import { ok, err } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const session = await getServerAuthSession();
  if (!session?.user) return err("UNAUTHORIZED");

  const viewerId = session.user.id;
  const roleKeys: string[] = (session.user as Record<string, unknown>).roleKeys as string[] ?? [];

  // Only recruiters and admins can access this endpoint
  if (!roleKeys.includes("RECRUITER") && !roleKeys.includes("ADMIN")) {
    return err("FORBIDDEN", "Only recruiters and admins can view student profiles.");
  }

  const { studentId } = await params;

  const allowed = await canViewStudentProfile(viewerId, studentId);
  if (!allowed) {
    return err("FORBIDDEN", "You do not have permission to view this student's profile.");
  }

  const profile = await getStudentPublicProfile(studentId);
  if (!profile) return err("NOT_FOUND", "Student not found.");

  return ok(profile);
}
