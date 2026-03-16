import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";

export default function EmailPendingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const error = await res.json();
        if (res.status === 429) {
          toast({
            title: "Too many requests",
            description: "Please wait before requesting another verification email.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to resend verification email. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Email sent",
        description: "Verification email has been sent to your inbox.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-indigo-100 p-3">
              <Mail className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Check your inbox</CardTitle>
          <CardDescription className="mt-2">
            We've sent a verification link to <span className="font-semibold text-foreground">{user?.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <p className="font-medium">To verify your email:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Check your email inbox</li>
              <li>Click the verification link in the email</li>
              <li>Your account will be activated automatically</li>
            </ol>
          </div>

          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or request a new one.
          </p>

          <Button
            onClick={handleResendEmail}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resend verification email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
