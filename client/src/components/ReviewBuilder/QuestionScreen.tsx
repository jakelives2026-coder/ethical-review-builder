import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import { RelationshipType, BusinessType } from "@/lib/types";
import { relationshipQuestions } from "@/lib/relationship-questions";
import { getQuestionsForBusinessType } from "@/lib/business-type-questions";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getMobileTextStyles, 
  getMobileButtonStyles,
  mobileLayoutSizes
} from "@/lib/mobile-standards";

interface QuestionScreenProps {
  relationshipType: RelationshipType;
  businessType?: BusinessType | null;
  questionNumber: 1 | 2 | 3 | 4;
  currentAnswer?: string;
  onNext: (answer: string) => void;
  onBack: () => void;
  isLastQuestion?: boolean;
}

export function QuestionScreen({ 
  relationshipType,
  businessType,
  questionNumber,
  currentAnswer = "",
  onNext,
  onBack,
  isLastQuestion = false
}: QuestionScreenProps) {
  const [answer, setAnswer] = useState(currentAnswer);
  const [isValid, setIsValid] = useState(false);
  const isMobile = useIsMobile();
  
  const questionIndex = questionNumber - 1;
  
  // Get business-type-specific questions if available, otherwise fall back to default
  const businessTypeQuestions = businessType ? getQuestionsForBusinessType(businessType, relationshipType) : null;
  const questions = businessTypeQuestions || relationshipQuestions[relationshipType];
  const currentQuestion = questions[questionIndex];
  const { question, subtitle, placeholder, options } = currentQuestion;
  
  useEffect(() => {
    setIsValid(answer.trim() !== "");
  }, [answer]);
  
  const handleSubmit = () => {
    if (isValid) {
      onNext(answer);
    }
  };

  const handleOptionSelect = (option: string) => {
    setAnswer(option);
  };
  
  return (
    <div className={mobileLayoutSizes.containerPadding}>
      <div className={mobileLayoutSizes.sectionSpacing}>
        <h2 className={getMobileTextStyles("heading", "font-bold text-neutral-800 mb-3")}>
          {question}
        </h2>
        <p className={getMobileTextStyles("body", "text-neutral-600 mb-6")}>
          {subtitle}
        </p>
        
        {options ? (
          <div className="space-y-4">
            {options.map((option, index) => (
              <Card 
                key={index}
                className={`p-4 cursor-pointer transition-all min-h-[72px] ${
                  answer === option 
                    ? 'border-primary bg-primary/5' 
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                    answer === option
                      ? 'bg-primary text-white'
                      : 'border border-neutral-300'
                  }`}>
                    {answer === option && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <p className={getMobileTextStyles("body", "text-neutral-800")}>
                      {option}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className={`w-full p-4 min-h-[144px] ${getMobileTextStyles("body")}`}
            placeholder={placeholder}
          />
        )}
      </div>
      
      <div className={`mt-8 ${isMobile ? "flex flex-col space-y-3" : "flex justify-between"}`}>
        {isMobile ? (
          <>
            <Button
              onClick={handleSubmit}
              disabled={!isValid}
              className={getMobileButtonStyles("w-full")}
            >
              {isLastQuestion ? (
                <>Generate Review <Sparkles className="ml-2 h-4 w-4" /></>
              ) : (
                <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
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
              onClick={handleSubmit}
              disabled={!isValid}
              className={getMobileButtonStyles("flex items-center")}
            >
              {isLastQuestion ? (
                <>Generate Review <Sparkles className="ml-2 h-4 w-4" /></>
              ) : (
                <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
