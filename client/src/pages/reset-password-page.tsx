import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

const schema = z
  .object({
    password: z.string().min(8, "Must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: Values) => {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }
      return res.json();
    },
  });

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>This reset link is missing a token. Please request a new one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setLocation("/forgot-password")}>
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle>Password updated</CardTitle>
            <CardDescription>Your password has been changed. You can now sign in.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setLocation("/auth")}>
              Sign In
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
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a strong password for your account.
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Min. 8 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Repeat password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11" disabled={mutation.isPending}>
                  {mutation.isPending ? "Updating…" : "Update Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
