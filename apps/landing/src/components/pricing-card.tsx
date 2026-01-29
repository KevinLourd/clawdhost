"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plan } from "@/lib/plans";
import { WaitlistModal } from "./waitlist-modal";

interface PricingCardProps {
  plan: Plan;
}

export function PricingCard({ plan }: PricingCardProps) {
  const [showWaitlist, setShowWaitlist] = useState(false);

  const handleClick = () => {
    if (plan.comingSoon) {
      setShowWaitlist(true);
      return;
    }
    if (plan.id === "free") {
      window.location.href = "https://app.clawdhost.tech";
    }
  };

  const buttonText = plan.comingSoon 
    ? "Join Waitlist" 
    : plan.price === 0 
      ? "Get Started Free" 
      : "Get Started";

  return (
    <>
      <Card className={`relative flex flex-col ${plan.popular ? "border-primary border-2 shadow-lg" : ""}`}>
        {plan.badge && (
          <Badge 
            className="absolute -top-3 left-1/2 -translate-x-1/2" 
            variant={plan.popular ? "default" : "secondary"}
          >
            {plan.badge}
          </Badge>
        )}
        
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">{plan.name}</CardTitle>
          <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1">
          <div className="text-center mb-6">
            {plan.price === 0 ? (
              <span className="text-4xl font-bold">Free</span>
            ) : (
              <>
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </>
            )}
          </div>
          
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 text-green-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full" 
            size="lg"
            variant={plan.comingSoon ? "outline" : plan.popular ? "default" : "outline"}
            onClick={handleClick}
          >
            {buttonText}
          </Button>
        </CardFooter>
      </Card>

      <WaitlistModal
        isOpen={showWaitlist}
        onClose={() => setShowWaitlist(false)}
        planName={plan.name}
      />
    </>
  );
}
