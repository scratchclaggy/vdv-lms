import { faker } from "@faker-js/faker";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/db";
import { ConsultationBuilder } from "@/test/builders/consultation-builder";
import { TutorBuilder } from "@/test/builders/tutor-builder";
import { apiUrl, makeAuthUser } from "@/test/route-helpers";
import { getCurrentUser } from "@/utils/auth";
import { GET, POST } from "./route";

vi.mock("@/db", () => ({
  prisma: {
    tutor: { findMany: vi.fn(), findUnique: vi.fn() },
    student: { findUnique: vi.fn() },
    consultation: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  },
}));
vi.mock("@/utils/auth", () => ({ getCurrentUser: vi.fn() }));

describe("GET /api/consultations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const request = new NextRequest(apiUrl("/consultations"));
    const response = await GET(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorized" });
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

    const request = new NextRequest(apiUrl("/consultations"));
    const response = await GET(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe(consultationId);
    expect(prisma.consultation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ studentId: userId }, { tutorId: userId }],
        }),
      }),
    );
  });

  it("passes from/to query params as date filters", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findMany).mockResolvedValue([]);

    const from = "2030-01-01T00:00:00Z";
    const to = "2030-12-31T00:00:00Z";
    const request = new NextRequest(apiUrl("/consultations", { from, to }));
    await GET(request);

    const call = vi.mocked(prisma.consultation.findMany).mock.calls[0][0] as {
      where: { startTime: { gte: Date; lte: Date } };
    };
    expect(call.where.startTime.gte).toEqual(new Date(from));
    expect(call.where.startTime.lte).toEqual(new Date(to));
  });

  it("returns 500 when the database throws", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );
    vi.mocked(prisma.consultation.findMany).mockRejectedValue(
      new Error("DB error"),
    );

    const request = new NextRequest(apiUrl("/consultations"));
    const response = await GET(request);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Failed to fetch consultations" });
  });
});

describe("POST /api/consultations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const consultation = new ConsultationBuilder().build();
    const request = new NextRequest(apiUrl("/consultations"), {
      method: "POST",
      body: JSON.stringify({
        tutorId: consultation.tutorId,
        studentId: consultation.studentId,
        reason: consultation.reason,
        startTime: consultation.startTime.toISOString(),
        endTime: consultation.endTime.toISOString(),
      }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 400 for a malformed payload", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );

    const request = new NextRequest(apiUrl("/consultations"), {
      method: "POST",
      body: JSON.stringify({ tutorId: faker.string.uuid() }), // missing required fields
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "Malformed payload" });
  });

  it("returns 403 when the user is neither the student nor the tutor", async () => {
    const tutorId = faker.string.uuid();
    const studentId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(
      makeAuthUser(faker.string.uuid()),
    );

    const consultation = new ConsultationBuilder()
      .withTutor((b) => b.withId(tutorId))
      .withStudent((b) => b.withId(studentId))
      .build();
    const request = new NextRequest(apiUrl("/consultations"), {
      method: "POST",
      body: JSON.stringify({
        tutorId: consultation.tutorId,
        studentId: consultation.studentId,
        reason: consultation.reason,
        startTime: consultation.startTime.toISOString(),
        endTime: consultation.endTime.toISOString(),
      }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({
      error: "Cannot create consultations for this user",
    });
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
    const request = new NextRequest(apiUrl("/consultations"), {
      method: "POST",
      body: JSON.stringify({
        tutorId: consultation.tutorId,
        studentId: consultation.studentId,
        reason: consultation.reason,
        startTime: consultation.startTime.toISOString(),
        endTime: consultation.endTime.toISOString(),
      }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.student.id).toBe(studentId);
    expect(prisma.consultation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tutorId,
          studentId,
          reason,
        }),
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
    const request = new NextRequest(apiUrl("/consultations"), {
      method: "POST",
      body: JSON.stringify({
        tutorId: consultation.tutorId,
        studentId: consultation.studentId,
        reason: consultation.reason,
        startTime: consultation.startTime.toISOString(),
        endTime: consultation.endTime.toISOString(),
      }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
  });

  it("returns 500 when the database throws", async () => {
    const studentId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(studentId));
    vi.mocked(prisma.consultation.create).mockRejectedValue(
      new Error("DB error"),
    );

    const consultation = new ConsultationBuilder()
      .withStudent((b) => b.withId(studentId))
      .build();
    const request = new NextRequest(apiUrl("/consultations"), {
      method: "POST",
      body: JSON.stringify({
        tutorId: consultation.tutorId,
        studentId: consultation.studentId,
        reason: consultation.reason,
        startTime: consultation.startTime.toISOString(),
        endTime: consultation.endTime.toISOString(),
      }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Failed to create consultation" });
  });
});
