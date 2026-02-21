import { faker } from "@faker-js/faker";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/db";
import { ConsultationBuilder } from "@/test/builders/consultation-builder";
import { apiUrl, makeAuthUser, makeRequestParams } from "@/test/route-helpers";
import { getCurrentUser } from "@/utils/auth";
import { GET } from "./route";

vi.mock("@/db", () => ({
  prisma: {
    tutor: { findMany: vi.fn(), findUnique: vi.fn() },
    student: { findUnique: vi.fn() },
    consultation: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  },
}));
vi.mock("@/utils/auth", () => ({ getCurrentUser: vi.fn() }));

describe("GET /api/consultations/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const consultationId = faker.string.uuid();
    const request = new NextRequest(
      apiUrl(`/consultations/${consultationId}`),
    );
    const response = await GET(request, makeRequestParams(consultationId));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorized" });
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

    const request = new NextRequest(
      apiUrl(`/consultations/${consultationId}`),
    );
    const response = await GET(request, makeRequestParams(consultationId));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(consultationId);
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

    const request = new NextRequest(
      apiUrl(`/consultations/${consultationId}`),
    );
    const response = await GET(request, makeRequestParams(consultationId));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(consultationId);
  });

  it("returns 404 when the consultation does not exist", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(null);

    const consultationId = faker.string.uuid();
    const request = new NextRequest(
      apiUrl(`/consultations/${consultationId}`),
    );
    const response = await GET(request, makeRequestParams(consultationId));

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Consultation not found" });
  });

  it("returns 403 when the user is unrelated to the consultation", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findUnique).mockResolvedValue(
      new ConsultationBuilder().build() as never,
    );

    const consultationId = faker.string.uuid();
    const request = new NextRequest(
      apiUrl(`/consultations/${consultationId}`),
    );
    const response = await GET(request, makeRequestParams(consultationId));

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({ error: "Forbidden" });
  });

  it("returns 500 when the database throws", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findUnique).mockRejectedValue(
      new Error("DB error"),
    );

    const consultationId = faker.string.uuid();
    const request = new NextRequest(
      apiUrl(`/consultations/${consultationId}`),
    );
    const response = await GET(request, makeRequestParams(consultationId));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Failed to fetch consultation" });
  });
});
