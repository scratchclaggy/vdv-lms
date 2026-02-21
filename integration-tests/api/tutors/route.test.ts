import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { TutorBuilder } from "@/test/builders/tutor-builder";
import { truncateTables } from "@/test/db-helpers";
import { db } from "@/test/integration-db";

test.afterEach(truncateTables);

test.describe("GET /api/tutors", () => {
  test("returns an empty array when no tutors exist", async ({ request }) => {
    const response = await request.get("/api/tutors");

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual([]);
  });

  test("returns all tutors from the database", async ({ request }) => {
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
  });

  test("returns the correct fields for each tutor", async ({ request }) => {
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
  });
});
