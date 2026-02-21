import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { signupUser } from "@/test/api-helpers";
import { ConsultationBuilder } from "@/test/builders/consultation-builder";
import { StudentBuilder } from "@/test/builders/student-builder";
import { TutorBuilder } from "@/test/builders/tutor-builder";
import { deleteAuthUser, truncateTables } from "@/test/db-helpers";
import { db } from "@/test/integration-db";

test.afterEach(truncateTables);

test.describe("GET /api/consultations/[id]", () => {
  test("returns 401 when unauthenticated", async ({ request }) => {
    const id = faker.string.uuid();
    const response = await request.get(`/api/consultations/${id}`);
    expect(response.status()).toBe(401);
  });

  test("returns 404 when the consultation does not exist", async ({
    request,
  }) => {
    const user = await signupUser(request);
    try {
      const id = faker.string.uuid();
      const response = await request.get(`/api/consultations/${id}`);
      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: "Consultation not found" });
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("returns the consultation with nested tutor and student when requested by the student", async ({
    request,
  }) => {
    const user = await signupUser(request);
    try {
      const tutor = await db.tutor.create({
        data: new TutorBuilder().db(),
      });

      const reason = faker.lorem.sentence();
      const future = faker.date.soon({ days: 7 });
      const consultation = await db.consultation.create({
        data: new ConsultationBuilder()
          .withTutor((b) => b.withId(tutor.id))
          .withStudent((b) => b.withId(user.id))
          .withReason(reason)
          .withStartTime(future)
          .withEndTime(new Date(future.getTime() + 60 * 60 * 1000))
          .db(),
      });

      const response = await request.get(
        `/api/consultations/${consultation.id}`,
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toMatchObject({
        id: consultation.id,
        reason,
        tutorId: tutor.id,
        studentId: user.id,
      });
      expect(body.tutor.id).toBe(tutor.id);
      expect(body.student.id).toBe(user.id);
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("returns the consultation when requested by the tutor", async ({
    request,
  }) => {
    const user = await signupUser(request);
    try {
      await db.tutor.create({
        data: new TutorBuilder().withId(user.id).db(),
      });
      const student = await db.student.create({
        data: new StudentBuilder().db(),
      });

      const future = faker.date.soon({ days: 7 });
      const consultation = await db.consultation.create({
        data: new ConsultationBuilder()
          .withTutor((b) => b.withId(user.id))
          .withStudent((b) => b.withId(student.id))
          .withStartTime(future)
          .withEndTime(new Date(future.getTime() + 60 * 60 * 1000))
          .db(),
      });

      const response = await request.get(
        `/api/consultations/${consultation.id}`,
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(consultation.id);
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("returns 403 when the caller is unrelated to the consultation", async ({
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

      const future = faker.date.soon({ days: 7 });
      const consultation = await db.consultation.create({
        data: new ConsultationBuilder()
          .withTutor((b) => b.withId(tutor.id))
          .withStudent((b) => b.withId(student.id))
          .withStartTime(future)
          .withEndTime(new Date(future.getTime() + 60 * 60 * 1000))
          .db(),
      });

      const response = await request.get(
        `/api/consultations/${consultation.id}`,
      );

      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body).toEqual({ error: "Forbidden" });
    } finally {
      await deleteAuthUser(stranger.id);
    }
  });

  test("returns 404 (not 403) when an unrelated user requests a non-existent id", async ({
    request,
  }) => {
    const stranger = await signupUser(request);
    try {
      const id = faker.string.uuid();
      const response = await request.get(`/api/consultations/${id}`);
      expect(response.status()).toBe(404);
    } finally {
      await deleteAuthUser(stranger.id);
    }
  });
});
