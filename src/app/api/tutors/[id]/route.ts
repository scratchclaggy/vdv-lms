import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const tutor = await prisma.tutor.findUnique({
      where: { id },
      include: {
        consultations: {
          orderBy: { startTime: "asc" },
          where: { startTime: { gte: new Date() } },
        },
      },
    });

    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    return NextResponse.json(tutor);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch tutor" },
      { status: 500 },
    );
  }
}
