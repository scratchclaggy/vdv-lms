import { upsertAuthUser } from "./auth";
import { prisma } from "./clients";
import { TUTORS } from "./data/tutors";

export async function seedTutors(): Promise<Record<string, string>> {
  console.log("Seeding tutors...");
  const tutorIds: Record<string, string> = {};

  for (const tutor of TUTORS) {
    const id = await upsertAuthUser(tutor.email);
    tutorIds[tutor.seed] = id;

    await prisma.tutor.upsert({
      where: { id },
      update: {},
      create: {
        id,
        firstName: tutor.firstName,
        lastName: tutor.lastName,
        email: tutor.email,
      },
    });

    console.log(`  ${tutor.firstName} ${tutor.lastName} (${id})`);
  }

  return tutorIds;
}
