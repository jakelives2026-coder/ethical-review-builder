import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Shield, Zap } from "lucide-react";
import { SiGoogle, SiGithub, SiApple } from "react-icons/si";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading, login } = useAuth();
  
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-md mx-auto lg:w-96">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Review Builder Pro</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to create authentic, AI-powered reviews for your business
            </p>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">Welcome Back</CardTitle>
              <CardDescription>
                Choose your preferred sign-in method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={login}
                className="w-full h-12 text-base"
                size="lg"
              >
                Continue with Replit
              </Button>
              
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <SiGoogle className="w-3 h-3" />
                  <span>Google</span>
                </div>
                <div className="flex items-center gap-1">
                  <SiGithub className="w-3 h-3" />
                  <span>GitHub</span>
                </div>
                <div className="flex items-center gap-1">
                  <SiApple className="w-3 h-3" />
                  <span>Apple</span>
                </div>
              </div>
              
              <p className="text-xs text-center text-muted-foreground pt-4">
                Sign in with your Google, GitHub, Apple, or email account
              </p>
            </CardContent>
          </Card>
          
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
      
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
                <p className="text-sm text-muted-foreground">AI generates unique reviews based on your actual experience</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Policy Compliant</h3>
                <p className="text-sm text-muted-foreground">Every review follows Google's guidelines for authenticity</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Quick & Easy</h3>
                <p className="text-sm text-muted-foreground">Answer a few questions and get a ready-to-post review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
