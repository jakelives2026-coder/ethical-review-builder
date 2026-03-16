import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { getMobileTextStyles, getMobileButtonStyles } from "@/lib/mobile-standards";

interface AuthGateProps {
  onAuthSuccess: () => void;
}

type AuthMode = "login" | "register";

export function AuthGate({ onAuthSuccess }: AuthGateProps) {
  const [mode, setMode] = useState<AuthMode>("register");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          email,
          password,
          fullName,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error?.message || errorData.error || "Registration failed");
        return;
      }

      toast({
        title: "Account created!",
        description: "You're all set. Your review is ready to save.",
      });

      // Invalidate auth query to refresh user state
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      onAuthSuccess();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: email, // Can login with email or username
          password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Login failed");
        return;
      }

      toast({
        title: "Logged in!",
        description: "Welcome back. Your review is ready to save.",
      });

      // Invalidate auth query to refresh user state
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      onAuthSuccess();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto ${isMobile ? "px-4 py-6" : "py-12"}`}>
      {/* Motivating Message */}
      <div className={`mb-6 text-center ${isMobile ? "mb-4" : ""}`}>
        <div className="flex justify-center mb-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h2 className={`${getMobileTextStyles("heading", "font-bold text-neutral-800 mb-2")}`}>
          Your review is ready
        </h2>
        <p className={`${getMobileTextStyles("body", "text-muted-foreground")}`}>
          {mode === "register"
            ? "Create a free account to save your review and manage multiple businesses."
            : "Sign in to save your review and manage your account."}
        </p>
      </div>

      <Card className={isMobile ? "border-none shadow-sm" : ""}>
        <CardHeader className={isMobile ? "px-0 pt-0 pb-4" : ""}>
          <CardTitle className={getMobileTextStyles("body", "font-semibold")}>
            {mode === "register" ? "Create Account" : "Sign In"}
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "px-0 space-y-4" : ""}>
          <form onSubmit={mode === "register" ? handleRegister : handleLogin} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs text-muted-foreground uppercase tracking-wide">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs text-muted-foreground uppercase tracking-wide">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-wide">
                {mode === "register" ? "Email" : "Email or Username"}
              </Label>
              <Input
                id="email"
                type={mode === "register" ? "email" : "text"}
                placeholder={mode === "register" ? "you@example.com" : "email or username"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-muted-foreground uppercase tracking-wide">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              {mode === "register" && (
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={getMobileButtonStyles("w-full")}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "register" ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                mode === "register" ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          {/* Toggle Link */}
          <div className="text-center pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {mode === "register" ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "register" ? "login" : "register");
                  setError("");
                }}
                className="text-primary hover:underline font-medium"
              >
                {mode === "register" ? "Sign in" : "Register"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      <p className={`${getMobileTextStyles("label", "text-center text-muted-foreground text-xs mt-4")}`}>
        Your review is saved locally until you complete sign in.
      </p>
    </div>
  );
}
