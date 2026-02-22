"use server";

import { prisma } from "@/db";
import type { ActionResult } from "@/utils/action-result";
import { getCurrentUser } from "@/utils/auth";
import {
  type CreateConsultationActionInput,
  createConsultationActionSchema,
} from "./create-consultation-schema";
import type { ConsultationWithRelations } from "./types";

export async function createConsultationAction(
  data: CreateConsultationActionInput,
): Promise<ActionResult<ConsultationWithRelations>> {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return { error: "You must be logged in", status: 401 };
  }

  const parsed = createConsultationActionSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid input", status: 400 };
  }

  const { tutorId, studentId, reason, startTime } = parsed.data;

  const isStudent = authUser.id === studentId;
  const isTutor = authUser.id === tutorId;

  if (!isStudent && !isTutor) {
    return { error: "Cannot create consultations for this user", status: 403 };
  }

  if (isTutor) {
    const tutorRecord = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });
    if (!tutorRecord) {
      return {
        error: "Cannot create consultations for this user",
        status: 403,
      };
    }
  }

  const consultation = await prisma.consultation.create({
    data: { tutorId, studentId, reason, startTime },
    include: { tutor: true, student: true },
  });

  return { data: consultation };
}
