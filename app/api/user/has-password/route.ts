// API Route: /api/user/has-password
// GET - Check if user has a password-based account (not OAuth only)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has a credential-based account (password)
    const credentialAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "credential", // Better Auth uses "credential" for email/password
      },
      select: {
        id: true,
        password: true,
      },
    });

    // User has a password if:
    // 1. Credential account exists
    // 2. Password field is not null
    const hasPassword =
      credentialAccount !== null && credentialAccount.password !== null;

    return NextResponse.json({
      hasPassword,
    });
  } catch (error) {
    console.error("Error checking password status:", error);
    return NextResponse.json(
      { error: "Failed to check password status" },
      { status: 500 }
    );
  }
}
