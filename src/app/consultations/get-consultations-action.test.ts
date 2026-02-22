import { faker } from "@faker-js/faker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/db";
import { ConsultationBuilder } from "@/test/builders/consultation-builder";
import { makeAuthUser } from "@/test/route-helpers";
import { getCurrentUser } from "@/utils/auth";
import { UnauthorizedError } from "@/utils/errors";
import { getConsultationsAction } from "./get-consultations-action";

vi.mock("@/db", () => ({
  prisma: {
    consultation: { findMany: vi.fn() },
  },
}));
vi.mock("@/utils/auth", () => ({ getCurrentUser: vi.fn() }));

describe("getConsultationsAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws UnauthorizedError when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    await expect(getConsultationsAction()).rejects.toThrow(UnauthorizedError);
  });

  it("returns consultations for the authenticated user", async () => {
    const userId = faker.string.uuid();
    const consultationId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(userId));
    vi.mocked(prisma.consultation.findMany).mockResolvedValue([
      new ConsultationBuilder()
        .withId(consultationId)
        .withStudent((b) => b.withId(userId))
        .build(),
    ] as never);

    const result = await getConsultationsAction();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(consultationId);
    expect(prisma.consultation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ studentId: userId }, { tutorId: userId }],
        }),
      }),
    );
  });

  it("passes from/to params as date filters", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findMany).mockResolvedValue([]);

    const from = "2030-01-01T00:00:00Z";
    const to = "2030-12-31T00:00:00Z";
    await getConsultationsAction(from, to);

    const call = vi.mocked(prisma.consultation.findMany).mock.calls[0][0] as {
      where: { startTime: { gte: Date; lte: Date } };
    };
    expect(call.where.startTime.gte).toEqual(new Date(from));
    expect(call.where.startTime.lte).toEqual(new Date(to));
  });

  it("propagates database errors", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findMany).mockRejectedValue(
      new Error("DB error"),
    );

    await expect(getConsultationsAction()).rejects.toThrow("DB error");
  });
});
