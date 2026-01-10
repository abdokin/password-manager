import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';

interface PricingPlansProps {
  organizationId: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  limits: { passwords: number };
}

export default function PricingPlans({ organizationId }: PricingPlansProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['plans', organizationId],
    queryFn: () => api.payments.getPlans(organizationId),
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) => api.payments.createCheckout(organizationId, planId),
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading plans...</div>;
  }

  const plans: Plan[] = data?.plans || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg">
          Select the perfect plan for your team's needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.id === 'pro' ? 'border-primary border-2' : ''}`}
          >
            {plan.id === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.id === 'pro' ? 'default' : 'outline'}
                onClick={() => checkoutMutation.mutate(plan.id)}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : plan.price === 0 ? (
                  'Current Plan'
                ) : (
                  'Subscribe'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

