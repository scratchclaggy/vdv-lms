import { defineConfig } from "@playwright/test";

console.warn("Ensure local dev server is not running during integration tests");

// Load .env.test.local so integration tests run against the isolated test
// database (postgres_test) rather than the development database.
process.loadEnvFile(".env.test.local");

export default defineConfig({
  testDir: "integration-tests",
  globalSetup: "./integration-tests/global-setup.ts",
  globalTeardown: "./integration-tests/global-teardown.ts",
  // Run integration test files serially — they share one DB and truncate
  // between tests.
  fullyParallel: false,
  workers: 1,
  timeout: 15000,
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
