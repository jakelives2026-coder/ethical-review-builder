import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  features: PlanFeature[];
  cta: string;
  ctaHref: string;
  planId?: "pro" | "business";
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started and explore the core review builder.",
    features: [
      { text: "3 reviews per month", included: true },
      { text: "1 business profile", included: true },
      { text: "Basic templates", included: true },
      { text: "AI-generated review drafts", included: true },
      { text: "Copy & paste output", included: true },
      { text: "Unlimited reviews", included: false },
      { text: "All templates", included: false },
      { text: "Priority support", included: false },
      { text: "White-label branding", included: false },
      { text: "Team seats", included: false },
      { text: "API access", included: false },
    ],
    cta: "Get Started Free",
    ctaHref: "/auth",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For growing businesses that need unlimited review generation.",
    badge: "Most Popular",
    features: [
      { text: "Unlimited reviews", included: true },
      { text: "5 business profiles", included: true },
      { text: "All templates", included: true },
      { text: "AI-generated review drafts", included: true },
      { text: "Tone & style controls", included: true },
      { text: "Priority support", included: true },
      { text: "Export history", included: true },
      { text: "White-label branding", included: false },
      { text: "Team seats", included: false },
      { text: "API access", included: false },
    ],
    cta: "Get Pro",
    ctaHref: "/auth",
    planId: "pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$99",
    period: "per month",
    description: "For agencies and multi-location businesses that need full control.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited business profiles", included: true },
      { text: "White-label branding", included: true },
      { text: "Team seats (up to 10)", included: true },
      { text: "API access", included: true },
      { text: "Custom onboarding", included: true },
      { text: "Dedicated support", included: true },
      { text: "Usage analytics dashboard", included: true },
      { text: "SLA guarantee", included: true },
      { text: "Custom integrations", included: true },
    ],
    cta: "Get Business",
    ctaHref: "/auth",
    planId: "business",
    highlighted: false,
  },
];

function FeatureRow({ feature }: { feature: PlanFeature }) {
  return (
    <li className={cn("flex items-start gap-2 text-sm", !feature.included && "opacity-40")}>
      <Check
        className={cn(
          "h-4 w-4 mt-0.5 flex-shrink-0",
          feature.included ? "text-foreground" : "text-muted-foreground"
        )}
        strokeWidth={feature.included ? 2.5 : 1.5}
      />
      <span className={feature.included ? "text-foreground" : "text-muted-foreground line-through"}>
        {feature.text}
      </span>
    </li>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const checkout = useMutation({
    mutationFn: async (planId: "pro" | "business") => {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (!res.ok) throw new Error("Failed to create checkout session");
      return res.json() as Promise<{ url: string }>;
    },
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  function handleCta() {
    if (!plan.planId) {
      // Free plan — go to dashboard or auth
      navigate(user ? "/dashboard" : plan.ctaHref);
      return;
    }
    if (!user) {
      navigate(plan.ctaHref);
      return;
    }
    checkout.mutate(plan.planId);
  }

  const card = (
    <div
      className={cn(
        "relative flex flex-col h-full rounded-xl border p-6 transition-shadow",
        plan.highlighted
          ? "border-2 border-primary shadow-lg bg-foreground text-background"
          : "border-border bg-card"
      )}
    >

      <div className="mb-6">
        <h3 className={cn("text-lg font-bold mb-1", plan.highlighted ? "text-background" : "")}>
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1 mb-2">
          <span className={cn("text-4xl font-extrabold", plan.highlighted ? "text-background" : "")}>
            {plan.price}
          </span>
          <span className={cn("text-sm", plan.highlighted ? "text-background/70" : "text-muted-foreground")}>
            /{plan.period}
          </span>
        </div>
        <p className={cn("text-sm", plan.highlighted ? "text-background/80" : "text-muted-foreground")}>
          {plan.description}
        </p>
      </div>

      <ul className="space-y-2 mb-8 flex-1">
        {plan.features.map((f) => (
          <li
            key={f.text}
            className={cn(
              "flex items-start gap-2 text-sm",
              !f.included && "opacity-40"
            )}
          >
            <Check
              className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                plan.highlighted
                  ? f.included ? "text-background" : "text-background/40"
                  : f.included ? "text-foreground" : "text-muted-foreground"
              )}
              strokeWidth={f.included ? 2.5 : 1.5}
            />
            <span
              className={cn(
                plan.highlighted
                  ? f.included ? "text-background" : "text-background/40 line-through"
                  : f.included ? "text-foreground" : "text-muted-foreground line-through"
              )}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <div>
        <Button
          className={cn(
            "w-full",
            plan.highlighted
              ? "bg-background text-foreground hover:bg-background/90"
              : ""
          )}
          variant={plan.highlighted ? "default" : "outline"}
          onClick={handleCta}
          disabled={checkout.isPending}
        >
          {checkout.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Redirecting…</>
          ) : user && plan.name === "Free" ? (
            "Go to Dashboard"
          ) : (
            plan.cta
          )}
        </Button>
        {checkout.isError && (
          <p className={cn(
            "text-xs text-center mt-2",
            plan.highlighted ? "text-background/60" : "text-destructive"
          )}>
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </div>
  );

  // Wrap highlighted card with badge floating above
  if (plan.highlighted && plan.badge) {
    return (
      <div className="relative pt-5">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
            {plan.badge}
          </span>
        </div>
        {card}
      </div>
    );
  }

  return card;
}

export default function PricingPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-3">Simple, transparent pricing</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Start for free. Upgrade when your business is ready.
          No hidden fees, no long-term contracts.
        </p>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>

      {/* FAQ / reassurance */}
      <div className="mt-16 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          All plans include a 7-day money-back guarantee on the first paid month.
        </p>
        <p className="text-sm text-muted-foreground">
          Questions?{" "}
          <a
            href="mailto:support@ethicalreviewbuilder.com"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Contact us
          </a>{" "}
          — we're happy to help.
        </p>
      </div>
    </div>
  );
}
