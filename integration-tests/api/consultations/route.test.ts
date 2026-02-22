import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { signupUser } from "@/test/api-helpers";
import { ConsultationBuilder } from "@/test/builders/consultation-builder";
import { StudentBuilder } from "@/test/builders/student-builder";
import { TutorBuilder } from "@/test/builders/tutor-builder";
import { daysAgo, daysFromNow } from "@/test/date-helpers";
import { deleteAuthUser, truncateTables } from "@/test/db-helpers";
import { db } from "@/test/integration-db";

test.afterEach(truncateTables);

test.describe("GET /api/consultations", () => {
  test("returns 401 when unauthenticated", async ({ request }) => {
    const response = await request.get("/api/consultations");
    expect(response.status()).toBe(401);
  });

  test("returns only consultations belonging to the authenticated user", async ({
    request,
  }) => {
    const studentA = await signupUser(request);
    try {
      const tutor = await db.tutor.create({
        data: new TutorBuilder().db(),
      });
      const studentB = await db.student.create({
        data: new StudentBuilder().db(),
      });

      const reasonA = faker.lorem.sentence();
      const future = daysFromNow(7);
      await db.consultation.createMany({
        data: [
          new ConsultationBuilder()
            .withTutor((b) => b.withId(tutor.id))
            .withStudent((b) => b.withId(studentA.id))
            .withReason(reasonA)
            .withStartTime(future)
            .db(),
          new ConsultationBuilder()
            .withTutor((b) => b.withId(tutor.id))
            .withStudent((b) => b.withId(studentB.id))
            .withStartTime(future)
            .db(),
        ],
      });

      const response = await request.get("/api/consultations");
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveLength(1);
      expect(body[0].reason).toBe(reasonA);
    } finally {
      await deleteAuthUser(studentA.id);
    }
  });

  test.describe("returns consultations by role", () => {
    test("returns the consultation for the authenticated student", async ({
      request,
    }) => {
      const tutorUser = await signupUser(request);
      let studentUser:
        | { id: string; email: string; password: string }
        | undefined;

      try {
        await db.tutor.create({
          data: new TutorBuilder().withId(tutorUser.id).db(),
        });

        studentUser = await signupUser(request);
        const studentId = studentUser.id;

        const future = daysFromNow(7);
        await db.consultation.create({
          data: new ConsultationBuilder()
            .withTutor((b) => b.withId(tutorUser.id))
            .withStudent((b) => b.withId(studentId))
            .withStartTime(future)
            .db(),
        });

        const resp = await request.get("/api/consultations");
        expect(resp.status()).toBe(200);
        expect(await resp.json()).toHaveLength(1);
      } finally {
        await deleteAuthUser(tutorUser.id);
        if (studentUser) await deleteAuthUser(studentUser.id);
      }
    });

    test("returns the consultation for the authenticated tutor", async ({
      request,
    }) => {
      const tutorUser = await signupUser(request);
      let studentUser:
        | { id: string; email: string; password: string }
        | undefined;

      try {
        await db.tutor.create({
          data: new TutorBuilder().withId(tutorUser.id).db(),
        });

        studentUser = await signupUser(request);
        const studentId = studentUser.id;

        const future = daysFromNow(7);
        await db.consultation.create({
          data: new ConsultationBuilder()
            .withTutor((b) => b.withId(tutorUser.id))
            .withStudent((b) => b.withId(studentId))
            .withStartTime(future)
            .db(),
        });

        await request.post("/api/auth/login", {
          data: { email: tutorUser.email, password: tutorUser.password },
        });

        const resp = await request.get("/api/consultations");
        expect(resp.status()).toBe(200);
        expect(await resp.json()).toHaveLength(1);
      } finally {
        await deleteAuthUser(tutorUser.id);
        if (studentUser) await deleteAuthUser(studentUser.id);
      }
    });
  });

  test("excludes past consultations by default (no query params)", async ({
    request,
  }) => {
    const user = await signupUser(request);
    try {
      const tutor = await db.tutor.create({
        data: new TutorBuilder().db(),
      });

      const past = daysAgo(7);
      const future = daysFromNow(7);
      const futureReason = faker.lorem.sentence();

      await db.consultation.createMany({
        data: [
          new ConsultationBuilder()
            .withTutor((b) => b.withId(tutor.id))
            .withStudent((b) => b.withId(user.id))
            .withStartTime(past)
            .db(),
          new ConsultationBuilder()
            .withTutor((b) => b.withId(tutor.id))
            .withStudent((b) => b.withId(user.id))
            .withReason(futureReason)
            .withStartTime(future)
            .db(),
        ],
      });

      const response = await request.get("/api/consultations");
      const body = await response.json();
      expect(body).toHaveLength(1);
      expect(body[0].reason).toBe(futureReason);
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("filters by from/to query params", async ({ request }) => {
    const user = await signupUser(request);
    try {
      const tutor = await db.tutor.create({
        data: new TutorBuilder().db(),
      });

      const before = new Date("2041-01-15T10:00:00Z");
      const inside = new Date("2041-06-15T10:00:00Z");
      const after = new Date("2041-12-15T10:00:00Z");
      const insideReason = faker.lorem.sentence();

      await db.consultation.createMany({
        data: [
          new ConsultationBuilder()
            .withTutor((b) => b.withId(tutor.id))
            .withStudent((b) => b.withId(user.id))
            .withStartTime(before)
            .db(),
          new ConsultationBuilder()
            .withTutor((b) => b.withId(tutor.id))
            .withStudent((b) => b.withId(user.id))
            .withReason(insideReason)
            .withStartTime(inside)
            .db(),
          new ConsultationBuilder()
            .withTutor((b) => b.withId(tutor.id))
            .withStudent((b) => b.withId(user.id))
            .withStartTime(after)
            .db(),
        ],
      });

      const params = new URLSearchParams({
        from: "2041-03-01T00:00:00Z",
        to: "2041-09-01T00:00:00Z",
      });
      const response = await request.get(
        `/api/consultations?${params.toString()}`,
      );

      const body = await response.json();
      expect(body).toHaveLength(1);
      expect(body[0].reason).toBe(insideReason);
    } finally {
      await deleteAuthUser(user.id);
    }
  });
});

test.describe("POST /api/consultations", () => {
  test("returns 401 when unauthenticated", async ({ request }) => {
    const response = await request.post("/api/consultations", {
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test("returns 400 for a malformed payload", async ({ request }) => {
    const user = await signupUser(request);
    try {
      const tutor = await db.tutor.create({
        data: new TutorBuilder().withId(user.id).db(),
      });

      const response = await request.post("/api/consultations", {
        data: { tutorId: tutor.id }, // missing required fields
      });
      expect(response.status()).toBe(400);
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("returns 403 when the caller is unrelated to both student and tutor", async ({
    request,
  }) => {
    const stranger = await signupUser(request);
    try {
      const tutor = await db.tutor.create({
        data: new TutorBuilder().db(),
      });
      const student = await db.student.create({
        data: new StudentBuilder().db(),
      });

      const future = daysFromNow(30);
      const response = await request.post("/api/consultations", {
        data: {
          tutorId: tutor.id,
          studentId: student.id,
          reason: faker.lorem.sentence(),
          startTime: future.toISOString(),
        },
      });
      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body).toEqual({
        error: "Cannot create consultations for this user",
      });
    } finally {
      await deleteAuthUser(stranger.id);
    }
  });

  test("returns 403 when a non-tutor user passes their own id as tutorId", async ({
    request,
  }) => {
    // A user who is not registered as a tutor should not be able to create a
    // consultation by placing their own id in the tutorId field.
    const user = await signupUser(request);
    try {
      const student = await db.student.create({
        data: new StudentBuilder().db(),
      });

      const future = daysFromNow(30);
      const response = await request.post("/api/consultations", {
        data: {
          tutorId: user.id,
          studentId: student.id,
          reason: faker.lorem.sentence(),
          startTime: future.toISOString(),
        },
      });

      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body).toEqual({
        error: "Cannot create consultations for this user",
      });
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("creates the consultation and returns 201 when submitted by the student", async ({
    request,
  }) => {
    const user = await signupUser(request);
    try {
      const tutor = await db.tutor.create({
        data: new TutorBuilder().db(),
      });

      const reason = faker.lorem.sentence();
      const future = daysFromNow(30);
      const response = await request.post("/api/consultations", {
        data: {
          tutorId: tutor.id,
          studentId: user.id,
          reason,
          startTime: future.toISOString(),
        },
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toMatchObject({
        tutorId: tutor.id,
        studentId: user.id,
        reason,
      });

      const saved = await db.consultation.findUnique({
        where: { id: body.id },
      });
      expect(saved).not.toBeNull();
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("creates the consultation when submitted by the tutor", async ({
    request,
  }) => {
    const user = await signupUser(request);
    try {
      // Add a Tutor row for this user
      await db.tutor.create({
        data: new TutorBuilder().withId(user.id).db(),
      });
      const student = await db.student.create({
        data: new StudentBuilder().db(),
      });

      const future = daysFromNow(30);
      const response = await request.post("/api/consultations", {
        data: {
          tutorId: user.id,
          studentId: student.id,
          reason: faker.lorem.sentence(),
          startTime: future.toISOString(),
        },
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      const saved = await db.consultation.findUnique({
        where: { id: body.id },
      });
      expect(saved).not.toBeNull();
    } finally {
      await deleteAuthUser(user.id);
    }
  });
});
