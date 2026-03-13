import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant / Food & Beverage" },
  { value: "home-services", label: "Home Services (plumbing, HVAC, etc.)" },
  { value: "retail", label: "Retail" },
  { value: "professional-services", label: "Professional Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "other", label: "Other" },
] as const;

const schema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Select a business type"),
  businessLocation: z.string().min(1, "City or location is required"),
  businessService: z.string().min(1, "Describe your main service"),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardingPage(): JSX.Element {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // If already onboarded, skip to dashboard
  useEffect(() => {
    if (user?.hasOnboarded) setLocation("/dashboard");
  }, [user, setLocation]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: "",
      businessType: "",
      businessLocation: "",
      businessService: "",
    },
  });

  const submit = useMutation({
    mutationFn: async (values: FormValues) => {
      // 1. Create the business profile
      const profileRes = await fetch("/api/business-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          businessName: values.businessName,
          businessType: values.businessType,
          businessLocation: values.businessLocation,
          businessService: values.businessService,
          isPrimary: true,
        }),
      });
      if (!profileRes.ok) {
        const err = await profileRes.json();
        throw new Error(err.error || "Failed to save business profile");
      }

      // 2. Mark onboarding complete
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hasOnboarded: true }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/dashboard");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
            <span className="text-primary">✦</span>
            Welcome!
          </span>
          <p className="text-muted-foreground text-sm">
            Tell us a little about your business to get started.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => submit.mutate(v))}
            className="space-y-5"
          >
            {/* Business Name */}
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Apex Windows and Bath" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Business Type */}
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUSINESS_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="businessLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City / Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Salt Lake City, UT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Main Service */}
            <FormField
              control={form.control}
              name="businessService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main service or product</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Window replacement and installation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submit.isError && (
              <p className="text-sm text-destructive">
                {(submit.error as Error).message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submit.isPending}
            >
              {submit.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Setting up…</>
              ) : (
                "Get started →"
              )}
            </Button>
          </form>
        </Form>

        <p className="text-xs text-center text-muted-foreground mt-4">
          You can update this information any time from your dashboard.
        </p>
      </div>
    </div>
  );
}
