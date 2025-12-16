import { Job, Queue, Worker } from "bullmq";
import IORedis from "ioredis";

// Lazy initialization to avoid issues at module load time
let redisConnection: IORedis | null = null;
let emailQueueInstance: Queue | InMemoryQueue | null = null;
let emailWorkerInstance: Worker | null = null;
let useInMemory = false;
let initialized = false;

// In-memory queue fallback when Redis is not available
class InMemoryQueue {
  private jobs: Map<string, any[]> = new Map();

  async add(queueName: string, jobData: any, options?: any) {
    if (!this.jobs.has(queueName)) {
      this.jobs.set(queueName, []);
    }
    const job = { id: Date.now().toString(), data: jobData };
    this.jobs.get(queueName)!.push(job);

    // Process immediately
    setTimeout(async () => {
      await this.processJob(queueName, job);
    }, 100);

    return job;
  }

  private async processJob(queueName: string, job: any) {
    try {
      const { type, data } = job.data;
      const { sendMagicLink, send2FACode, sendWelcomeEmail } = await import("../email");

      switch (type) {
        case "magic-link":
          await sendMagicLink(data.email, data.token);
          break;
        case "2fa-code":
          await send2FACode(data.email, data.code);
          break;
        case "welcome":
          await sendWelcomeEmail(data.email);
          break;
      }
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
    }
  }

  async close() {
    // Cleanup
  }
}

// Initialize connection lazily
async function initializeConnection() {
  if (initialized) return;
  initialized = true;

  if (process.env.REDIS_URL) {
    try {
      redisConnection = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn("Redis connection failed, falling back to in-memory queue");
            return null;
          }
          return Math.min(times * 50, 2000);
        },
        enableReadyCheck: true,
        lazyConnect: true,
      });

      redisConnection.on("error", (err) => {
        console.error("Redis connection error:", err.message);
      });

      redisConnection.on("connect", () => {
        console.log("✓ Redis connected");
        useInMemory = false;
      });

      try {
        await redisConnection.connect();
        useInMemory = false;
      } catch (error) {
        console.warn("Redis connection failed, using in-memory queue:", error);
        useInMemory = true;
        redisConnection = null;
      }
    } catch (error) {
      console.warn("Failed to create Redis connection, using in-memory queue:", error);
      useInMemory = true;
    }
  } else {
    useInMemory = true;
    console.log("⚠ Redis not configured, using in-memory queue (not recommended for production)");
  }

  // Initialize queue
  if (useInMemory) {
    emailQueueInstance = new InMemoryQueue() as any;
  } else {
    emailQueueInstance = new Queue("email", {
      connection: redisConnection!,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600,
          count: 1000,
        },
        removeOnFail: {
          age: 24 * 3600,
        },
      },
    });

    // Initialize worker only if Redis is available
    emailWorkerInstance = new Worker(
      "email",
      async (job: Job) => {
        const { type, data } = job.data;

        switch (type) {
          case "magic-link":
            const { sendMagicLink } = await import("../email");
            return await sendMagicLink(data.email, data.token);
          case "2fa-code":
            const { send2FACode } = await import("../email");
            return await send2FACode(data.email, data.code);
          case "welcome":
            const { sendWelcomeEmail } = await import("../email");
            return await sendWelcomeEmail(data.email);
          default:
            throw new Error(`Unknown email job type: ${type}`);
        }
      },
      {
        connection: redisConnection!,
        concurrency: 5,
      }
    );

    emailWorkerInstance.on("completed", (job) => {
      console.log(`Email job ${job.id} completed`);
    });

    emailWorkerInstance.on("failed", (job, err) => {
      console.error(`Email job ${job?.id} failed:`, err);
    });
  }
}

// Initialize on first use
async function getEmailQueue() {
  if (!initialized) {
    await initializeConnection();
  }
  return emailQueueInstance!;
}

// Export queue getter
export async function getEmailQueueInstance() {
  return await getEmailQueue();
}

// Export worker getter
export async function getEmailWorkerInstance() {
  if (!initialized) {
    await initializeConnection();
  }
  return emailWorkerInstance;
}

// Helper function to add email jobs
export async function addEmailJob(
  type: "magic-link" | "2fa-code" | "welcome",
  data: any,
  options?: { delay?: number; priority?: number }
) {
  const queue = await getEmailQueue();
  return await queue.add(type, { type, data }, options);
}

// Graceful shutdown
export async function closeQueues() {
  if (emailWorkerInstance) {
    await emailWorkerInstance.close();
  }
  if (emailQueueInstance && typeof (emailQueueInstance as any).close === "function") {
    await (emailQueueInstance as any).close();
  }
  if (redisConnection) {
    await redisConnection.quit();
  }
}
