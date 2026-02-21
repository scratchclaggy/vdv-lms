import { faker } from "@faker-js/faker";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/db";
import { apiUrl, makeAuthUser, makeRequestParams } from "@/test/route-helpers";
import { StudentBuilder } from "@/test/builders/student-builder";
import { TutorBuilder } from "@/test/builders/tutor-builder";
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

describe("GET /api/students/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const studentId = faker.string.uuid();
    const request = new NextRequest(apiUrl(`/students/${studentId}`));
    const response = await GET(request, makeRequestParams(studentId));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns the student when they access their own record", async () => {
    const studentId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(studentId));
    vi.mocked(prisma.student.findUnique).mockResolvedValue(
      new StudentBuilder().withId(studentId).build() as never,
    );

    const request = new NextRequest(apiUrl(`/students/${studentId}`));
    const response = await GET(request, makeRequestParams(studentId));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(studentId);
  });

  it("does not look up tutor when the student accesses their own record", async () => {
    const studentId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(studentId));
    vi.mocked(prisma.student.findUnique).mockResolvedValue(
      new StudentBuilder().withId(studentId).build() as never,
    );

    const request = new NextRequest(apiUrl(`/students/${studentId}`));
    await GET(request, makeRequestParams(studentId));

    expect(prisma.tutor.findUnique).not.toHaveBeenCalled();
  });

  it("returns the student when a tutor accesses the record", async () => {
    const tutorId = faker.string.uuid();
    const studentId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(tutorId));
    vi.mocked(prisma.tutor.findUnique).mockResolvedValue(
      new TutorBuilder().withId(tutorId).build() as never,
    );
    vi.mocked(prisma.student.findUnique).mockResolvedValue(
      new StudentBuilder().withId(studentId).build() as never,
    );

    const request = new NextRequest(apiUrl(`/students/${studentId}`));
    const response = await GET(request, makeRequestParams(studentId));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(studentId);
  });

  it("returns 403 when a non-tutor third party accesses the record", async () => {
    const otherId = faker.string.uuid();
    const studentId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(otherId));
    vi.mocked(prisma.tutor.findUnique).mockResolvedValue(null);

    const request = new NextRequest(apiUrl(`/students/${studentId}`));
    const response = await GET(request, makeRequestParams(studentId));

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({ error: "Forbidden" });
    expect(prisma.student.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the student does not exist", async () => {
    const studentId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(studentId));
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);

    const request = new NextRequest(apiUrl(`/students/${studentId}`));
    const response = await GET(request, makeRequestParams(studentId));

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Student not found" });
  });

  it("returns 500 when the database throws", async () => {
    const studentId = faker.string.uuid();
    vi.mocked(getCurrentUser).mockResolvedValue(makeAuthUser(studentId));
    vi.mocked(prisma.student.findUnique).mockRejectedValue(
      new Error("DB error"),
    );

    const request = new NextRequest(apiUrl(`/students/${studentId}`));
    const response = await GET(request, makeRequestParams(studentId));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Failed to fetch student" });
  });
});
