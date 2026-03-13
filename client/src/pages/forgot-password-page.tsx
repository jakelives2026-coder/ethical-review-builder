import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: Values) => {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }
      return res.json();
    },
  });

  if (mutation.isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              If that email is registered, a reset link has been sent. Check your inbox (and spam folder).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => setLocation("/auth")}>
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-4">
            {mutation.error && (
              <Alert variant="destructive">
                <AlertDescription>{mutation.error.message}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11" disabled={mutation.isPending}>
                  {mutation.isPending ? "Sending…" : "Send Reset Link"}
                </Button>
              </form>
            </Form>
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:underline"
                onClick={() => setLocation("/auth")}
              >
                Back to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
