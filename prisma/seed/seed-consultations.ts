import { copycat } from "@snaplet/copycat";
import { ConsultationStatus } from "../../src/generated/prisma/enums";
import { prisma } from "./clients";
import { CONSULTATIONS } from "./data/consultations";

function futureDates(seed: string): { startTime: Date; endTime: Date } {
  const min = new Date();
  min.setDate(min.getDate() + 1);

  const max = new Date();
  max.setFullYear(max.getFullYear() + 1);

  const startTime = new Date(
    copycat.dateString(seed, {
      min: min.toISOString(),
      max: max.toISOString(),
    }),
  );
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
  return { startTime, endTime };
}

function pastDates(seed: string): { startTime: Date; endTime: Date } {
  const min = new Date();
  min.setFullYear(min.getFullYear() - 1);

  const max = new Date();
  max.setDate(max.getDate() - 1);

  const startTime = new Date(
    copycat.dateString(seed, {
      min: min.toISOString(),
      max: max.toISOString(),
    }),
  );
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
  return { startTime, endTime };
}

export async function seedConsultations(
  tutorIds: Record<string, string>,
  studentIds: Record<string, string>,
): Promise<void> {
  console.log("Seeding consultations...");
  const existingCount = await prisma.consultation.count();

  if (existingCount > 0) {
    console.log(`  Skipping — ${existingCount} consultation(s) already exist.`);
    return;
  }

  for (const [
    tutorSeed,
    studentSeed,
    consultationSeed,
    timing,
  ] of CONSULTATIONS) {
    const isPast = timing === "past";
    const { startTime, endTime } = isPast
      ? pastDates(consultationSeed)
      : futureDates(consultationSeed);

    await prisma.consultation.create({
      data: {
        tutorId: tutorIds[tutorSeed],
        studentId: studentIds[studentSeed],
        reason: copycat.sentence(consultationSeed),
        startTime,
        endTime,
        status: isPast
          ? ConsultationStatus.COMPLETED
          : ConsultationStatus.PENDING,
      },
    });

    console.log(
      `  ${consultationSeed}: ${tutorSeed} + ${studentSeed} (${timing})`,
    );
  }
}
