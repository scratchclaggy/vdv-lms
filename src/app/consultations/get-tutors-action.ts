"use server";

import { prisma } from "@/db";
import { getCurrentUser } from "@/utils/auth";
import { UnauthorizedError } from "@/utils/errors";

export interface Tutor {
  id: string;
  firstName: string;
  lastName: string;
}

export async function getTutorsAction(): Promise<Tutor[]> {
  const authUser = await getCurrentUser();
  if (!authUser) {
    throw new UnauthorizedError();
  }

  return prisma.tutor.findMany({
    select: { id: true, firstName: true, lastName: true },
  });
}
