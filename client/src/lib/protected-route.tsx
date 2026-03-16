import { useAuth } from "@/hooks/use-auth.tsx";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  allowUnverified = false,
}: {
  path: string;
  component: () => React.JSX.Element;
  allowUnverified?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If on /email-pending but user is verified, redirect to dashboard
  if (path === "/email-pending" && user.emailVerified) {
    return (
      <Route path={path}>
        <Redirect to="/dashboard" />
      </Route>
    );
  }

  // Check if email is verified (unless it's a Google OAuth user or allowUnverified is true)
  if (!allowUnverified && !user.emailVerified && !user.googleId) {
    return (
      <Route path={path}>
        <Redirect to="/email-pending" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}