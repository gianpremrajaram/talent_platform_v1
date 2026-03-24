import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

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

    if (!user.twofaTempSecret) {
      return NextResponse.json(
        { error: "2FA setup not started" },
        { status: 400 }
      );
    }

    const verified = speakeasy.totp.verify({
      secret: user.twofaTempSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    console.log("Token received:", token);
    console.log("Temp secret:", user.twofaTempSecret);  

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid code" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twofa: true,
        twofaSecret: user.twofaTempSecret,
        twofaTempSecret: null,
      },
    });

    const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    });
    
    console.log("Verified result:", verified);
    console.log("Updated user:", updatedUser);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}