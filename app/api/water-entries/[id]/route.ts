// app/api/water-entries/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// DELETE a water entry
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify entry exists and belongs to user
    const existing = await prisma.waterEntry.findFirst({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Water entry not found" },
        { status: 404 }
      );
    }

    await prisma.waterEntry.delete({
      where: {
        id: (await params).id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting water entry:", error);
    return NextResponse.json(
      { error: "Failed to delete water entry" },
      { status: 500 }
    );
  }
}
