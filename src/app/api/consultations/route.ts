import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db";
import { getCurrentUser } from "@/utils/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const consultations = await prisma.consultation.findMany({
      where: {
        OR: [{ studentId: authUser.id }, { tutorId: authUser.id }],
        startTime: {
          gte: from ? new Date(from) : new Date(),
          lte: to ? new Date(to) : undefined,
        },
      },
      include: {
        tutor: true,
        student: true,
      },
      orderBy: { startTime: "asc" },
    });
    return NextResponse.json(consultations);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch consultations" },
      { status: 500 },
    );
  }
}

const createSchema = z.object({
  tutorId: z.string(),
  studentId: z.string(),
  reason: z.string(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
});

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validation = createSchema.safeParse(await request.json());

    if (!validation.success) {
      return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
    }

    const { tutorId, studentId, reason, startTime, endTime } = validation.data;

    const isStudent = authUser.id === studentId;
    const isTutor = authUser.id === tutorId;

    if (!isStudent && !isTutor) {
      return NextResponse.json(
        { error: "Cannot create consultations for this user" },
        { status: 403 },
      );
    }

    // If the caller is claiming the tutor role, verify they have a Tutor record.
    if (isTutor) {
      const tutorRecord = await prisma.tutor.findUnique({
        where: { id: tutorId },
      });
      if (!tutorRecord) {
        return NextResponse.json(
          { error: "Cannot create consultations for this user" },
          { status: 403 },
        );
      }
    }

    const consultation = await prisma.consultation.create({
      data: { tutorId, studentId, reason, startTime, endTime },
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create consultation" },
      { status: 500 },
    );
  }
}
