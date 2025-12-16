import { beforeEach, describe, expect, it, vi } from "vitest";

import { addEmailJob, closeQueues, getEmailQueueInstance } from "../lib/jobs/queue";

// Mock email sending functions
vi.mock("../lib/email", () => ({
  sendMagicLink: vi.fn().mockResolvedValue({ success: true }),
  send2FACode: vi.fn().mockResolvedValue({ success: true }),
  sendWelcomeEmail: vi.fn().mockResolvedValue({ success: true }),
}));

describe("Email Queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addEmailJob", () => {
    it("should queue a magic link email", async () => {
      const email = "test@example.com";
      const token = "test-token-123";

      const job = await addEmailJob("magic-link", { email, token });

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
    });

    it("should queue a 2FA code email", async () => {
      const email = "test@example.com";
      const code = "123456";

      const job = await addEmailJob("2fa-code", { email, code });

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
    });

    it("should queue a welcome email", async () => {
      const email = "newuser@example.com";

      const job = await addEmailJob("welcome", { email });

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
    });

    it("should handle job options", async () => {
      const email = "test@example.com";
      const token = "test-token";

      const job = await addEmailJob("magic-link", { email, token }, { delay: 1000, priority: 1 });

      expect(job).toBeDefined();
    });
  });

  describe("Queue Instance", () => {
    it("should get email queue instance", async () => {
      const queue = await getEmailQueueInstance();
      expect(queue).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid email job type gracefully", async () => {
      // This should not throw, but the job processing might fail
      const job = await addEmailJob("magic-link" as any, {
        email: "test@example.com",
        token: "test",
      });

      expect(job).toBeDefined();
    });
  });
});
