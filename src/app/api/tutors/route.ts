import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db";

export async function GET(_request: NextRequest) {
  try {
    const tutors = await prisma.tutor.findMany();
    return NextResponse.json(tutors);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch tutors" },
      { status: 500 },
    );
  }
}
