import { deleteAllAuthUsers, truncateTables } from "@/test/db-helpers";

/**
 * Runs once after all integration tests complete.
 * Cleans up any auth users and DB rows that leaked from crashed or
 * interrupted tests (i.e. tests that never reached their own finally blocks).
 */
export default async function globalTeardown() {
  await truncateTables();
  await deleteAllAuthUsers();
}
