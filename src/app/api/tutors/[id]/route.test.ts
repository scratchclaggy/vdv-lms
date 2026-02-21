import { faker } from "@faker-js/faker";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/db";
import { TutorBuilder } from "@/test/builders/tutor-builder";
import { apiUrl, makeRequestParams } from "@/test/route-helpers";
import { GET } from "./route";

vi.mock("@/db", () => ({
  prisma: {
    tutor: { findMany: vi.fn(), findUnique: vi.fn() },
    student: { findUnique: vi.fn() },
    consultation: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  },
}));

describe("GET /api/tutors/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns the tutor with their consultations when found", async () => {
    const tutorId = faker.string.uuid();
    const tutor = new TutorBuilder()
      .withId(tutorId)
      .withConsultation((consultation) => consultation.build())
      .build();
    vi.mocked(prisma.tutor.findUnique).mockResolvedValue(tutor);

    const request = new NextRequest(apiUrl(`/tutors/${tutorId}`));
    const response = await GET(request, makeRequestParams(tutorId));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(tutorId);
    expect(body.consultations).toHaveLength(1);
    expect(prisma.tutor.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: tutorId },
      }),
    );
  });

  it("returns 404 when the tutor does not exist", async () => {
    const tutorId = faker.string.uuid();
    vi.mocked(prisma.tutor.findUnique).mockResolvedValue(null);

    const request = new NextRequest(apiUrl(`/tutors/${tutorId}`));
    const response = await GET(request, makeRequestParams(tutorId));

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Tutor not found" });
  });

  it("returns 500 when the database throws", async () => {
    const tutorId = faker.string.uuid();
    vi.mocked(prisma.tutor.findUnique).mockRejectedValue(new Error("DB error"));

    const request = new NextRequest(apiUrl(`/tutors/${tutorId}`));
    const response = await GET(request, makeRequestParams(tutorId));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Failed to fetch tutor" });
  });
});
