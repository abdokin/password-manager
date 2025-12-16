#!/usr/bin/env node

/**
 * Background job worker
 * Run this separately to process email jobs
 * Usage: pnpm tsx scripts/worker.ts
 */
import { emailWorker } from "../lib/jobs/queue";

console.log("🚀 Email worker started...");
console.log("Processing email jobs...");

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await emailWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await emailWorker.close();
  process.exit(0);
});
