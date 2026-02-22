import { copycat } from "@snaplet/copycat";
import { prisma } from "./clients";
import { CONSULTATIONS } from "./data/consultations";

function consultationDates(seed: string): { startTime: Date; endTime: Date } {
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

  for (const [tutorSeed, studentSeed, consultationSeed] of CONSULTATIONS) {
    const { startTime, endTime } = consultationDates(consultationSeed);

    await prisma.consultation.create({
      data: {
        tutorId: tutorIds[tutorSeed],
        studentId: studentIds[studentSeed],
        reason: copycat.sentence(consultationSeed),
        startTime,
        endTime,
      },
    });

    console.log(`  ${consultationSeed}: ${tutorSeed} + ${studentSeed}`);
  }
}
