import { upsertAuthUser } from "./auth";
import { prisma } from "./clients";
import { STUDENTS } from "./data/students";

export async function seedStudents(): Promise<Record<string, string>> {
  console.log("Seeding students...");
  const studentIds: Record<string, string> = {};

  for (const student of STUDENTS) {
    const id = await upsertAuthUser(student.email);
    studentIds[student.seed] = id;

    await prisma.student.upsert({
      where: { id },
      update: {},
      create: {
        id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      },
    });

    console.log(`  ${student.firstName} ${student.lastName} (${id})`);
  }

  return studentIds;
}
