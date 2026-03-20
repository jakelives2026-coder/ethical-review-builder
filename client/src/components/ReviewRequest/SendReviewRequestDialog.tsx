import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown, AlertCircle, Loader2, Send } from "lucide-react";
import { BusinessProfile } from "@shared/schema";

interface SendReviewRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  businessProfile: BusinessProfile;
}

export function SendReviewRequestDialog({
  isOpen,
  onClose,
  businessProfile,
}: SendReviewRequestDialogProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

  // Form state
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [preFilledCity, setPreFilledCity] = useState(
    businessProfile.businessLocation?.split(",")[0]?.trim() || ""
  );
  const [preFilledService, setPreFilledService] = useState(
    businessProfile.businessService || ""
  );
  const [preFilledContactName, setPreFilledContactName] = useState("");

  // Get enabled platforms with URLs
  const enabledPlatforms = (businessProfile.reviewPlatforms || []).filter(
    (p) => p.platformUrl && p.platformUrl.trim() !== ""
  );

  const handleSubmit = async () => {
    // Validation
    if (!recipientEmail.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter the recipient's email address",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPlatform) {
      toast({
        title: "Missing information",
        description: "Please select a review platform",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const platform = enabledPlatforms.find(
        (p) => p.platformName === selectedPlatform
      );

      if (!platform) {
        throw new Error("Selected platform not found");
      }

      const response = await apiRequest("POST", "/api/email-review-requests", {
        businessProfileId: businessProfile.id,
        recipientEmail: recipientEmail.trim(),
        recipientName: recipientName.trim() || undefined,
        platformName: selectedPlatform,
        platformUrl: platform.platformUrl,
        preFilledCity: preFilledCity.trim() || undefined,
        preFilledService: preFilledService.trim() || undefined,
        preFilledContactName: preFilledContactName.trim() || undefined,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send review request");
      }

      toast({
        title: "Review request sent",
        description: `Email sent to ${recipientEmail}`,
      });

      // Reset form
      setRecipientEmail("");
      setRecipientName("");
      setSelectedPlatform("");
      setShowCustomization(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send review request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={isMobile ? "w-[95vw] max-w-md p-4" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle>Send Review Request</DialogTitle>
          <DialogDescription>
            Request a review from {businessProfile.businessName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section A: Platform Selection */}
          <div>
            <h3 className="font-semibold text-sm mb-3">
              Where should they post?
            </h3>

            {enabledPlatforms.length === 0 ? (
              <div className="flex gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Add review platform URLs in your profile settings first.
                </p>
              </div>
            ) : (
              <RadioGroup value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <div className="space-y-3">
                  {enabledPlatforms.map((platform) => (
                    <div
                      key={platform.platformName}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <RadioGroupItem
                        value={platform.platformName}
                        id={platform.platformName}
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={platform.platformName}
                          className="text-sm font-medium capitalize cursor-pointer"
                        >
                          {platform.platformName === "bbb"
                            ? "BBB"
                            : platform.platformName}
                        </Label>
                        <p className="text-xs text-muted-foreground truncate">
                          {platform.platformUrl}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>

          {/* Section B: Recipient Info */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Who are you sending this to?</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="recipient-email" className="text-sm">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="recipient-email"
                  type="email"
                  placeholder="john@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="recipient-name" className="text-sm">
                  First Name (optional)
                </Label>
                <Input
                  id="recipient-name"
                  type="text"
                  placeholder="John"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used to personalize the email greeting
                </p>
              </div>
            </div>
          </div>

          {/* Section C: Customization (Collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowCustomization(!showCustomization)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showCustomization ? "rotate-180" : ""
                }`}
              />
              Make it even easier for them (optional)
            </button>

            {showCustomization && (
              <div className="mt-3 space-y-3 p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="pre-filled-city" className="text-sm">
                    Job Location
                  </Label>
                  <Input
                    id="pre-filled-city"
                    type="text"
                    placeholder="e.g. Avondale"
                    value={preFilledCity}
                    onChange={(e) => setPreFilledCity(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="pre-filled-service" className="text-sm">
                    What you did for them
                  </Label>
                  <Input
                    id="pre-filled-service"
                    type="text"
                    placeholder="e.g. vinyl plank flooring installation"
                    value={preFilledService}
                    onChange={(e) => setPreFilledService(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="pre-filled-contact" className="text-sm">
                    Who helped them
                  </Label>
                  <Input
                    id="pre-filled-contact"
                    type="text"
                    placeholder="e.g. Jed and Sergio"
                    value={preFilledContactName}
                    onChange={(e) => setPreFilledContactName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || enabledPlatforms.length === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
