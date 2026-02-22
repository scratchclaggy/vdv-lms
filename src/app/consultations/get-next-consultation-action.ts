"use server";

import { prisma } from "@/db";
import { getCurrentUser } from "@/utils/auth";
import { UnauthorizedError } from "@/utils/errors";
import type { ConsultationWithRelations } from "./types";

export async function getNextConsultationAction(): Promise<ConsultationWithRelations | null> {
  const authUser = await getCurrentUser();
  if (!authUser) {
    throw new UnauthorizedError();
  }

  const consultation = await prisma.consultation.findFirst({
    where: {
      OR: [{ studentId: authUser.id }, { tutorId: authUser.id }],
      startTime: { gte: new Date() },
    },
    include: {
      tutor: true,
      student: true,
    },
    orderBy: { startTime: "asc" },
  });

  return consultation;
}
