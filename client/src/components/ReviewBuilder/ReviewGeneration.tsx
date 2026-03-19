import React, { useEffect, useState, useRef, useMemo } from "react";
import { Sparkles, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BusinessInfo } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReviewGenerationProps {
  onComplete: () => void;
  apiReady: boolean;
  businessInfo?: BusinessInfo;
  limitReached?: boolean;
}

export function ReviewGeneration({ onComplete, apiReady, businessInfo, limitReached }: ReviewGenerationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  
  // Define snippets state
  const [reviewSnippets, setReviewSnippets] = useState([
    "I was really impressed with the service...",
    "The staff was friendly and professional...",
    "They went above and beyond my expectations...",
    "I would definitely recommend them to anyone...",
    "The quality of work was exceptional...",
    "The attention to detail was outstanding..."
  ]);
  
  // Update snippets when business info changes, with shorter versions for mobile
  useEffect(() => {
    if (businessInfo?.businessName) {
      if (isMobile) {
        // Shorter snippets for mobile
        setReviewSnippets([
          `${businessInfo.businessName} impressed me...`,
          `Staff was friendly and professional...`,
          `They exceeded my expectations...`,
          `I would recommend them...`,
          `Quality was exceptional...`,
          `Great attention to detail...`
        ]);
      } else {
        // Full snippets for desktop
        setReviewSnippets([
          `${businessInfo.businessName} impressed me with their service...`,
          `The staff at ${businessInfo.businessName} was friendly and professional...`,
          `${businessInfo.businessName} exceeded my expectations...`,
          `I would recommend ${businessInfo.businessName} to anyone...`,
          `The quality of ${businessInfo.businessService || 'work'} was exceptional...`,
          `${businessInfo.businessName}'s attention to detail was outstanding...`
        ]);
      }
    }
  }, [businessInfo, isMobile]);
  
  // Animation steps - simplified on mobile
  const steps = useMemo(() => {
    const businessName = businessInfo?.businessName;
    const serviceType = businessInfo?.businessService || "service";
    
    // Simpler, shorter status messages for mobile
    if (isMobile) {
      return [
        { text: "Analyzing responses...", delay: 900 },
        { text: "Building structure...", delay: 1300 },
        { text: "Optimizing...", delay: 1000 },
        { text: "Adjusting readability...", delay: 1100 },
        { text: "Finalizing review...", delay: 900 }
      ];
    }
    
    // Full, detailed status messages for desktop
    return [
      { text: "Analyzing your responses...", delay: 1000 },
      { text: businessName 
        ? `Building review structure for ${businessName}...` 
        : "Building review structure...", delay: 1500 },
      { text: "Optimizing for SEO...", delay: 1200 },
      { text: "Applying 4th-grade readability...", delay: 1300 },
      { text: businessName 
        ? `Finalizing your ${serviceType} review...` 
        : "Finalizing your review...", delay: 1000 }
    ];
  }, [businessInfo, isMobile]);
  
  // Typewriter effect for review snippets - optimized for mobile
  useEffect(() => {
    if (currentStep < steps.length) {
      // Get a random review snippet
      const snippet = reviewSnippets[Math.floor(Math.random() * reviewSnippets.length)];
      let index = 0;
      
      // Clear previous animation if exists
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      
      // Typewriter effect - different timing for mobile vs desktop
      const typingSpeed = isMobile ? 70 : 50; // Slower on mobile for better performance
      const pauseTime = isMobile ? 800 : 1000; // Shorter pause on mobile
      
      animationRef.current = setInterval(() => {
        if (index < snippet.length) {
          setTypedText(snippet.substring(0, index + 1));
          index++;
        } else {
          // When finished typing, pause briefly then clear and start over
          setTimeout(() => {
            setTypedText("");
            index = 0;
          }, pauseTime);
        }
      }, typingSpeed);
      
      return () => {
        if (animationRef.current) clearInterval(animationRef.current);
      };
    }
  }, [currentStep, reviewSnippets, isMobile]);
  
  // Progress through the animation steps
  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setProgress((currentStep + 1) * (100 / steps.length));
      }, steps[currentStep].delay);
      return () => clearTimeout(timer);
    } else {
      setAnimationDone(true);
    }
  }, [currentStep, steps]);

  // Fire onComplete only when both the animation and the API call are done
  useEffect(() => {
    if (animationDone && apiReady) {
      onComplete();
    }
  }, [animationDone, apiReady, onComplete]);
  
  return (
    <div className="pt-4 pb-2 text-center px-3">
      {/* Show upgrade panel if monthly limit is reached */}
      {limitReached ? (
        <div className={cn(
          "rounded-xl border shadow-sm mt-4",
          isMobile ? "p-4" : "p-5",
          "bg-amber-50 border-amber-200"
        )}>
          <h2 className={cn(
            "font-bold text-neutral-800 mb-3",
            isMobile ? "text-lg" : "text-xl"
          )}>
            Monthly review limit reached
          </h2>
          <p className={cn(
            "text-neutral-600 mb-4",
            isMobile ? "text-sm" : "text-base"
          )}>
            You've used your 3 free reviews this month. Upgrade to Pro to keep generating unlimited reviews.
          </p>
          <a
            href="/pricing"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Upgrade to Pro →
          </a>
        </div>
      ) : (
        <>
          <h2 className={cn(
            "font-bold text-neutral-800 mb-2",
            isMobile ? "text-xl" : "text-2xl"
          )}>
            Creating your review
          </h2>
          <p className={cn(
            "text-neutral-600 mb-4",
            isMobile ? "text-sm px-2" : ""
          )}>
            {businessInfo?.businessName
              ? `Please wait while our AI crafts the perfect review for ${businessInfo.businessName}`
              : "Please wait while our AI crafts the perfect review"}
          </p>
        </>
      )}

      {!limitReached && (
        <>
          {/* Progress bar */}
          <div className={cn(
            "w-full mx-auto mb-6 bg-neutral-200 rounded-full h-2.5 overflow-hidden",
            isMobile ? "max-w-[95%]" : "max-w-md"
          )}>
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Animation container */}
      <div className={cn(
        "relative mx-auto bg-neutral-50 rounded-xl shadow-lg mb-4 overflow-hidden",
        isMobile ? "p-4 min-h-[180px] max-w-[95%]" : "p-6 min-h-[220px] max-w-lg"
      )}>
        {/* Floating particles - fewer on mobile */}
        {!isMobile && (
          <>
            <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/20 animate-[bounce_3s_ease-in-out_infinite]"></div>
            <div className="absolute top-3/4 left-1/2 w-2 h-2 rounded-full bg-primary/20 animate-[bounce_4s_ease-in-out_0.5s_infinite]"></div>
            <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-primary/20 animate-[bounce_5s_ease-in-out_1s_infinite]"></div>
            <div className="absolute top-1/3 left-3/4 w-2 h-2 rounded-full bg-primary/20 animate-[bounce_4.5s_ease-in-out_1.5s_infinite]"></div>
            <div className="absolute top-2/3 left-1/3 w-2 h-2 rounded-full bg-primary/20 animate-[bounce_3.5s_ease-in-out_0.2s_infinite]"></div>
            <div className="absolute top-1/2 left-2/3 w-2 h-2 rounded-full bg-primary/20 animate-[bounce_6s_ease-in-out_0.7s_infinite]"></div>
          </>
        )}
        {/* Only 3 particles on mobile for better performance */}
        {isMobile && (
          <>
            <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/20 animate-[bounce_3s_ease-in-out_infinite]"></div>
            <div className="absolute top-3/4 left-1/2 w-2 h-2 rounded-full bg-primary/20 animate-[bounce_4s_ease-in-out_0.5s_infinite]"></div>
            <div className="absolute top-2/3 left-1/3 w-2 h-2 rounded-full bg-primary/20 animate-[bounce_3.5s_ease-in-out_0.2s_infinite]"></div>
          </>
        )}
        
        {/* Background gradient - smaller on mobile */}
        <div className={cn(
          "absolute top-0 right-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full -z-10 opacity-70 animate-pulse",
          isMobile ? "w-24 h-24" : "w-32 h-32"
        )}
          style={{ transform: 'translate(30%, -30%)' }}
        />

        {/* Status text */}
        <div className="flex items-center justify-center mb-3">
          <Sparkles className={cn(isMobile ? "h-4 w-4" : "h-5 w-5", "text-primary mr-2")} />
          <p className={cn(
            "text-neutral-600 font-medium",
            isMobile ? "text-sm" : ""
          )}>
            {currentStep < steps.length ? steps[currentStep].text : "Review ready!"}
          </p>
        </div>
        
        {/* Typing animation */}
        <div className={cn(
          "border-l-4 border-primary pl-4 py-2 text-left flex items-center",
          isMobile ? "min-h-[80px]" : "min-h-[100px]"
        )}>
          <p className={cn(
            "text-neutral-700",
            isMobile ? "text-sm" : ""
          )}>
            {typedText}
            <span className={cn(
              "inline-block bg-neutral-400 ml-0.5 animate-pulse",
              isMobile ? "w-0.5 h-3" : "w-0.5 h-4"
            )}></span>
          </p>
        </div>
        
        {/* Decorative stars */}
        <div className="flex justify-center mt-3 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={cn(
                "mx-0.5 transition-all duration-300",
                isMobile ? "h-4 w-4" : "h-5 w-5",
                progress >= star * 20 
                  ? "text-yellow-400 fill-yellow-400" 
                  : "text-neutral-300"
              )} 
            />
          ))}
        </div>
        
        {/* Process status - simplified on mobile */}
        {!isMobile && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={cn(
                  "text-xs px-2 py-1 rounded-full flex items-center",
                  currentStep > index 
                    ? "bg-green-100 text-green-800" 
                    : currentStep === index 
                    ? "bg-primary/10 text-primary animate-pulse" 
                    : "bg-neutral-100 text-neutral-400"
                )}
              >
                {currentStep > index && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {step.text.split(" ")[0]}
              </div>
            ))}
          </div>
        )}
        {/* Simplified status indicators for mobile */}
        {isMobile && (
          <div className="mt-3 flex justify-center gap-1">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  currentStep > index 
                    ? "bg-green-500 w-5" 
                    : currentStep === index 
                    ? "bg-primary w-6 animate-pulse" 
                    : "bg-neutral-200 w-3"
                )}
              />
            ))}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
