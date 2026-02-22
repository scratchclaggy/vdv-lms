import { faker } from "@faker-js/faker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/db";
import { ConsultationBuilder } from "@/test/builders/consultation-builder";
import { TutorBuilder } from "@/test/builders/tutor-builder";
import { makeAuthUser } from "@/test/route-helpers";
import { getCurrentUser } from "@/utils/auth";
import { ForbiddenError, UnauthorizedError } from "@/utils/errors";
import { createConsultationAction } from "./create-consultation-action";

vi.mock("@/db", () => ({
  prisma: {
    tutor: { findUnique: vi.fn() },
    consultation: { create: vi.fn() },
  },
}));
vi.mock("@/utils/auth", () => ({ getCurrentUser: vi.fn() }));

describe("createConsultationAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws UnauthorizedError when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const consultation = new ConsultationBuilder().build();
    await expect(
      createConsultationAction({
        tutorId: consultation.tutorId,
        studentId: consultation.studentId,
        reason: consultation.reason,
        startTime: consultation.startTime.toISOString(),
        endTime: consultation.endTime.toISOString(),
      }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws ForbiddenError when the user is neither the student nor the tutor", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );

    const consultation = new ConsultationBuilder().build();
    await expect(
      createConsultationAction({
        tutorId: consultation.tutorId,
        studentId: consultation.studentId,
        reason: consultation.reason,
        startTime: consultation.startTime.toISOString(),
        endTime: consultation.endTime.toISOString(),
      }),
    ).rejects.toThrow(ForbiddenError);

    expect(prisma.consultation.create).not.toHaveBeenCalled();
  });

  it("creates and returns the consultation when the student submits", async () => {
    const tutorId = faker.string.uuid();
    const studentId = faker.string.uuid();
    const reason = "Help with algebra";
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(studentId));
    vi.mocked(prisma.consultation.create).mockResolvedValue(
      new ConsultationBuilder()
        .withTutor((b) => b.withId(tutorId))
        .withStudent((b) => b.withId(studentId))
        .withReason(reason)
        .build() as never,
    );

    const consultation = new ConsultationBuilder()
      .withTutor((b) => b.withId(tutorId))
      .withStudent((b) => b.withId(studentId))
      .withReason(reason)
      .build();

    const result = await createConsultationAction({
      tutorId: consultation.tutorId,
      studentId: consultation.studentId,
      reason: consultation.reason,
      startTime: consultation.startTime.toISOString(),
      endTime: consultation.endTime.toISOString(),
    });

    expect(result.student.id).toBe(studentId);
    expect(prisma.consultation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tutorId, studentId, reason }),
      }),
    );
  });

  it("creates the consultation when the tutor submits", async () => {
    const tutorId = faker.string.uuid();
    const studentId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(tutorId));
    vi.mocked(prisma.tutor.findUnique).mockResolvedValue(
      new TutorBuilder().withId(tutorId).db() as never,
    );
    vi.mocked(prisma.consultation.create).mockResolvedValue(
      new ConsultationBuilder()
        .withTutor((b) => b.withId(tutorId))
        .withStudent((b) => b.withId(studentId))
        .build() as never,
    );

    const consultation = new ConsultationBuilder()
      .withTutor((b) => b.withId(tutorId))
      .withStudent((b) => b.withId(studentId))
      .build();

    const result = await createConsultationAction({
      tutorId: consultation.tutorId,
      studentId: consultation.studentId,
      reason: consultation.reason,
      startTime: consultation.startTime.toISOString(),
      endTime: consultation.endTime.toISOString(),
    });

    expect(result.tutor.id).toBe(tutorId);
  });

  it("throws ForbiddenError when the tutor has no Tutor record", async () => {
    const tutorId = faker.string.uuid();
    const studentId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(tutorId));
    vi.mocked(prisma.tutor.findUnique).mockResolvedValue(null);

    const consultation = new ConsultationBuilder()
      .withTutor((b) => b.withId(tutorId))
      .withStudent((b) => b.withId(studentId))
      .build();

    await expect(
      createConsultationAction({
        tutorId: consultation.tutorId,
        studentId: consultation.studentId,
        reason: consultation.reason,
        startTime: consultation.startTime.toISOString(),
        endTime: consultation.endTime.toISOString(),
      }),
    ).rejects.toThrow(ForbiddenError);

    expect(prisma.consultation.create).not.toHaveBeenCalled();
  });

  it("propagates database errors", async () => {
    const studentId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(studentId));
    vi.mocked(prisma.consultation.create).mockRejectedValue(
      new Error("DB error"),
    );

    const consultation = new ConsultationBuilder()
      .withStudent((b) => b.withId(studentId))
      .build();

    await expect(
      createConsultationAction({
        tutorId: consultation.tutorId,
        studentId: consultation.studentId,
        reason: consultation.reason,
        startTime: consultation.startTime.toISOString(),
        endTime: consultation.endTime.toISOString(),
      }),
    ).rejects.toThrow("DB error");
  });
});
