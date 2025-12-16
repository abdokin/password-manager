import type { Config } from "drizzle-kit";

// Configuration for tenant databases (per-organization)
export default {
  schema: "./data/tenant-schema.ts",
  out: "./drizzle/tenant",
  driver: "better-sqlite",
  dbCredentials: {
    url: "data/tenants/tenant-template.db", // Template database
  },
} satisfies Config;
