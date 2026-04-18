import { useState, KeyboardEvent } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, Loader2, Send, X } from "lucide-react";
import { BusinessProfile } from "@shared/schema";

interface SendReviewRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  businessProfile: BusinessProfile;
}

// Simple inline tag input: press Enter or comma to add, click X to remove.
function TagInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const next = draft.trim();
    if (!next) return;
    if (!value.includes(next)) onChange([...value, next]);
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="mt-1.5 rounded-md border bg-background px-2 py-1.5 flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-ring">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

export function SendReviewRequestDialog({
  isOpen,
  onClose,
  businessProfile,
}: SendReviewRequestDialogProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");

  // Project details (stored as projectContext on the request)
  const [city, setCity] = useState(
    businessProfile.businessLocation?.split(",")[0]?.trim() || ""
  );
  const [services, setServices] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [materials, setMaterials] = useState("");
  const [summary, setSummary] = useState("");

  // Get enabled platforms with URLs
  const enabledPlatforms = (businessProfile.reviewPlatforms || []).filter(
    (p) => p.platformUrl && p.platformUrl.trim() !== ""
  );

  const resetForm = () => {
    setRecipientEmail("");
    setRecipientName("");
    setSelectedPlatform("");
    setCity(businessProfile.businessLocation?.split(",")[0]?.trim() || "");
    setServices([]);
    setAreas([]);
    setMaterials("");
    setSummary("");
  };

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

      // Build projectContext, dropping empty fields so we don't store noise
      const projectContext: {
        city?: string;
        services?: string[];
        areas?: string[];
        materials?: string;
        summary?: string;
      } = {};
      if (city.trim()) projectContext.city = city.trim();
      if (services.length > 0) projectContext.services = services;
      if (areas.length > 0) projectContext.areas = areas;
      if (materials.trim()) projectContext.materials = materials.trim();
      if (summary.trim()) projectContext.summary = summary.trim();
      const hasProjectContext = Object.keys(projectContext).length > 0;

      const response = await apiRequest("POST", "/api/email-review-requests", {
        businessProfileId: businessProfile.id,
        recipientEmail: recipientEmail.trim(),
        recipientName: recipientName.trim() || undefined,
        platformName: selectedPlatform,
        platformUrl: platform.platformUrl,
        projectContext: hasProjectContext ? projectContext : undefined,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send review request");
      }

      toast({
        title: "Review request sent",
        description: `Email sent to ${recipientEmail}`,
      });

      resetForm();
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
      <DialogContent className={isMobile ? "w-[95vw] max-w-md p-4 max-h-[90vh] overflow-y-auto" : "max-w-md max-h-[90vh] overflow-y-auto"}>
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

          {/* Section C: Project Details */}
          <div>
            <h3 className="font-semibold text-sm mb-1">Project Details</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Notes to help them remember the project. Shown to the reviewer as memory prompts.
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="project-city" className="text-sm">
                  City
                </Label>
                <Input
                  id="project-city"
                  type="text"
                  placeholder="e.g. Avondale"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="project-services" className="text-sm">
                  Services Performed
                </Label>
                <TagInput
                  id="project-services"
                  value={services}
                  onChange={setServices}
                  placeholder="Type and press Enter"
                />
              </div>
              <div>
                <Label htmlFor="project-areas" className="text-sm">
                  Areas Completed
                </Label>
                <TagInput
                  id="project-areas"
                  value={areas}
                  onChange={setAreas}
                  placeholder="e.g. kitchen, hallway"
                />
              </div>
              <div>
                <Label htmlFor="project-materials" className="text-sm">
                  Materials Installed
                </Label>
                <Input
                  id="project-materials"
                  type="text"
                  placeholder="e.g. vinyl plank flooring"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="project-summary" className="text-sm">
                  Short Summary
                </Label>
                <Textarea
                  id="project-summary"
                  placeholder="A sentence or two about the job"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>
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
