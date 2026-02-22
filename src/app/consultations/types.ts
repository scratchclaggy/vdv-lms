import type { Prisma } from "@/generated/prisma/client";

export type ConsultationWithRelations = Prisma.ConsultationGetPayload<{
  include: { tutor: true; student: true };
}>;
