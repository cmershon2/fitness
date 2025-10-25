// API Route: /api/user/change-password
// POST - Change user password using Better Auth

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, revokeOtherSessions } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Use Better Auth's built-in changePassword API
    try {
      const data = await auth.api.changePassword({
        body: {
          newPassword,
          currentPassword,
          revokeOtherSessions: revokeOtherSessions ?? false,
        },
        // This endpoint requires session cookies
        headers: await headers(),
      });

      return NextResponse.json({
        message: "Password changed successfully",
        data,
      });
    } catch (error: any) {
      // Better Auth will throw specific errors
      console.error("Password change error:", error);

      // Handle specific Better Auth errors
      if (
        error.message?.includes("Invalid password") ||
        error.message?.includes("current password")
      ) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }

      if (
        error.message?.includes("OAuth") ||
        error.message?.includes("provider")
      ) {
        return NextResponse.json(
          { error: "Password change not available for OAuth accounts" },
          { status: 400 }
        );
      }

      // Generic error
      return NextResponse.json(
        { error: "Failed to change password" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in change password route:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
