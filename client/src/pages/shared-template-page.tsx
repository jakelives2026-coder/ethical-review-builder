import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Loader2, Building2, User } from "lucide-react";
import { ReviewTemplate, BusinessProfile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { AppointmentStatusScreen } from "@/components/ReviewBuilder/AppointmentStatusScreen";
import { BusinessInfoScreen } from "@/components/ReviewBuilder/BusinessInfo";
import { RelationshipType } from "@/lib/types";
import { cn } from "@/lib/utils";

// Extended type to include the business profile data
type ExtendedReviewTemplate = ReviewTemplate & { 
  businessProfile?: BusinessProfile;
  settings?: {
    prefilledFields?: string[];
    editableFields?: string[];
  };
};
import {
  getMobileButtonContainerStyles,
  getMobileButtonStyles,
  getMobileTextStyles,
} from "@/lib/mobile-standards";

// Helper to properly type cn function arguments
function getClassName(...inputs: string[]): string {
  return cn(...inputs);
}

export default function SharedTemplatePage() {
  // 1. Extract the template ID from the URL
  const [, params] = useRoute<{ shareableId: string }>("/t/:shareableId");
  const [, setLocation] = useLocation();
  const shareableId = params?.shareableId;

  // 2. Track the current state of the review process
  const [currentStep, setCurrentStep] = useState<"intro" | "relationship" | "business-info" | "questions">("intro");
  const [relationshipType, setRelationshipType] = useState<RelationshipType | null>(null);

  // 3. Fetch template data using the shareable ID
  const { data: template, isLoading, error } = useQuery<ExtendedReviewTemplate>({
    queryKey: [`/api/shared-templates/${shareableId}`],
    enabled: !!shareableId,
  });

  // 4. Manage business info UI state
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    businessLocation: "",
    businessService: "",
    representativeName: "",
  });

  // 5. Prefill business information from template data
  useEffect(() => {
    if (template && template.businessProfile) {
      const profile = template.businessProfile;
      const settings = template.settings || {};
      const prefilledFields = settings.prefilledFields || [];
      const editableFields = settings.editableFields || [];

      // Prefill fields based on template settings
      setBusinessInfo({
        businessName: prefilledFields.includes("businessName") ? profile.businessName : "",
        businessLocation: prefilledFields.includes("businessLocation") ? profile.businessLocation : "",
        businessService: prefilledFields.includes("businessService") ? profile.businessService : "",
        representativeName: prefilledFields.includes("representativeName") ? profile.representativeName || "" : "",
      });

      // Set initial relationship type if not editable
      if (!template.allowRelationshipChange) {
        setRelationshipType(template.relationshipType as RelationshipType);
      }
    }
  }, [template]);

  // 6. Handle navigation between steps
  const handleStartReview = () => {
    if (template && !template.allowRelationshipChange) {
      // Skip relationship selection if not allowed to change
      setCurrentStep("business-info");
    } else {
      setCurrentStep("relationship");
    }
  };

  const handleRelationshipSelected = (type: RelationshipType) => {
    setRelationshipType(type);
    setCurrentStep("business-info");
  };

  const handleBusinessInfoNext = (info: any) => {
    setBusinessInfo(info);
    setCurrentStep("questions");
  };

  const handleBackToIntro = () => setCurrentStep("intro");
  const handleBackToRelationship = () => setCurrentStep("relationship");

  // 7. Error and loading states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className={getClassName("text-2xl font-bold mb-4", getMobileTextStyles())}>Template Not Found</h1>
        <p className={getClassName("text-muted-foreground mb-6", getMobileTextStyles())}>
          The review template you're looking for doesn't exist or may have been removed.
        </p>
        <Button onClick={() => setLocation("/")} className={getMobileButtonStyles()}>
          Go Home
        </Button>
      </div>
    );
  }

  // 8. Render different UI based on the current step
  if (currentStep === "intro") {
    return (
      <div className="container max-w-2xl px-4 py-8 mx-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className={getMobileTextStyles()}>{template.name}</CardTitle>
            <CardDescription className={getMobileTextStyles()}>{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-md">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className={getClassName("font-semibold", getMobileTextStyles())}>
                  {template.businessProfile?.businessName}
                </p>
                <p className={getClassName("text-sm text-muted-foreground", getMobileTextStyles())}>
                  {template.businessProfile?.businessLocation}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-md">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className={getClassName("font-semibold", getMobileTextStyles())}>Share your experience</p>
                <p className={getClassName("text-sm text-muted-foreground", getMobileTextStyles())}>
                  Help others by providing your honest feedback
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartReview} className="w-full">
              Start Review
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (currentStep === "relationship") {
    return (
      <div className="container max-w-2xl px-4 py-8 mx-auto">
        <AppointmentStatusScreen 
          onNext={handleRelationshipSelected} 
          onBack={handleBackToIntro} 
        />
      </div>
    );
  }

  if (currentStep === "business-info") {
    return (
      <div className="container max-w-2xl px-4 py-8 mx-auto">
        <BusinessInfoScreen 
          initialData={businessInfo}
          onNext={handleBusinessInfoNext} 
          onBack={template.allowRelationshipChange ? handleBackToRelationship : handleBackToIntro} 
        />
      </div>
    );
  }

  if (currentStep === "questions") {
    // Placeholder for the questions section (to be implemented)
    return (
      <div className="container max-w-2xl px-4 py-8 mx-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className={getMobileTextStyles()}>Answer Questions</CardTitle>
            <CardDescription className={getMobileTextStyles()}>
              Please provide answers to the following questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={getMobileTextStyles()}>
              {template.customQuestions && template.customQuestions.length > 0 
                ? `${template.customQuestions.length} questions to answer`
                : "No questions available"
              }
            </p>
          </CardContent>
          <CardFooter className={getMobileButtonContainerStyles()}>
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep("business-info")}
              className={getMobileButtonStyles()}
            >
              Back
            </Button>
            <Button 
              onClick={() => alert("Questions section to be implemented!")}
              className={getMobileButtonStyles()}
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null;
}