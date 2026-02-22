"use server";

import { prisma } from "@/db";
import { getCurrentUser } from "@/utils/auth";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/errors";
import type { ConsultationWithRelations } from "./types";

export async function getConsultationAction(
  id: string,
): Promise<ConsultationWithRelations> {
  const authUser = await getCurrentUser();
  if (!authUser) {
    throw new UnauthorizedError();
  }

  const consultation = await prisma.consultation.findUnique({
    where: { id },
    include: {
      tutor: true,
      student: true,
    },
  });

  if (!consultation) {
    throw new NotFoundError("Consultation not found");
  }

  if (
    consultation.tutorId !== authUser.id &&
    consultation.studentId !== authUser.id
  ) {
    throw new ForbiddenError();
  }

  return consultation;
}
