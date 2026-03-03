import { useState, useEffect } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { BusinessTypeScreen } from "./BusinessTypeScreen";
import { RelationshipTypeScreen } from "./RelationshipType";
import { ServiceLocationScreen } from "./ServiceLocationScreen";
import { BusinessInfoScreen } from "./BusinessInfo";
import { QuestionScreen } from "./QuestionScreen";
import { ReviewGeneration } from "./ReviewGeneration";
import { ReviewPreview } from "./ReviewPreview";
import { ReviewCompletion } from "./ReviewCompletion";
import { ProgressIndicator } from "./ProgressIndicator";
import { AppointmentStatusScreen } from "./AppointmentStatusScreen";
import { JobStatusScreen } from "./JobStatusScreen";
import { RestartButton } from "./RestartButton";
import { Step, RelationshipType, BusinessType, BusinessInfo, ReviewData, ServiceLocationType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { relationshipQuestions } from "@/lib/relationship-questions";
import { getQuestionsForBusinessType, hasAppointmentFlows } from "@/lib/business-type-questions";

interface ReviewBuilderProps {
  prefillData?: {
    businessName?: string;
    businessLocation?: string;
    businessService?: string;
    businessType?: BusinessType;
    services?: string;
    representativeName?: string;
  };
  branding?: {
    primaryColor?: string | null;
    accentColor?: string | null;
    logoUrl?: string | null;
  };
}

export function ReviewBuilder({ prefillData, branding }: ReviewBuilderProps = {}) {
  // Define initial state (with optional prefill)
  const initialState: ReviewData = {
    businessType: prefillData?.businessType || null,
    relationship: null,
    serviceLocation: null,
    businessInfo: {
      businessName: prefillData?.businessName || "",
      businessLocation: prefillData?.businessLocation || "",
      businessService: prefillData?.businessService || "",
      representativeName: prefillData?.representativeName
    },
    answers: {
      customer: ["", "", ""],
      acquaintance: ["", "", ""],
      appointment: ["", "", ""],
      "appointment-before": ["", "", ""],
      "appointment-after-no-purchase": ["", "", "", ""],
      "appointment-after-purchase": ["", "", "", ""],
      "appointment-after-purchase-not-started": ["", "", "", ""]
    },
    userName: "",
    generatedReview: ""
  };

  const [currentStep, setCurrentStep] = useState<Step>(Step.Welcome);
  const [formData, setFormData] = useState<ReviewData>(initialState);
  const [reviewReady, setReviewReady] = useState(false);
  const { toast } = useToast();

  // Animation classes
  const [animationClass, setAnimationClass] = useState("");
  const [visibleStep, setVisibleStep] = useState<Step>(Step.Welcome);
  
  // Determine if business info is pre-filled (for public review pages)
  const hasPrefillData = !!(prefillData?.businessName && prefillData?.businessLocation && prefillData?.businessService);
  
  // Reset state when component mounts
  useEffect(() => {
    // Reset to initial state when component loads
    setFormData(initialState);
    
    // If we have prefilled business type, skip to relationship screen
    if (prefillData?.businessType) {
      setCurrentStep(Step.Relationship);
      setVisibleStep(Step.Relationship);
    } else {
      setCurrentStep(Step.Welcome);
      setVisibleStep(Step.Welcome);
    }
  }, []);
  
  // Start the API call as soon as the Generating screen mounts
  useEffect(() => {
    if (visibleStep !== Step.Generating) return;
    setReviewReady(false);
    generateReview();
  }, [visibleStep]);

  const goToStep = (step: Step) => {
    setAnimationClass("slide-out");
    
    setTimeout(() => {
      setCurrentStep(step);
      setAnimationClass("slide-in");
      setVisibleStep(step);
      
      setTimeout(() => {
        setAnimationClass("");
      }, 400);
    }, 300);
  };
  
  // Set business type
  const handleSetBusinessType = (businessType: BusinessType) => {
    setFormData(prev => ({
      ...prev,
      businessType
    }));
    goToStep(Step.Relationship);
  };
  
  // Set relationship
  const handleSetRelationship = (relationship: RelationshipType) => {
    // If it's the general "appointment" relationship type, show the appointment status screen
    // But only for business types that support appointments (home-services)
    if (relationship === "appointment" && formData.businessType && hasAppointmentFlows(formData.businessType)) {
      goToStep(Step.AppointmentStatus);
    } else if (relationship === "appointment") {
      // For non-home-services, treat appointment as customer
      setFormData(prev => ({
        ...prev,
        relationship: "customer"
      }));
      goToStep(Step.ServiceLocation);
    } else if (relationship === "acquaintance") {
      // Acquaintances haven't used services, skip service location and clear any previous selection
      setFormData(prev => ({
        ...prev,
        relationship,
        serviceLocation: null
      }));
      // Skip business info if we have prefilled data
      if (hasPrefillData) {
        goToStep(Step.Question1);
      } else {
        goToStep(Step.BusinessInfo);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        relationship
      }));
      goToStep(Step.ServiceLocation);
    }
  };
  
  // Handle selecting appointment status
  const handleAppointmentStatus = (appointmentType: RelationshipType) => {
    // If the user selected "became a customer", we need to determine job status
    if (appointmentType === "appointment-after-purchase") {
      // Store this temporarily and show the job status screen
      setFormData(prev => ({
        ...prev,
        relationship: appointmentType // Will be overwritten in handleJobStatus
      }));
      goToStep(Step.JobStatus);
    } else {
      // For other appointment types, proceed normally
      setFormData(prev => ({
        ...prev,
        relationship: appointmentType
      }));
      goToStep(Step.ServiceLocation);
    }
  };
  
  // Handle selecting job status
  const handleJobStatus = (jobStatus: RelationshipType) => {
    setFormData(prev => ({
      ...prev,
      relationship: jobStatus
    }));
    goToStep(Step.ServiceLocation);
  };

  // Set service location
  const handleSetServiceLocation = (serviceLocation: ServiceLocationType) => {
    setFormData(prev => ({
      ...prev,
      serviceLocation
    }));
    // Skip business info if we have prefilled data
    if (hasPrefillData) {
      goToStep(Step.Question1);
    } else {
      goToStep(Step.BusinessInfo);
    }
  };

  // Set business info
  const handleSetBusinessInfo = (businessInfo: BusinessInfo) => {
    setFormData(prev => ({
      ...prev,
      businessInfo
    }));
    goToStep(Step.Question1);
  };

  // Get total question count for the current relationship/business type
  const getQuestionCount = (relationship: RelationshipType | null): number => {
    if (!relationship) return 3;
    
    // Check for business-type-specific questions first
    if (formData.businessType) {
      const businessQuestions = getQuestionsForBusinessType(formData.businessType, relationship);
      if (businessQuestions) {
        return businessQuestions.length;
      }
    }
    
    // Fall back to default questions
    if (!relationshipQuestions[relationship]) return 3;
    return relationshipQuestions[relationship].length;
  };
  
  // Map internal step IDs to user-facing step numbers
  const getDisplayStep = (internalStep: Step): { current: number; total: number } => {
    const questionCount = getQuestionCount(formData.relationship);
    // For acquaintance: skip service location so total is 5 + questions
    // For others: 1(type) + 1(relationship) + 1(location) + 1(business) + questions + 1(generating) + 1(complete) = 6 + questions
    const hasServiceLocation = formData.relationship && formData.relationship !== "acquaintance";
    const total = hasServiceLocation ? 6 + questionCount : 5 + questionCount;

    if (internalStep === Step.Welcome) return { current: 1, total };
    if (internalStep === Step.BusinessType) return { current: 1, total };
    if (internalStep === Step.Relationship || internalStep === Step.AppointmentStatus || internalStep === Step.JobStatus) return { current: 2, total };
    if (internalStep === Step.ServiceLocation) return { current: 3, total };
    if (internalStep === Step.BusinessInfo) return { current: hasServiceLocation ? 4 : 3, total };
    if (internalStep >= Step.Question1 && internalStep <= Step.Question4) return { current: (hasServiceLocation ? internalStep + 1 : internalStep), total };
    if (internalStep === Step.Generating || internalStep === Step.Preview) return { current: (hasServiceLocation ? 5 : 4) + questionCount, total };
    if (internalStep === Step.Complete) return { current: total, total };
    return { current: 1, total };
  };
  
  const displayStep = getDisplayStep(currentStep);

  // Set answer for a question
  const handleSetAnswer = (answer: string, questionNumber: number) => {
    if (!formData.relationship) return;
    
    const newAnswers = { ...formData.answers };
    newAnswers[formData.relationship][questionNumber - 1] = answer;
    
    setFormData(prev => ({
      ...prev,
      answers: newAnswers
    }));
    
    const totalQuestions = getQuestionCount(formData.relationship);
    
    if (questionNumber < totalQuestions) {
      goToStep(Step.Question1 + questionNumber as Step);
    } else {
      goToStep(Step.Generating);
    }
  };
  
  // Generate (or regenerate) the review. Pass a name to include it and advance to Complete;
  // omit it for the initial generation — reviewReady signals the animation to proceed to Preview.
  const generateReview = async (name?: string) => {
    if (!formData.relationship) return;

    try {
      const response = await apiRequest("POST", "/api/generate-review", {
        relationshipType: formData.relationship,
        businessType: formData.businessType,
        serviceLocation: formData.serviceLocation,
        businessName: formData.businessInfo.businessName,
        businessLocation: formData.businessInfo.businessLocation,
        businessService: formData.businessInfo.businessService,
        representativeName: formData.businessInfo.representativeName,
        answers: formData.answers[formData.relationship],
        userName: name !== undefined ? name.trim() : formData.userName,
      });

      const data = await response.json();

      setFormData(prev => ({ ...prev, generatedReview: data.review }));
      if (name !== undefined) {
        goToStep(Step.Complete);
      } else {
        setReviewReady(true);
      }
    } catch (error) {
      console.error("Error generating review:", error);
      toast({
        title: "Error",
        description: "Failed to generate review. Please try again.",
        variant: "destructive"
      });

      if (name !== undefined) {
        goToStep(Step.Complete);
      } else {
        setFormData(prev => ({
          ...prev,
          generatedReview: "A placeholder review until the API is connected."
        }));
        setReviewReady(true);
      }
    }
  };

  // Set generated review (called when user accepts an edited review from Preview)
  const handleSetReview = (review: string) => {
    setFormData(prev => ({ ...prev, generatedReview: review }));
    goToStep(Step.Complete);
  };
  
  // Start over
  const handleStartOver = () => {
    setFormData({
      businessType: null,
      relationship: null,
      serviceLocation: null,
      businessInfo: {
        businessName: "",
        businessLocation: "",
        businessService: "",
        representativeName: ""
      },
      answers: {
        customer: ["", "", ""],
        acquaintance: ["", "", ""],
        appointment: ["", "", ""],
        "appointment-before": ["", "", ""],
        "appointment-after-no-purchase": ["", "", "", ""],
        "appointment-after-purchase": ["", "", "", ""],
        "appointment-after-purchase-not-started": ["", "", "", ""]
      },
      userName: "",
      generatedReview: ""
    });
    setReviewReady(false);
    goToStep(Step.Welcome);
  };

  // Function to render the restart button when appropriate
  const renderRestartButton = () => {
    // Don't show on welcome screen, business type screen, or completion screen
    if (visibleStep === Step.Welcome || visibleStep === Step.Complete || visibleStep === Step.BusinessType) {
      return null;
    }
    
    return (
      <div className="mb-2 flex justify-end">
        <RestartButton onRestart={handleStartOver} />
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen flex flex-col">
      <ProgressIndicator currentStep={displayStep.current} totalSteps={displayStep.total} />
      
      {renderRestartButton()}
      
      <div className={`flex-grow flex flex-col ${animationClass}`}>
        {visibleStep === Step.Welcome && (
          <WelcomeScreen onNext={() => goToStep(Step.BusinessType)} />
        )}

        {visibleStep === Step.BusinessType && (
          <BusinessTypeScreen
            onNext={handleSetBusinessType}
            onBack={() => goToStep(Step.Welcome)}
            initialValue={formData.businessType || undefined}
          />
        )}

        {visibleStep === Step.Relationship && (
          <RelationshipTypeScreen
            onNext={handleSetRelationship}
            onBack={() => goToStep(Step.BusinessType)}
            showAppointmentOption={formData.businessType ? hasAppointmentFlows(formData.businessType) : false}
          />
        )}

        {visibleStep === Step.ServiceLocation && (
          <ServiceLocationScreen
            onNext={handleSetServiceLocation}
            onBack={() => goToStep(Step.Relationship)}
          />
        )}

        {visibleStep === Step.BusinessInfo && (
          <BusinessInfoScreen
            initialData={formData.businessInfo}
            onNext={handleSetBusinessInfo}
            onBack={() => formData.relationship === "acquaintance" ? goToStep(Step.Relationship) : goToStep(Step.ServiceLocation)}
          />
        )}

        {visibleStep === Step.Question1 && formData.relationship && (
          <QuestionScreen
            relationshipType={formData.relationship}
            businessType={formData.businessType}
            questionNumber={1}
            currentAnswer={formData.answers[formData.relationship][0]}
            onNext={(answer) => handleSetAnswer(answer, 1)}
            onBack={() => goToStep(Step.BusinessInfo)}
          />
        )}

        {visibleStep === Step.Question2 && formData.relationship && (
          <QuestionScreen
            relationshipType={formData.relationship}
            businessType={formData.businessType}
            questionNumber={2}
            currentAnswer={formData.answers[formData.relationship][1]}
            onNext={(answer) => handleSetAnswer(answer, 2)}
            onBack={() => goToStep(Step.Question1)}
          />
        )}

        {visibleStep === Step.Question3 && formData.relationship && (
          <QuestionScreen
            relationshipType={formData.relationship}
            businessType={formData.businessType}
            questionNumber={3}
            currentAnswer={formData.answers[formData.relationship][2]}
            onNext={(answer) => handleSetAnswer(answer, 3)}
            onBack={() => goToStep(Step.Question2)}
            isLastQuestion={getQuestionCount(formData.relationship) === 3}
          />
        )}

        {visibleStep === Step.Question4 && formData.relationship && getQuestionCount(formData.relationship) >= 4 && (
          <QuestionScreen
            relationshipType={formData.relationship}
            businessType={formData.businessType}
            questionNumber={4}
            currentAnswer={formData.answers[formData.relationship][3]}
            onNext={(answer) => handleSetAnswer(answer, 4)}
            onBack={() => goToStep(Step.Question3)}
            isLastQuestion={true}
          />
        )}

        {visibleStep === Step.Generating && (
          <ReviewGeneration
            apiReady={reviewReady}
            onComplete={() => goToStep(Step.Preview)}
            businessInfo={formData.businessInfo}
          />
        )}

        {visibleStep === Step.Preview && formData.relationship && (
          <ReviewPreview
            review={formData.generatedReview}
            onNext={handleSetReview}
            onBack={() => goToStep((Step.Question1 + getQuestionCount(formData.relationship) - 1) as Step)}
            relationshipType={formData.relationship}
            businessInfo={formData.businessInfo}
            answers={formData.answers[formData.relationship]}
          />
        )}

        {visibleStep === Step.Complete && (
          <ReviewCompletion
            review={formData.generatedReview}
            businessInfo={formData.businessInfo}
            onStartOver={handleStartOver}
          />
        )}

        {visibleStep === Step.AppointmentStatus && (
          <AppointmentStatusScreen
            onNext={handleAppointmentStatus}
            onBack={() => goToStep(Step.Relationship)}
          />
        )}

        {visibleStep === Step.JobStatus && (
          <JobStatusScreen
            onNext={handleJobStatus}
            onBack={() => goToStep(Step.AppointmentStatus)}
          />
        )}
      </div>
    </div>
  );
}
