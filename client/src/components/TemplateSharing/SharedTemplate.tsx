import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Loader2, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReviewData, RelationshipType, BusinessInfo } from '@/lib/types';
// We'll use a placeholder component for now
import { JobStatusScreen } from '@/components/ReviewBuilder/JobStatusScreen';
import { AppointmentStatusScreen } from '@/components/ReviewBuilder/AppointmentStatusScreen';
import { mobileLayoutSizes, getMobileTextStyles } from '@/lib/mobile-standards';
import { useIsMobile } from '@/hooks/use-mobile';

interface SharedTemplateProps {
  shareableId: string;
}

export function SharedTemplate({ shareableId }: SharedTemplateProps) {
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const mobileLayout = mobileLayoutSizes;
  
  const { data: template, isLoading, error } = useQuery({
    queryKey: ['/api/shared-templates', shareableId],
    queryFn: async () => {
      const response = await fetch(`/api/shared-templates/${shareableId}`);
      if (!response.ok) {
        throw new Error('Template not found or no longer available');
      }
      return response.json();
    },
  });
  
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Handle relationship selection
  const handleRelationshipSelected = (relationship: RelationshipType) => {
    if (reviewData) {
      setReviewData({
        ...reviewData,
        relationship
      });
      setCurrentStep(2); // Move to next step
    }
  };
  
  // Handle going back
  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // Back to homepage if at first step
      navigate('/');
    }
  };
  
  useEffect(() => {
    if (template) {
      // Initialize review data from template
      let businessInfo: BusinessInfo = {
        businessName: '',
        businessLocation: '',
        businessService: ''
      };
      
      // If template is connected to a business profile, use that info
      if (template.businessProfileId) {
        // In a real app, we'd fetch the business profile here
        // For now, we'll use the name from the template
        businessInfo = {
          businessName: template.name.split(' - ')[0] || '',
          businessLocation: '',
          businessService: ''
        };
      }
      
      // Initialize review data
      setReviewData({
        relationship: template.relationshipType as RelationshipType,
        businessInfo,
        answers: {
          customer: ['', '', ''],
          acquaintance: ['', '', ''],
          appointment: ['', '', ''],
          'appointment-before': ['', '', ''],
          'appointment-after-no-purchase': ['', '', ''],
          'appointment-after-purchase': ['', '', ''],
          'appointment-after-purchase-not-started': ['', '', ''],
        },
        userName: '',
        generatedReview: ''
      });
    }
  }, [template]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className={getMobileTextStyles("body", "text-center")}>Loading template...</p>
      </div>
    );
  }
  
  if (error || !template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="mb-4 max-w-md mx-auto">
          <X className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Template not found or no longer available'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/')} className="mx-auto">Return Home</Button>
      </div>
    );
  }
  
  if (!reviewData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className={getMobileTextStyles("body", "text-center")}>Preparing review form...</p>
      </div>
    );
  }
  
  // When the template explicitly selects a relationship type and doesn't allow changing
  if (!template.allowRelationshipChange) {
    return (
      <div className={`container mx-auto ${isMobile ? 'p-2' : 'p-6'}`} style={{ maxWidth: '800px' }}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{template.name}</CardTitle>
            {template.description && <CardDescription>{template.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h2 className={getMobileTextStyles("heading", "text-center font-medium mb-3")}>
                Review {template.name}
              </h2>
              <p className={getMobileTextStyles("body", "text-center text-muted-foreground mb-6")}>
                {template.description || "Please answer a few questions to help create your review."}
              </p>
              
              <div className="bg-muted/30 rounded-md p-4 mb-4">
                <p className={getMobileTextStyles("label", "font-medium")}>Relationship Type:</p>
                <p className={getMobileTextStyles("body", "")}>{template.relationshipType}</p>
              </div>
            </div>
            
            {/* Use JobStatusScreen as our template interface */}
            <JobStatusScreen
              onNext={handleRelationshipSelected}
              onBack={handleGoBack}
            />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Default case: Template with relationship selection
  return (
    <div className={`container mx-auto ${isMobile ? 'p-2' : 'p-6'}`} style={{ maxWidth: '800px' }}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
          {template.description && <CardDescription>{template.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h2 className={getMobileTextStyles("heading", "text-center font-medium mb-3")}>
              Review {template.name}
            </h2>
            <p className={getMobileTextStyles("body", "text-center text-muted-foreground mb-6")}>
              {template.description || "Please select your relationship with this business."}
            </p>
            
            {/* Use AppointmentStatusScreen to let users select their relationship */}
            <AppointmentStatusScreen 
              onNext={handleRelationshipSelected}
              onBack={handleGoBack}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}