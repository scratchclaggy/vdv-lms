import { faker } from "@faker-js/faker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/db";
import { ConsultationBuilder } from "@/test/builders/consultation-builder";
import { makeAuthUser } from "@/test/route-helpers";
import { getCurrentUser } from "@/utils/auth";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/errors";
import { getConsultationAction } from "./get-consultation-action";

vi.mock("@/db", () => ({
  prisma: {
    consultation: { findUnique: vi.fn() },
  },
}));
vi.mock("@/utils/auth", () => ({ getCurrentUser: vi.fn() }));

describe("getConsultationAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws UnauthorizedError when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    await expect(getConsultationAction(faker.string.uuid())).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("returns the consultation when requested by the student", async () => {
    const studentId = faker.string.uuid();
    const consultationId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(studentId));
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(
      new ConsultationBuilder()
        .withId(consultationId)
        .withStudent((b) => b.withId(studentId))
        .build() as never,
    );

    const result = await getConsultationAction(consultationId);

    expect(result.id).toBe(consultationId);
    expect(prisma.consultation.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: consultationId } }),
    );
  });

  it("returns the consultation when requested by the tutor", async () => {
    const tutorId = faker.string.uuid();
    const consultationId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(tutorId));
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(
      new ConsultationBuilder()
        .withId(consultationId)
        .withTutor((b) => b.withId(tutorId))
        .build() as never,
    );

    const result = await getConsultationAction(consultationId);

    expect(result.id).toBe(consultationId);
  });

  it("throws NotFoundError when the consultation does not exist", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(null);

    await expect(getConsultationAction(faker.string.uuid())).rejects.toThrow(
      NotFoundError,
    );
  });

  it("throws ForbiddenError when the user is unrelated to the consultation", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(
      new ConsultationBuilder().build() as never,
    );

    await expect(getConsultationAction(faker.string.uuid())).rejects.toThrow(
      ForbiddenError,
    );
  });

  it("propagates database errors", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findUnique).mockRejectedValue(
      new Error("DB error"),
    );

    await expect(getConsultationAction(faker.string.uuid())).rejects.toThrow(
      "DB error",
    );
  });
});
