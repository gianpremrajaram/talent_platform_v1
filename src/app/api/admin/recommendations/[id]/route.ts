// src/app/api/admin/recommendations/[id]/route.ts
// Admin Recommendation Gateway (#35): revoke endpoint.
// DELETE /api/admin/recommendations/[id]. ADMIN only. Soft-revokes by setting
// revokedAt; the row is preserved so audit history survives.

import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { revokeRecommendation } from "@/lib/services/recommendations";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerAuthSession();
  const me = session?.user;
  const roleKeys: string[] = me?.roleKeys ?? [];
  if (!me?.id || !roleKeys.includes("ADMIN")) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const result = await revokeRecommendation(id);
  if (result.count === 0) {
    return NextResponse.json(
      { error: "Recommendation not found or already revoked." },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true });
}
