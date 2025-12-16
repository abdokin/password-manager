"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/data";
import { organizationsTable } from "@/data/schema";

import { getCurrentUserId } from "./get-session";
import { getCurrentOrganizationId } from "./tenant-context";

// Subscription plans
export const PLANS = {
  free: {
    name: "Free",
    maxMembers: 5,
    maxPasswords: 100,
    price: 0,
  },
  pro: {
    name: "Pro",
    maxMembers: 25,
    maxPasswords: 1000,
    price: 9.99,
  },
  enterprise: {
    name: "Enterprise",
    maxMembers: -1, // Unlimited
    maxPasswords: -1, // Unlimited
    price: 29.99,
  },
} as const;

export type PlanType = keyof typeof PLANS;

/**
 * Update organization subscription plan
 */
export async function updateSubscription(plan: PlanType) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        error: "Not authenticated",
      };
    }

    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return {
        error: "No organization selected",
      };
    }

    // In a real implementation, you would:
    // 1. Create/update subscription with payment provider (Stripe, etc.)
    // 2. Update organization with subscription details
    // 3. Handle webhooks for subscription events

    const planDetails = PLANS[plan];

    await db
      .update(organizationsTable)
      .set({
        plan,
        maxMembers: planDetails.maxMembers,
        maxPasswords: planDetails.maxPasswords,
        updatedAt: new Date(),
      })
      .where(eq(organizationsTable.id, organizationId));

    return {
      success: true,
      message: `Subscription updated to ${planDetails.name}`,
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to update subscription",
    };
  }
}

/**
 * Get current subscription details
 */
export async function getSubscription() {
  try {
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return {
        error: "No organization selected",
      };
    }

    const [organization] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, organizationId))
      .limit(1);

    if (!organization) {
      return {
        error: "Organization not found",
      };
    }

    const planDetails = PLANS[organization.plan as PlanType] || PLANS.free;

    return {
      success: true,
      subscription: {
        plan: organization.plan,
        planDetails,
        maxMembers: organization.maxMembers,
        maxPasswords: organization.maxPasswords,
        subscriptionId: organization.subscriptionId,
        subscriptionStatus: organization.subscriptionStatus,
      },
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to get subscription",
    };
  }
}
