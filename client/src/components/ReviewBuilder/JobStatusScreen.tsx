import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RelationshipType } from "@/lib/types";
import { slideIn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getMobileTextStyles, 
  getMobileButtonStyles,
  mobileLayoutSizes
} from "@/lib/mobile-standards";

interface JobStatusScreenProps {
  onNext: (status: RelationshipType) => void;
  onBack: () => void;
}

interface StatusOptionProps {
  title: string;
  description: string;
  value: string;
  selected: boolean;
  onClick: () => void;
}

export function JobStatusScreen({ onNext, onBack }: JobStatusScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleNext = () => {
    if (!selected) return;
    
    // Map the selected value to a relationship type
    if (selected === "not-started") {
      onNext("appointment-after-purchase-not-started");
    } else {
      onNext("appointment-after-purchase");
    }
  };

  return (
    <div className={`${mobileLayoutSizes.containerPadding} ${slideIn}`}>
      <div className={mobileLayoutSizes.sectionSpacing}>
        <h2 className={getMobileTextStyles("heading", "font-bold text-neutral-800 mb-3")}>
          Where are you in the process?
        </h2>
        <p className={getMobileTextStyles("body", "text-neutral-600 mb-6")}>
          This helps us tailor the review to your specific situation.
        </p>
        
        <div className="space-y-4 mb-6">
          <StatusOption
            title="Work not started yet"
            description="I've made a purchase, but they haven't started the work yet."
            value="not-started"
            selected={selected === "not-started"}
            onClick={() => setSelected("not-started")}
          />
          
          <StatusOption
            title="Job is complete"
            description="I've made a purchase and the work has been completed."
            value="completed"
            selected={selected === "completed"}
            onClick={() => setSelected("completed")}
          />
        </div>
        
        <div className={`mt-8 ${isMobile ? "flex flex-col space-y-3" : "flex justify-between"}`}>
          {isMobile ? (
            <>
              <Button
                onClick={handleNext}
                disabled={!selected}
                className={getMobileButtonStyles("w-full")}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
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
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!selected}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusOption({ title, description, value, selected, onClick }: StatusOptionProps) {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all min-h-[72px] ${
        selected 
          ? "border-primary bg-primary/5" 
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className={`w-5 h-5 rounded-full border flex-shrink-0 mt-0.5 mr-3 flex items-center justify-center ${
          selected 
            ? "border-primary bg-primary" 
            : "border-gray-300"
        }`}>
          {selected && (
            <div className="w-2 h-2 rounded-full bg-white" />
          )}
        </div>
        <div>
          <h3 className={getMobileTextStyles("subheading", "font-medium")}>{title}</h3>
          <p className={getMobileTextStyles("label", "text-gray-600 mt-1")}>{description}</p>
        </div>
      </div>
    </div>
  );
}