import { faker } from "@faker-js/faker";
import type { APIRequestContext } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Signs up a new user via the API and returns their id, email, and password.
 * The Playwright request context stores the session cookies automatically.
 */
export async function signupUser(
  request: APIRequestContext,
  overrides: { firstName?: string; lastName?: string } = {},
): Promise<{ id: string; email: string; password: string }> {
  const email = faker.internet.email();
  const password = faker.internet.password();
  const res = await request.post("/api/auth/sign-up", {
    data: {
      email,
      password,
      firstName: overrides.firstName ?? faker.person.firstName(),
      lastName: overrides.lastName ?? faker.person.lastName(),
    },
  });
  expect(res.status()).toBe(201);
  const { id } = await res.json();
  return { id, email, password };
}
