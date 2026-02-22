"use server";

import { createConsultationAction } from "@/app/consultations/create-consultation-action";
import { createConsultationSchema } from "@/app/consultations/create-consultation-schema";
import { ForbiddenError, UnauthorizedError } from "@/utils/errors";
import type { CreateConsultationInput } from "./create-consultation-schema";

export async function createConsultationFormAction(
  data: CreateConsultationInput,
): Promise<{ error: string } | undefined> {
  const result = createConsultationSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    date,
    startTime,
    endTime,
    tutorId,
    studentId,
    reason,
    timezoneOffset,
  } = result.data;

  // The user entered times in their local timezone. timezoneOffset is
  // getTimezoneOffset() — minutes *behind* UTC (positive = west of UTC).
  // Adding the offset converts local time to UTC.
  const toUtcIso = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const localMs =
      new Date(`${date}T00:00:00.000Z`).getTime() +
      (hours * 60 + minutes + timezoneOffset) * 60_000;
    return new Date(localMs).toISOString();
  };

  const startIso = toUtcIso(startTime);
  const endIso = toUtcIso(endTime);

  try {
    await createConsultationAction({
      tutorId,
      studentId,
      reason,
      startTime: startIso,
      endTime: endIso,
    });
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return { error: "You must be logged in" };
    }
    if (e instanceof ForbiddenError) {
      return { error: "You are not authorised to create this consultation" };
    }
    return { error: "Something went wrong. Please try again." };
  }
}
