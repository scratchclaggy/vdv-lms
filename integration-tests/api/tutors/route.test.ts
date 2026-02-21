import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { signupUser } from "@/test/api-helpers";
import { TutorBuilder } from "@/test/builders/tutor-builder";
import { deleteAuthUser, truncateTables } from "@/test/db-helpers";
import { db } from "@/test/integration-db";

test.afterEach(truncateTables);

test.describe("GET /api/tutors", () => {
  test("returns an empty array when no tutors exist", async ({ request }) => {
    const user = await signupUser(request);

    try {
      const response = await request.get("/api/tutors");

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toEqual([]);
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("returns all tutors from the database", async ({ request }) => {
    const user = await signupUser(request);

    try {
      await db.tutor.createMany({
        data: [
          new TutorBuilder().db(),
          new TutorBuilder().db(),
          new TutorBuilder().db(),
        ],
      });

      const response = await request.get("/api/tutors");

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveLength(3);
    } finally {
      await deleteAuthUser(user.id);
    }
  });

  test("returns the correct fields for each tutor", async ({ request }) => {
    const user = await signupUser(request);

    try {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();

      const tutor = new TutorBuilder()
        .withFirstName(firstName)
        .withLastName(lastName)
        .withEmail(email)
        .db();
      await db.tutor.create({ data: tutor });

      const response = await request.get("/api/tutors");

      const body = await response.json();
      expect(body[0]).toMatchObject({
        firstName,
        lastName,
        email,
      });
    } finally {
      await deleteAuthUser(user.id);
    }
  });
});
