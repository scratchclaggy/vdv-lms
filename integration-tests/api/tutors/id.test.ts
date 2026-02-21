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

test.describe("GET /api/tutors/[id]", () => {
  test("returns 404 when the tutor does not exist", async ({ request }) => {
    const user = await signupUser(request);

    try {
      const id = faker.string.uuid();
      const response = await request.get(`/api/tutors/${id}`);

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: "Tutor not found" });
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("returns the tutor with their correct fields", async ({ request }) => {
    const user = await signupUser(request);

    try {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();

      const tutor = await db.tutor.create({
        data: new TutorBuilder()
          .withFirstName(firstName)
          .withLastName(lastName)
          .withEmail(email)
          .db(),
      });

      const response = await request.get(`/api/tutors/${tutor.id}`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toMatchObject({
        id: tutor.id,
        firstName,
        lastName,
        email,
      });
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("includes only future consultations, ordered by startTime ascending", async ({
    request,
  }) => {
    const user = await signupUser(request);

    try {
      const tutor = await db.tutor.create({ data: new TutorBuilder().db() });
      const student = await db.student.create({
        data: new StudentBuilder().db(),
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
            .withStudent((b) => b.withId(student.id))
            .withStartTime(past)
            .withEndTime(new Date(past.getTime() + 60 * 60 * 1000))
            .db(),
          new ConsultationBuilder()
            .withTutor((b) => b.withId(tutor.id))
            .withStudent((b) => b.withId(student.id))
            .withReason(laterReason)
            .withStartTime(later)
            .withEndTime(new Date(later.getTime() + 60 * 60 * 1000))
            .db(),
          new ConsultationBuilder()
            .withTutor((b) => b.withId(tutor.id))
            .withStudent((b) => b.withId(student.id))
            .withReason(soonReason)
            .withStartTime(soon)
            .withEndTime(new Date(soon.getTime() + 60 * 60 * 1000))
            .db(),
        ],
      });

      const response = await request.get(`/api/tutors/${tutor.id}`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.consultations).toHaveLength(2);
      expect(body.consultations[0].reason).toBe(soonReason);
      expect(body.consultations[1].reason).toBe(laterReason);
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("returns an empty consultations array when the tutor has no upcoming sessions", async ({
    request,
  }) => {
    const user = await signupUser(request);

    try {
      const tutor = await db.tutor.create({ data: new TutorBuilder().db() });
      const student = await db.student.create({
        data: new StudentBuilder().db(),
      });

      const past = daysAgo(7);
      await db.consultation.create({
        data: new ConsultationBuilder()
          .withTutor((b) => b.withId(tutor.id))
          .withStudent((b) => b.withId(student.id))
          .withStartTime(past)
          .withEndTime(new Date(past.getTime() + 60 * 60 * 1000))
          .db(),
      });

      const response = await request.get(`/api/tutors/${tutor.id}`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.consultations).toEqual([]);
    } finally {
      await deleteAuthUser(user.id);
    }
  });
});
