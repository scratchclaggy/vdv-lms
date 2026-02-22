"use server";

import { prisma } from "@/db";

export interface Tutor {
  id: string;
  firstName: string;
  lastName: string;
}

export async function getTutorsAction(): Promise<Tutor[]> {
  return prisma.tutor.findMany({
    select: { id: true, firstName: true, lastName: true },
  });
}
