import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Pencil, InfoIcon, AlertTriangle, Sparkles, Star, CheckCircle2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateReview } from "@/lib/openai";
import { BusinessInfo, RelationshipType } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { 
  getMobileTextStyles, 
  getMobileButtonStyles,
  mobileLayoutSizes
} from "@/lib/mobile-standards";

interface ReviewPreviewProps {
  review: string;
  onNext: (review: string) => void;
  onBack: () => void;
  relationshipType?: RelationshipType;
  businessInfo?: BusinessInfo;
  answers?: string[];
}

export function ReviewPreview({ review, onNext, onBack, relationshipType, businessInfo, answers }: ReviewPreviewProps) {
  const [editedReview, setEditedReview] = useState(review);
  const [wordCount, setWordCount] = useState(0);
  const [hasFakeName, setHasFakeName] = useState(false);
  const [isGeneratingSuperReview, setIsGeneratingSuperReview] = useState(false);
  const [hasSuperReview, setHasSuperReview] = useState(false);
  const reviewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Detection patterns for fake names
  const fakeNamePatterns = [
    // Common signature formats with specific names
    /[-—–] Alex$/i, /[-—–] Sarah$/i, /[-—–] John$/i, /[-—–] Emily$/i, /[-—–] David$/i, 
    /[-—–] Michael$/i, /[-—–] Jessica$/i, /[-—–] Chris$/i, /[-—–] Jennifer$/i, /[-—–] Mark$/i,
    // Generic signature format (any common first name)
    /[-—–] (Alex|Sarah|John|Emily|David|Michael|Jessica|Chris|Jennifer|Mark|Maria|James|Lisa|Robert|Julie|Amy|Daniel|Tom|Jason|Brian)$/i,
    // Formats with colons or other punctuation
    /[,.] [-—–] \w{3,10}$/i,
    // Name with parentheses
    /\(([A-Z][a-z]{2,9})\)$/
  ];
  
  // Function to clean a review of fake signatures
  const cleanFakeSignatures = (text: string): string => {
    // Start with the original text
    let cleanedText = text;
    
    // Remove dash/hyphen signatures
    cleanedText = cleanedText.replace(/[-—–] \w{2,10}$/, '');
    
    // Remove signatures with parentheses
    cleanedText = cleanedText.replace(/\([A-Z][a-z]{2,9}\)$/, '');
    
    // Remove any trailing punctuation and whitespace
    cleanedText = cleanedText.replace(/[.,;:!?]?\s*$/, '');
    
    return cleanedText.trim();
  };
  
  // Scroll review text to top when mounted or content changes
  useEffect(() => {
    if (reviewRef.current && editedReview) {
      // Scroll to top of the review card
      reviewRef.current.scrollTop = 0;
    }
  }, [editedReview]);

  // Check for fake signatures
  useEffect(() => {
    if (editedReview) {
      // Check if the review has a fake signature
      const containsFakeName = fakeNamePatterns.some(namePattern =>
        namePattern.test(editedReview.trim())
      );

      if (containsFakeName) {
        setHasFakeName(true);
        // Remove the fake signature
        const cleanedReview = cleanFakeSignatures(editedReview);
        setEditedReview(cleanedReview);

        toast({
          title: "Fake signature detected",
          description: "We've removed an AI-generated name signature that wasn't provided by you.",
          variant: "destructive"
        });
      } else {
        setHasFakeName(false);
      }
      
      // Update word count
      const words = editedReview.trim().split(/\s+/);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [review]);
  
  // Update word count when user edits
  useEffect(() => {
    if (editedReview) {
      const words = editedReview.trim().split(/\s+/);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [editedReview]);
  
  const handleFocus = () => {
    if (reviewRef.current) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(reviewRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };
  
  const handleEdit = () => {
    if (reviewRef.current) {
      reviewRef.current.focus();
      handleFocus();
    }
  };
  
  const handleInput = () => {
    if (reviewRef.current) {
      const newText = reviewRef.current.innerText;
      
      // Check for fake signatures again when user edits
      const containsFakeName = fakeNamePatterns.some(namePattern => 
        namePattern.test(newText.trim())
      );
      
      if (containsFakeName) {
        setHasFakeName(true);
        // Remove the fake signature
        const cleanedReview = cleanFakeSignatures(newText);
        setEditedReview(cleanedReview);
        
        if (reviewRef.current) {
          reviewRef.current.innerText = cleanedReview;
        }
        
        toast({
          title: "Fake signature detected",
          description: "We've removed an AI-generated name signature that wasn't provided by you.",
          variant: "destructive"
        });
      } else {
        setHasFakeName(false);
        setEditedReview(newText);
      }
    }
  };
  
  // Animation states for Super Review generation
  const [isSuperReviewAnimation, setIsSuperReviewAnimation] = useState(false);
  const [superReviewProgress, setSuperReviewProgress] = useState(0);
  const [superReviewStep, setSuperReviewStep] = useState(0);
  
  // Function to generate Super Review
  const handleGenerateSuperReview = async () => {
    if (!relationshipType || !businessInfo || !answers || answers.length !== 3) {
      toast({
        title: "Cannot create Super Review",
        description: "Missing required information to generate a Super Review.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Start animation
      setIsGeneratingSuperReview(true);
      setIsSuperReviewAnimation(true);
      setSuperReviewProgress(0);
      setSuperReviewStep(0);
      
      // Animate progress as we generate the review
      const intervalId = setInterval(() => {
        setSuperReviewProgress(prev => {
          // Max progress is 80% until we get the actual review
          return prev < 80 ? prev + 5 : prev;
        });
        
        setSuperReviewStep(prev => {
          // Cycle through animation steps
          return (prev + 1) % 4;
        });
      }, 500);
      
      // Make the API call with the isSuperReview flag set to true
      const superReview = await generateReview({
        relationshipType,
        businessName: businessInfo.businessName,
        businessLocation: businessInfo.businessLocation,
        businessService: businessInfo.businessService,
        representativeName: businessInfo.representativeName,
        answers,
        isSuperReview: true
      });

      // Complete the progress animation
      clearInterval(intervalId);
      setSuperReviewProgress(100);
      
      // Add a small delay before showing the review
      setTimeout(() => {
        // Update the edited review
        setEditedReview(superReview);
        
        // Update the ref's content
        if (reviewRef.current) {
          reviewRef.current.innerText = superReview;
        }
        
        // Update word count
        const words = superReview.trim().split(/\s+/);
        setWordCount(words.length);
        
        // End animation
        setIsSuperReviewAnimation(false);
        
        toast({
          title: "Super Review Created!",
          description: "Your extended review has been generated. Feel free to edit it further.",
        });
        
        setIsGeneratingSuperReview(false);
        setHasSuperReview(true);
      }, 1000);
    } catch (error) {
      console.error("Error generating Super Review:", error);
      setIsSuperReviewAnimation(false);
      
      toast({
        title: "Error Creating Super Review",
        description: "There was a problem generating your Super Review. Please try again.",
        variant: "destructive"
      });
      setIsGeneratingSuperReview(false);
    }
  };

  const handleNext = () => {
    // Final check before submitting
    const containsFakeName = fakeNamePatterns.some(namePattern => 
      namePattern.test(editedReview.trim())
    );
    
    if (containsFakeName) {
      const cleanedReview = cleanFakeSignatures(editedReview);
      onNext(cleanedReview);
    } else {
      onNext(editedReview);
    }
  };
  
  // Super Review animation steps
  const superReviewSteps = [
    { text: "Creating Super Review..." },
    { text: "Enhancing content..." },
    { text: "Adding details..." },
    { text: "Finalizing Super Review..." }
  ];

  return (
    <div>
      {/* Super Review Generation Animation */}
      {isSuperReviewAnimation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={cn(
            "bg-white rounded-xl shadow-xl max-w-md mx-4 overflow-hidden",
            isMobile ? "w-[95%]" : "w-[450px]"
          )}>
            <div className="p-5">
              <h3 className={cn(
                "text-center font-bold text-neutral-800",
                isMobile ? "text-lg" : "text-xl"
              )}>
                Creating Your Super Review
              </h3>
              <p className={cn(
                "text-center text-neutral-600 mb-4",
                isMobile ? "text-sm" : ""
              )}>
                We're crafting a more detailed review that follows Google's policies
              </p>
              
              {/* Progress bar */}
              <div className="w-full bg-neutral-200 rounded-full h-2.5 mb-6">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${superReviewProgress}%` }}
                ></div>
              </div>
              
              {/* Animation container */}
              <div className="bg-neutral-50 rounded-xl p-5 relative overflow-hidden">
                {/* Floating particles */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/20 animate-[bounce_3s_ease-in-out_infinite]"></div>
                <div className="absolute top-3/4 left-1/2 w-2 h-2 rounded-full bg-primary/20 animate-[bounce_4s_ease-in-out_0.5s_infinite]"></div>
                <div className="absolute top-2/3 left-1/3 w-2 h-2 rounded-full bg-primary/20 animate-[bounce_3.5s_ease-in-out_0.2s_infinite]"></div>
                
                {/* Background gradient */}
                <div className="absolute top-0 right-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full -z-10 opacity-70 animate-pulse w-28 h-28"
                  style={{ transform: 'translate(30%, -30%)' }}
                />
                
                {/* Main content */}
                <div className="flex flex-col items-center">
                  <div className="bg-primary/10 rounded-full p-3 mb-4">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                  
                  <p className="text-center text-primary font-medium mb-3">
                    {superReviewSteps[superReviewStep].text}
                  </p>
                  
                  <div className="flex justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={cn(
                          "mx-0.5 transition-all duration-300",
                          isMobile ? "h-5 w-5" : "h-6 w-6",
                          superReviewProgress >= star * 20 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-neutral-300"
                        )} 
                      />
                    ))}
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4 py-3 mb-2">
                    <p className="text-neutral-700">
                      {businessInfo?.businessName || "This business"} will have a detailed review 
                      based only on the information you've provided...
                      <span className="inline-block w-0.5 h-4 bg-neutral-400 ml-0.5 animate-pulse"></span>
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-2 mt-2">
                    {superReviewSteps.map((_, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          superReviewStep > index 
                            ? "bg-green-500 w-5" 
                            : superReviewStep === index 
                            ? "bg-primary w-6 animate-pulse" 
                            : "bg-neutral-200 w-3"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-50 p-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-500 text-center">
                Please wait while we generate your detailed Super Review...
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className={mobileLayoutSizes.sectionSpacing}>
        <h2 className={getMobileTextStyles("heading", "font-bold text-neutral-800 mb-3")}>
          Your Google Review
        </h2>
        <p className={getMobileTextStyles("body", "text-neutral-600 mb-6")}>
          Here's your 5-star review based on your responses
        </p>
        
        <Card className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              <Star className="fill-current" />
              <Star className="fill-current" />
              <Star className="fill-current" />
              <Star className="fill-current" />
              <Star className="fill-current" />
            </div>
            <span className="ml-2 text-neutral-600 text-sm">5.0</span>
          </div>
          
          <div 
            ref={reviewRef}
            className="text-neutral-700 mb-3 p-2 border border-dashed border-neutral-300 rounded min-h-[150px]" 
            contentEditable={true}
            onInput={handleInput}
            dangerouslySetInnerHTML={{ __html: editedReview }}
          />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Word count: {wordCount}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleEdit}
              className="text-primary hover:text-primary-600 font-medium p-0"
            >
              <Pencil className="mr-1 h-4 w-4" /> Edit
            </Button>
          </div>
        </Card>
        
        {hasFakeName && (
          <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700 flex items-start mb-3">
            <AlertTriangle className="text-red-600 mt-0.5 mr-2 h-4 w-4" />
            <span>We detected and removed a fake name signature that wasn't provided by you. The AI sometimes adds these incorrectly.</span>
          </div>
        )}
        
        <div className="bg-neutral-100 rounded-lg p-3 text-sm text-neutral-600 flex items-start">
          <InfoIcon className="text-primary mt-0.5 mr-2 h-4 w-4" />
          <span>This review follows Google's guidelines and is written at a 4th-grade reading level for maximum impact.</span>
        </div>
      </div>
      
      {/* Super Review section - show either the button or a confirmation message */}
      {relationshipType && businessInfo && answers && answers.length === 3 && (
        <div className="my-6">
          {!hasSuperReview ? (
            // Show the Super Review button if a Super Review hasn't been generated yet
            <div className={`bg-blue-50 rounded-xl ${isMobile ? "p-4" : "p-5"} ${isMobile ? "flex flex-col" : "flex"} border border-blue-100 shadow-sm`}>
              {!isMobile && (
                <div className="flex-shrink-0 mr-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <div className={`${isMobile ? "flex items-center mb-2" : ""}`}>
                  {isMobile && (
                    <div className="flex-shrink-0 mr-2">
                      <div className="bg-primary/10 rounded-full p-2">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                  <h3 className={`font-bold text-neutral-800 ${isMobile ? "text-base" : "text-lg"} ${isMobile ? "" : "mb-2"}`}>
                    Want a more detailed review?
                  </h3>
                </div>
                <p className={`text-neutral-600 mb-4 ${isMobile ? "text-sm" : ""}`}>
                  Create a "Super Review" that's more extensive and detailed. The review will only contain information from your responses and will follow Google's ethical standards.
                </p>
                <Button
                  variant="default"
                  onClick={handleGenerateSuperReview}
                  disabled={isGeneratingSuperReview}
                  className={`bg-primary text-white hover:bg-primary-600 transition-all duration-300 ${isMobile ? "py-2 h-auto w-full" : "py-2 px-4"}`}
                  size={isMobile ? "sm" : "default"}
                >
                  {isGeneratingSuperReview ? (
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>{isMobile ? "Creating..." : "Creating Super Review..."}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Sparkles className={`${isMobile ? "mr-2 h-4 w-4" : "mr-2 h-5 w-5"}`} />
                      <span className={`${isMobile ? "font-medium" : "font-medium"}`}>
                        Create Super Review
                      </span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Show a confirmation message if a Super Review has been generated
            <div className={`bg-green-50 rounded-xl ${isMobile ? "p-4" : "p-5"} ${isMobile ? "flex flex-col" : "flex"} border border-green-100 shadow-sm`}>
              {!isMobile && (
                <div className="flex-shrink-0 mr-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <div className={`${isMobile ? "flex items-center mb-2" : ""}`}>
                  {isMobile && (
                    <div className="flex-shrink-0 mr-2">
                      <div className="bg-green-100 rounded-full p-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  )}
                  <h3 className={`font-bold text-neutral-800 ${isMobile ? "text-base" : "text-lg"} ${isMobile ? "" : "mb-2"}`}>
                    Super Review Generated!
                  </h3>
                </div>
                <p className={`text-neutral-600 mb-2 ${isMobile ? "text-sm" : ""}`}>
                  Your detailed Super Review is displayed above. Feel free to make any edits before continuing.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`mt-8 ${isMobile ? "flex flex-col space-y-3" : "flex justify-between"}`}>
        {isMobile ? (
          <>
            <Button
              onClick={handleNext}
              className={getMobileButtonStyles("w-full")}
            >
              Looks Good! <Check className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={onBack}
              className={getMobileButtonStyles("w-full")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onBack}
              className={getMobileButtonStyles("flex items-center")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <Button
              onClick={handleNext}
              className={getMobileButtonStyles("flex items-center")}
            >
              Looks Good! <Check className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
