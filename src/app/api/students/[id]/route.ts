import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db";
import { getCurrentUser } from "@/utils/auth";

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
    if (authUser.id !== id) {
      const isTutor = await prisma.tutor.findUnique({
        where: { id: authUser.id },
        select: { id: true },
      });

      if (!isTutor) {
        // The user is neither the student nor a tutor
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        consultations: {
          orderBy: { startTime: "asc" },
          where: { startTime: { gte: new Date() } },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 },
    );
  }
}
