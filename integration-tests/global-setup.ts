import { execSync } from "node:child_process";

/**
 * Runs once before all integration tests start.
 * Applies any pending Prisma migrations to the test database so the schema
 * is always up to date without requiring a manual step.
 */
export default async function globalSetup() {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
}
