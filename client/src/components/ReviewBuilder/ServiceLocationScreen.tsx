import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Building2, Truck } from "lucide-react";
import { ServiceLocationType } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getMobileTextStyles, 
  getMobileButtonStyles,
  mobileLayoutSizes
} from "@/lib/mobile-standards";

interface ServiceLocationScreenProps {
  onNext: (serviceLocation: ServiceLocationType) => void;
  onBack: () => void;
}

export function ServiceLocationScreen({ onNext, onBack }: ServiceLocationScreenProps) {
  const [selected, setSelected] = useState<ServiceLocationType | null>(null);
  const isMobile = useIsMobile();

  const handleNext = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <div className={mobileLayoutSizes.containerPadding}>
      <div className={mobileLayoutSizes.sectionSpacing}>
        <h2 className={getMobileTextStyles("heading", "font-bold text-neutral-800 mb-3")}>
          Where did the service happen?
        </h2>
        <p className={getMobileTextStyles("body", "text-neutral-600 mb-6")}>
          This helps us write a more accurate review
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelected("visited")}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
              selected === "visited"
                ? "border-primary bg-primary/5"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <Building2 className={`h-8 w-8 mb-3 ${selected === "visited" ? "text-primary" : "text-neutral-500"}`} />
            <span className={`font-medium text-center ${selected === "visited" ? "text-primary" : "text-neutral-700"}`}>
              I visited them
            </span>
            <span className="text-xs text-neutral-500 text-center mt-1">
              Went to their location
            </span>
          </button>
          
          <button
            onClick={() => setSelected("came-to-me")}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
              selected === "came-to-me"
                ? "border-primary bg-primary/5"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <Truck className={`h-8 w-8 mb-3 ${selected === "came-to-me" ? "text-primary" : "text-neutral-500"}`} />
            <span className={`font-medium text-center ${selected === "came-to-me" ? "text-primary" : "text-neutral-700"}`}>
              They came to me
            </span>
            <span className="text-xs text-neutral-500 text-center mt-1">
              Mobile or in-home service
            </span>
          </button>
        </div>
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
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <Button onClick={handleNext} disabled={!selected}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
