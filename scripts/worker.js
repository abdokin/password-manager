#!/usr/bin/env node

/**
 * Production worker script for processing background jobs
 * Uses ES modules for Next.js compatibility
 */

// Use dynamic import for ES modules
(async () => {
  try {
    const { emailWorker } = await import("../lib/jobs/queue.js");

    if (!emailWorker) {
      console.log(
        "⚠️  Redis not available, worker not started (emails will be sent synchronously)"
      );
      process.exit(0);
    }

    console.log("🚀 Background job worker started");

    // Graceful shutdown
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
  } catch (error) {
    console.error("Failed to start worker:", error);
    process.exit(1);
  }
})();

// Keep process alive
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
