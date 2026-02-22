"use server";

import { prisma } from "@/db";
import { getCurrentUser } from "@/utils/auth";
import { UnauthorizedError } from "@/utils/errors";
import type { ConsultationWithRelations } from "./types";

export async function getConsultationsAction(
  from?: string,
  to?: string,
): Promise<ConsultationWithRelations[]> {
  const authUser = await getCurrentUser();
  if (!authUser) {
    throw new UnauthorizedError();
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

  return consultations;
}
