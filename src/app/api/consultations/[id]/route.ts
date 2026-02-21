import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db";
import { getCurrentUser } from "@/utils/auth";

const updateSchema = z.object({
  reason: z.string().optional(),
  startTime: z.iso.datetime().optional(),
  endTime: z.iso.datetime().optional(),
  studentId: z.uuid().optional(),
  tutorId: z.uuid().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        tutor: true,
        student: true,
      },
    });

    if (!consultation) {
      return NextResponse.json(
        { error: "Consultation not found" },
        { status: 404 },
      );
    }

    if (
      consultation.tutorId !== authUser.id &&
      consultation.studentId !== authUser.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(consultation);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch consultation" },
      { status: 500 },
    );
  }
}
