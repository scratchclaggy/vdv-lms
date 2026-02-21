import { defineConfig } from "@playwright/test";

// Load .env.local so DATABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc. are
// available to the global setup and test fixtures.
process.loadEnvFile(".env.local");

export default defineConfig({
  testDir: "integration-tests",
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
