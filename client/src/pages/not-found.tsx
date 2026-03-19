import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-red-50 p-4 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Page Not Found</h1>
          <p className="text-neutral-600 mb-6">
            We couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
