import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const secret = speakeasy.generateSecret({
      name: `Talent Platform (${user.email})`,
      issuer: "Talent Platform",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twofaTempSecret: secret.base32,
      },
    });

    console.log("Generated secret:", secret);

    return NextResponse.json({
      otpauth_url: secret.otpauth_url,
      base32: secret.base32,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to start 2FA setup" },
      { status: 500 }
    );
  }
}