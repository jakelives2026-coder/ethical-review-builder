import { useState } from "react";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Pencil, X, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

// ProtectedRoute guarantees user is non-null when this renders, but useAuth types
// include null/undefined — this helper narrows the type for render.
type NonNullUser = NonNullable<ReturnType<typeof useAuth>["user"]>;

function getPlanLabel(planType: string, stripePlanId: string | null | undefined): string {
  if (stripePlanId) {
    // planType is set by the webhook; fall through to planType check
  }
  switch (planType) {
    case "pro": return "Pro";
    case "business": return "Business";
    default: return "Free";
  }
}

function getUsageLimit(planType: string): number | null {
  return planType === "free" ? 3 : null; // null = unlimited
}

export default function ProfilePage(): JSX.Element {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.fullName ?? "");

  const updateName = useMutation({
    mutationFn: async (fullName: string) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });
      if (!res.ok) throw new Error("Failed to update name");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setEditing(false);
    },
  });

  const openPortal = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to open billing portal");
      return res.json() as Promise<{ url: string }>;
    },
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const u = user as NonNullUser;
  const planLabel = getPlanLabel(u.planType, u.stripePlanId);
  const usageLimit = getUsageLimit(u.planType);
  const usedThisMonth = u.reviewsGeneratedThisMonth ?? 0;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Your Profile</h1>

      {/* Account Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Full Name */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Full Name
            </Label>
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Your name"
                  autoFocus
                />
                <Button
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => updateName.mutate(nameInput)}
                  disabled={updateName.isPending}
                >
                  {updateName.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => { setEditing(false); setNameInput(u.fullName ?? ""); }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm">{u.fullName || <span className="text-muted-foreground italic">Not set</span>}</span>
                <button
                  onClick={() => { setEditing(true); setNameInput(u.fullName ?? ""); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Edit name"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {updateName.isError && (
              <p className="text-xs text-destructive mt-1">Failed to save. Please try again.</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Email
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm">{u.email}</span>
              {u.emailVerified ? (
                <Badge variant="outline" className="gap-1 text-xs border-green-500/40 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-xs border-destructive/40 text-destructive">
                  <XCircle className="h-3 w-3" />
                  Unverified
                </Badge>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Username
            </Label>
            <span className="text-sm text-muted-foreground">{u.username}</span>
          </div>
        </CardContent>
      </Card>

      {/* Plan & Usage */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Plan & Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Current Plan */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Current Plan
            </Label>
            <Badge
              variant={planLabel === "Free" ? "secondary" : "default"}
              className="text-sm px-3 py-0.5"
            >
              {planLabel}
            </Badge>
          </div>

          {/* Reviews This Month */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Reviews This Month
            </Label>
            {usageLimit === null ? (
              <span className="text-sm text-muted-foreground">Unlimited</span>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{usedThisMonth}</span>
                  <span className="text-sm text-muted-foreground">/ {usageLimit}</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-48 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      usedThisMonth >= usageLimit ? "bg-destructive" : "bg-foreground"
                    )}
                    style={{ width: `${Math.min(100, (usedThisMonth / usageLimit) * 100)}%` }}
                  />
                </div>
                {usedThisMonth >= usageLimit && (
                  <p className="text-xs text-destructive">
                    Limit reached.{" "}
                    <a href="/pricing" className="underline underline-offset-2 hover:text-foreground">
                      Upgrade to Pro
                    </a>{" "}
                    for unlimited reviews.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Manage Subscription */}
          {u.stripeCustomerId && (
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Billing
              </Label>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => openPortal.mutate()}
                disabled={openPortal.isPending}
              >
                {openPortal.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Manage Subscription
              </Button>
              {openPortal.isError && (
                <p className="text-xs text-destructive mt-1">Could not open billing portal. Please try again.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
