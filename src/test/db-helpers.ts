import { createClient } from "@supabase/supabase-js";
import { env } from "@/utils/env";
import { db } from "./integration-db";

/**
 * Deletes all rows from every application table in FK-safe order.
 * Call this in afterEach to keep integration tests isolated.
 */
export async function truncateTables(): Promise<void> {
  // Consultation references Tutor and Student, so it must be deleted first.
  await db.$executeRaw`TRUNCATE TABLE "Consultation", "Student", "Tutor" RESTART IDENTITY CASCADE`;
}

// Admin client for cleaning up Supabase auth users created during tests.
const adminClient = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/**
 * Deletes a Supabase auth user by id. Call this alongside truncateTables
 * in afterEach for any test that creates a real auth user via the sign-up API.
 */
export async function deleteAuthUser(id: string): Promise<void> {
  await adminClient.auth.admin.deleteUser(id);
}

/**
 * Deletes all Supabase auth users. Call this in a global teardown to clean up
 * any auth users that leaked from crashed or interrupted tests.
 */
export async function deleteAllAuthUsers(): Promise<void> {
  const { data } = await adminClient.auth.admin.listUsers();
  await Promise.all(
    data.users.map((u) => adminClient.auth.admin.deleteUser(u.id)),
  );
}
