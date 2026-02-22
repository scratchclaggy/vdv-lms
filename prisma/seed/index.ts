import { prisma } from "./clients";
import { seedConsultations } from "./seed-consultations";
import { seedStudents } from "./seed-students";
import { seedTutors } from "./seed-tutors";

process.loadEnvFile(".env.local");

async function main() {
  const tutorIds = await seedTutors();
  const studentIds = await seedStudents();
  await seedConsultations(tutorIds, studentIds);
  console.log("Done.");
}

main().finally(() => prisma.$disconnect());
