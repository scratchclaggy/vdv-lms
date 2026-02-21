import { faker } from "@faker-js/faker";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/db";
import { TutorBuilder } from "@/test/builders/tutor-builder";
import { apiUrl } from "@/test/route-helpers";
import { GET } from "./route";

vi.mock("@/db", () => ({
  prisma: {
    tutor: { findMany: vi.fn(), findUnique: vi.fn() },
    student: { findUnique: vi.fn() },
    consultation: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  },
}));

describe("GET /api/tutors", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns the list of tutors with 200", async () => {
    const email = faker.internet.email();
    const tutors = [
      new TutorBuilder().withEmail(email).build(),
      new TutorBuilder().build(),
    ];
    vi.mocked(prisma.tutor.findMany).mockResolvedValue(tutors);

    const request = new NextRequest(apiUrl("/tutors"));
    const response = await GET(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveLength(2);
    expect(body[0].email).toBe(email);
    expect(prisma.tutor.findMany).toHaveBeenCalledOnce();
  });

  it("returns an empty array when no tutors exist", async () => {
    vi.mocked(prisma.tutor.findMany).mockResolvedValue([]);

    const request = new NextRequest(apiUrl("/tutors"));
    const response = await GET(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual([]);
  });

  it("returns 500 when the database throws", async () => {
    vi.mocked(prisma.tutor.findMany).mockRejectedValue(new Error("DB error"));

    const request = new NextRequest(apiUrl("/tutors"));
    const response = await GET(request);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Failed to fetch tutors" });
  });
});
