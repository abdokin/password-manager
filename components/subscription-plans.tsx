"use client";

import { Check, Loader2 } from "lucide-react";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PLANS, getSubscription, updateSubscription } from "@/lib/billing";
import type { PlanType } from "@/lib/billing";

export function SubscriptionPlans() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);

  const handleUpgrade = async (plan: PlanType) => {
    setLoading(plan);
    try {
      const result = await updateSubscription(plan);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Subscription updated",
          description: result.message,
        });
        setCurrentPlan(plan);
        // Reload subscription info
        const subResult = await getSubscription();
        if (subResult.success) {
          setCurrentPlan(subResult.subscription.plan as PlanType);
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update subscription",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Object.entries(PLANS).map(([key, plan]) => {
        const planKey = key as PlanType;
        const isCurrent = currentPlan === planKey;
        const isUpgrading = loading === planKey;

        return (
          <div
            key={key}
            className={`p-6 rounded-lg border-2 ${
              isCurrent ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            } transition-all`}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                </div>
              </div>

              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{plan.maxMembers === -1 ? "Unlimited" : plan.maxMembers} team members</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>
                    {plan.maxPasswords === -1 ? "Unlimited" : plan.maxPasswords} passwords
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>All features included</span>
                </li>
              </ul>

              <Button
                className="w-full"
                variant={isCurrent ? "outline" : "default"}
                disabled={isCurrent || isUpgrading}
                onClick={() => handleUpgrade(planKey)}
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upgrading...
                  </>
                ) : isCurrent ? (
                  "Current Plan"
                ) : plan.price === 0 ? (
                  "Select Plan"
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
