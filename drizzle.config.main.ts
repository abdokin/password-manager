import type { Config } from "drizzle-kit";

// Configuration for main database (shared across all tenants)
export default {
  schema: "./data/schema.ts",
  out: "./drizzle/main",
  driver: "better-sqlite",
  dbCredentials: {
    url: "sqlite.db",
  },
} satisfies Config;
