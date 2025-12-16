import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

import { db } from "@/data";
import { organizationsTable } from "@/data/schema";
import { getTenantDb } from "@/data/tenant-db";

export async function GET() {
  try {
    const checks: Record<string, { status: "ok" | "error"; message?: string }> = {};

    // Check main database
    try {
      await db.execute(sql`SELECT 1`);
      checks.database = { status: "ok" };
    } catch (error: any) {
      checks.database = {
        status: "error",
        message: error.message || "Database connection failed",
      };
    }

    // Check Redis (optional)
    try {
      const redisUrl = process.env.REDIS_URL;
      if (redisUrl) {
        const Redis = (await import("ioredis")).default;
        const redis = new Redis(redisUrl);
        await redis.ping();
        await redis.quit();
        checks.redis = { status: "ok" };
      } else {
        checks.redis = { status: "ok", message: "Redis not configured (using in-memory)" };
      }
    } catch (error: any) {
      checks.redis = {
        status: "error",
        message: error.message || "Redis connection failed",
      };
    }

    // Check organizations count
    try {
      const orgCount = await db.select({ count: sql<number>`count(*)` }).from(organizationsTable);
      checks.organizations = {
        status: "ok",
        message: `${orgCount[0]?.count || 0} organizations`,
      };
    } catch (error: any) {
      checks.organizations = {
        status: "error",
        message: error.message || "Failed to query organizations",
      };
    }

    // Overall status
    const allOk = Object.values(checks).every((check) => check.status === "ok");
    const status = allOk ? 200 : 503;

    return NextResponse.json(
      {
        status: allOk ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        checks,
      },
      { status }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message || "Health check failed",
      },
      { status: 500 }
    );
  }
}
