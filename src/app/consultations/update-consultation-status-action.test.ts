import { faker } from "@faker-js/faker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/db";
import { ConsultationStatus } from "@/generated/prisma/enums";
import { ConsultationBuilder } from "@/test/builders/consultation-builder";
import { makeAuthUser } from "@/test/route-helpers";
import { getCurrentUser } from "@/utils/auth";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/errors";
import { updateConsultationStatusAction } from "./update-consultation-status-action";

vi.mock("@/db", () => ({
  prisma: {
    consultation: { findUnique: vi.fn(), update: vi.fn() },
  },
}));
vi.mock("@/utils/auth", () => ({ getCurrentUser: vi.fn() }));

describe("updateConsultationStatusAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws UnauthorizedError when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    await expect(
      updateConsultationStatusAction(
        faker.string.uuid(),
        ConsultationStatus.COMPLETED,
      ),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws NotFoundError when the consultation does not exist", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(null);

    await expect(
      updateConsultationStatusAction(
        faker.string.uuid(),
        ConsultationStatus.COMPLETED,
      ),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ForbiddenError when the user is unrelated to the consultation", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(
      new ConsultationBuilder().build() as never,
    );

    await expect(
      updateConsultationStatusAction(
        faker.string.uuid(),
        ConsultationStatus.COMPLETED,
      ),
    ).rejects.toThrow(ForbiddenError);
  });

  it("updates and returns the consultation when called by the tutor", async () => {
    const tutorId = faker.string.uuid();
    const consultationId = faker.string.uuid();
    const existing = new ConsultationBuilder()
      .withId(consultationId)
      .withTutor((b) => b.withId(tutorId))
      .build();
    const updated = new ConsultationBuilder()
      .withId(consultationId)
      .withTutor((b) => b.withId(tutorId))
      .withStatus(ConsultationStatus.COMPLETED)
      .build();

    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(tutorId));
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(
      existing as never,
    );
    vi.mocked(prisma.consultation.update).mockResolvedValue(updated as never);

    const result = await updateConsultationStatusAction(
      consultationId,
      ConsultationStatus.COMPLETED,
    );

    expect(result.id).toBe(consultationId);
    expect(result.status).toBe(ConsultationStatus.COMPLETED);
    expect(prisma.consultation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: consultationId },
        data: { status: ConsultationStatus.COMPLETED },
      }),
    );
  });

  it("updates and returns the consultation when called by the student", async () => {
    const studentId = faker.string.uuid();
    const consultationId = faker.string.uuid();
    const existing = new ConsultationBuilder()
      .withId(consultationId)
      .withStudent((b) => b.withId(studentId))
      .build();
    const updated = new ConsultationBuilder()
      .withId(consultationId)
      .withStudent((b) => b.withId(studentId))
      .withStatus(ConsultationStatus.COMPLETED)
      .build();

    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(studentId));
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(
      existing as never,
    );
    vi.mocked(prisma.consultation.update).mockResolvedValue(updated as never);

    const result = await updateConsultationStatusAction(
      consultationId,
      ConsultationStatus.COMPLETED,
    );

    expect(result.id).toBe(consultationId);
    expect(result.status).toBe(ConsultationStatus.COMPLETED);
  });

  it("updates status to PENDING when called by the tutor (mark pending)", async () => {
    const tutorId = faker.string.uuid();
    const consultationId = faker.string.uuid();
    const existing = new ConsultationBuilder()
      .withId(consultationId)
      .withTutor((b) => b.withId(tutorId))
      .withStatus(ConsultationStatus.COMPLETED)
      .build();
    const updated = new ConsultationBuilder()
      .withId(consultationId)
      .withTutor((b) => b.withId(tutorId))
      .withStatus(ConsultationStatus.PENDING)
      .build();

    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(tutorId));
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(
      existing as never,
    );
    vi.mocked(prisma.consultation.update).mockResolvedValue(updated as never);

    const result = await updateConsultationStatusAction(
      consultationId,
      ConsultationStatus.PENDING,
    );

    expect(result.id).toBe(consultationId);
    expect(result.status).toBe(ConsultationStatus.PENDING);
    expect(prisma.consultation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: consultationId },
        data: { status: ConsultationStatus.PENDING },
      }),
    );
  });

  it("updates status to PENDING when called by the student (mark pending)", async () => {
    const studentId = faker.string.uuid();
    const consultationId = faker.string.uuid();
    const existing = new ConsultationBuilder()
      .withId(consultationId)
      .withStudent((b) => b.withId(studentId))
      .withStatus(ConsultationStatus.COMPLETED)
      .build();
    const updated = new ConsultationBuilder()
      .withId(consultationId)
      .withStudent((b) => b.withId(studentId))
      .withStatus(ConsultationStatus.PENDING)
      .build();

    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(studentId));
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(
      existing as never,
    );
    vi.mocked(prisma.consultation.update).mockResolvedValue(updated as never);

    const result = await updateConsultationStatusAction(
      consultationId,
      ConsultationStatus.PENDING,
    );

    expect(result.id).toBe(consultationId);
    expect(result.status).toBe(ConsultationStatus.PENDING);
    expect(prisma.consultation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: consultationId },
        data: { status: ConsultationStatus.PENDING },
      }),
    );
  });

  it("propagates database errors from findUnique", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findUnique).mockRejectedValue(
      new Error("DB error"),
    );

    await expect(
      updateConsultationStatusAction(
        faker.string.uuid(),
        ConsultationStatus.COMPLETED,
      ),
    ).rejects.toThrow("DB error");
  });

  it("propagates database errors from update", async () => {
    const tutorId = faker.string.uuid();
    const consultationId = faker.string.uuid();

    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(tutorId));
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(
      new ConsultationBuilder()
        .withId(consultationId)
        .withTutor((b) => b.withId(tutorId))
        .build() as never,
    );
    vi.mocked(prisma.consultation.update).mockRejectedValue(
      new Error("DB error"),
    );

    await expect(
      updateConsultationStatusAction(
        consultationId,
        ConsultationStatus.COMPLETED,
      ),
    ).rejects.toThrow("DB error");
  });
});
