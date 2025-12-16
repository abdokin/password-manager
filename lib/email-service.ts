"use server";

import { addEmailJob } from "./jobs/queue";

/**
 * Queue a magic link email to be sent
 */
export async function queueMagicLinkEmail(email: string, token: string) {
  try {
    const job = await addEmailJob("magic-link", { email, token });
    return {
      success: true,
      jobId: job.id,
    };
  } catch (error: any) {
    console.error("Error queuing magic link email:", error);
    return {
      success: false,
      error: error.message || "Failed to queue email",
    };
  }
}

/**
 * Queue a 2FA code email to be sent
 */
export async function queue2FAEmail(email: string, code: string) {
  try {
    const job = await addEmailJob("2fa-code", { email, code });
    return {
      success: true,
      jobId: job.id,
    };
  } catch (error: any) {
    console.error("Error queuing 2FA email:", error);
    return {
      success: false,
      error: error.message || "Failed to queue email",
    };
  }
}

/**
 * Queue a welcome email to be sent
 */
export async function queueWelcomeEmail(email: string) {
  try {
    const job = await addEmailJob("welcome", { email });
    return {
      success: true,
      jobId: job.id,
    };
  } catch (error: any) {
    console.error("Error queuing welcome email:", error);
    return {
      success: false,
      error: error.message || "Failed to queue email",
    };
  }
}
