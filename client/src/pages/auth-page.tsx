import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, Shield, Zap } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  username: z
    .string()
    .min(2, "At least 2 characters")
    .max(30, "At most 30 characters")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user, setLocation]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", username: "", password: "" },
  });

  // Auto-populate username from email prefix
  const watchedEmail = registerForm.watch("email");
  useEffect(() => {
    if (watchedEmail && !registerForm.getValues("username")) {
      const prefix = watchedEmail
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .slice(0, 20);
      registerForm.setValue("username", prefix, { shouldValidate: false });
    }
  }, [watchedEmail, registerForm]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginValues) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: data.email, password: data.password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterValues) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        const message = Array.isArray(err.error)
          ? err.error[0]?.message ?? "Registration failed"
          : err.error || "Registration failed";
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Left — auth forms */}
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-md mx-auto lg:w-96">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Ethical Review Builder</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to create authentic, AI-powered reviews for your business
            </p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            {/* Login tab */}
            <TabsContent value="login">
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Welcome back</CardTitle>
                  <CardDescription>Sign in with your email and password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loginMutation.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{loginMutation.error.message}</AlertDescription>
                    </Alert>
                  )}
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit((d) => loginMutation.mutate(d))}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
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
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full h-11"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in…" : "Sign In"}
                      </Button>
                      <div className="text-center">
                        <a
                          href="/forgot-password"
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register tab */}
            <TabsContent value="register">
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Create your account</CardTitle>
                  <CardDescription>Get started for free — no credit card required</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {registerMutation.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{registerMutation.error.message}</AlertDescription>
                    </Alert>
                  )}
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit((d) => registerMutation.mutate(d))}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
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
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="janesmith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Min. 8 characters" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full h-11"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account…" : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>

      {/* Right — marketing panel */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center bg-primary/5 px-12">
        <div className="max-w-lg">
          <h2 className="text-2xl font-bold mb-6">Create Authentic Reviews with AI</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Personalized Reviews</h3>
                <p className="text-sm text-muted-foreground">
                  AI generates unique reviews based on your actual experience
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Policy Compliant</h3>
                <p className="text-sm text-muted-foreground">
                  Every review follows Google's guidelines for authenticity
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Quick &amp; Easy</h3>
                <p className="text-sm text-muted-foreground">
                  Answer a few questions and get a ready-to-post review
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
