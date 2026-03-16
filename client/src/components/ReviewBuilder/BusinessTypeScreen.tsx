import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Utensils, Home, ShoppingBag, Briefcase, Heart, HelpCircle } from "lucide-react";
import { BusinessType, businessTypeLabels, businessTypeDescriptions } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getMobileTextStyles, 
  getMobileButtonStyles,
  mobileLayoutSizes
} from "@/lib/mobile-standards";

interface BusinessTypeScreenProps {
  onNext: (businessType: BusinessType) => void;
  onBack: () => void;
  initialValue?: BusinessType;
}

const businessTypeIcons: Record<BusinessType, React.ReactNode> = {
  "restaurant": <Utensils className="w-5 h-5" />,
  "home-services": <Home className="w-5 h-5" />,
  "retail": <ShoppingBag className="w-5 h-5" />,
  "professional-services": <Briefcase className="w-5 h-5" />,
  "healthcare": <Heart className="w-5 h-5" />,
  "other": <HelpCircle className="w-5 h-5" />
};

const businessTypes: BusinessType[] = [
  "restaurant",
  "home-services",
  "retail",
  "professional-services",
  "healthcare",
  "other"
];

export function BusinessTypeScreen({ onNext, onBack, initialValue }: BusinessTypeScreenProps) {
  const [selectedType, setSelectedType] = useState<BusinessType | null>(initialValue || null);
  const isMobile = useIsMobile();

  const handleNext = () => {
    if (selectedType) {
      onNext(selectedType);
    }
  };

  return (
    <div className={mobileLayoutSizes.containerPadding}>
      <div className={mobileLayoutSizes.sectionSpacing}>
        <h2 className={getMobileTextStyles("heading", "font-bold text-neutral-800 mb-3")}>
          What type of business is this?
        </h2>
        <p className={getMobileTextStyles("body", "text-neutral-600 mb-6")}>
          This helps us ask the right questions for your review
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {businessTypes.map((type) => (
            <BusinessTypeOption
              key={type}
              type={type}
              selected={selectedType === type}
              onClick={() => setSelectedType(type)}
            />
          ))}
        </div>
      </div>
      
      <div className={`mt-8 ${isMobile ? "flex flex-col space-y-3" : "flex justify-between"}`}>
        {isMobile ? (
          <>
            <Button
              onClick={handleNext}
              disabled={!selectedType}
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
              disabled={!selectedType}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

interface BusinessTypeOptionProps {
  type: BusinessType;
  selected: boolean;
  onClick: () => void;
}

function BusinessTypeOption({ type, selected, onClick }: BusinessTypeOptionProps) {
  return (
    <div 
      className={`relative bg-white rounded-xl border-2 ${selected ? 'border-primary bg-primary/5' : 'border-neutral-200'} p-4 cursor-pointer hover:border-primary/60 hover:shadow-sm transition-all text-center`} 
      onClick={onClick}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className={`w-10 h-10 mx-auto mb-2 rounded-xl ${selected ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600'} flex items-center justify-center transition-colors`}>
        {businessTypeIcons[type]}
      </div>
      <h3 className="font-medium text-neutral-800 text-sm leading-tight">{businessTypeLabels[type]}</h3>
      <p className="text-neutral-400 text-xs mt-0.5 leading-tight">{businessTypeDescriptions[type]}</p>
    </div>
  );
}
