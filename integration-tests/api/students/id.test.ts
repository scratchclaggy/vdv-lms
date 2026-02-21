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

test.describe("GET /api/students/[id]", () => {
  test("returns 401 when unauthenticated", async ({ request }) => {
    const id = faker.string.uuid();
    const response = await request.get(`/api/students/${id}`);
    expect(response.status()).toBe(401);
  });

  test("returns 404 when the student does not exist", async ({ request }) => {
    const user = await signupUser(request);

    try {
      await db.student.delete({ where: { id: user.id } });

      const response = await request.get(`/api/students/${user.id}`);
      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: "Student not found" });
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("returns the student when they access their own record", async ({
    request,
  }) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await signupUser(request, { firstName, lastName });

    try {
      const response = await request.get(`/api/students/${user.id}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toMatchObject({
        id: user.id,
        firstName,
        lastName,
      });
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("returns the student when a registered tutor accesses the record", async ({
    request,
  }) => {
    const tutorUser = await signupUser(request);

    try {
      await db.tutor.create({
        data: new TutorBuilder().withId(tutorUser.id).db(),
      });

      const student = await db.student.create({
        data: new StudentBuilder().db(),
      });

      const response = await request.get(`/api/students/${student.id}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(student.id);
    } finally {
      await deleteAuthUser(tutorUser.id);
    }
  });

  test("returns 403 when a non-tutor third party accesses the record", async ({
    request,
  }) => {
    const stranger = await signupUser(request);

    try {
      const student = await db.student.create({
        data: new StudentBuilder().db(),
      });

      const response = await request.get(`/api/students/${student.id}`);
      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body).toEqual({ error: "Forbidden" });
    } finally {
      await deleteAuthUser(stranger.id);
    }
  });

  test("includes only future consultations, ordered by startTime ascending", async ({
    request,
  }) => {
    const user = await signupUser(request);

    try {
      const tutor = await db.tutor.create({
        data: new TutorBuilder().db(),
      });

      const past = daysAgo(7);
      const soon = daysFromNow(7);
      const later = daysFromNow(14);

      const soonReason = faker.lorem.sentence();
      const laterReason = faker.lorem.sentence();

      await db.consultation.createMany({
        data: [
          new ConsultationBuilder()
            .withTutor((b) => b.withId(tutor.id))
            .withStudent((b) => b.withId(user.id))
            .withStartTime(past)
            .withEndTime(new Date(past.getTime() + 60 * 60 * 1000))
            .db(),
          new ConsultationBuilder()
            .withTutor((b) => b.withId(tutor.id))
            .withStudent((b) => b.withId(user.id))
            .withReason(laterReason)
            .withStartTime(later)
            .withEndTime(new Date(later.getTime() + 60 * 60 * 1000))
            .db(),
          new ConsultationBuilder()
            .withTutor((b) => b.withId(tutor.id))
            .withStudent((b) => b.withId(user.id))
            .withReason(soonReason)
            .withStartTime(soon)
            .withEndTime(new Date(soon.getTime() + 60 * 60 * 1000))
            .db(),
        ],
      });

      const response = await request.get(`/api/students/${user.id}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.consultations).toHaveLength(2);
      expect(body.consultations[0].reason).toBe(soonReason);
      expect(body.consultations[1].reason).toBe(laterReason);
    } finally {
      await deleteAuthUser(user.id);
    }
  });
});
