import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/utils/env";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

// A dedicated client for integration tests — separate from the app singleton
// in src/db.ts so tests can seed and clean up without interfering with it.
export const db = new PrismaClient({ adapter });
