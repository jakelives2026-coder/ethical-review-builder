import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const contactEmail = "support@ethicalreviewbuilder.com";

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Contact Us</h1>
          <p className="text-lg text-neutral-600">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid gap-6">
          {/* Email Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Email Us</CardTitle>
                  <CardDescription>We typically respond within 24 hours</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <a
                href={`mailto:${contactEmail}`}
                className="inline-block"
              >
                <Button className="gap-2">
                  <Mail className="h-4 w-4" />
                  {contactEmail}
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Support Info Card */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-3 rounded-full">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Support Resources</CardTitle>
                  <CardDescription>Find answers and learn more</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-neutral-600">
                Before reaching out, check out our documentation and guides which may answer your question quickly.
              </p>
              <div className="flex gap-2 flex-wrap">
                <a href="/privacy" className="text-primary hover:underline text-sm">
                  Privacy Policy
                </a>
                <span className="text-neutral-400">•</span>
                <a href="/terms" className="text-primary hover:underline text-sm">
                  Terms of Service
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
