"use server";

import { prisma } from "@/db";
import { getCurrentUser } from "@/utils/auth";
import { ForbiddenError, UnauthorizedError } from "@/utils/errors";
import type { ConsultationWithRelations } from "./types";

export async function createConsultationAction(data: {
  tutorId: string;
  studentId: string;
  reason: string;
  startTime: string;
  endTime: string;
}): Promise<ConsultationWithRelations> {
  const authUser = await getCurrentUser();
  if (!authUser) {
    throw new UnauthorizedError();
  }

  const { tutorId, studentId, reason, startTime, endTime } = data;

  const isStudent = authUser.id === studentId;
  const isTutor = authUser.id === tutorId;

  if (!isStudent && !isTutor) {
    throw new ForbiddenError("Cannot create consultations for this user");
  }

  if (isTutor) {
    const tutorRecord = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });
    if (!tutorRecord) {
      throw new ForbiddenError("Cannot create consultations for this user");
    }
  }

  const consultation = await prisma.consultation.create({
    data: { tutorId, studentId, reason, startTime, endTime },
    include: { tutor: true, student: true },
  });

  return consultation;
}
