import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RelationshipType } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getMobileTextStyles, 
  getMobileButtonStyles,
  mobileLayoutSizes
} from "@/lib/mobile-standards";

interface RelationshipTypeScreenProps {
  onNext: (relationship: RelationshipType) => void;
  onBack: () => void;
  showAppointmentOption?: boolean;
}

export function RelationshipTypeScreen({ onNext, onBack, showAppointmentOption = true }: RelationshipTypeScreenProps) {
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipType | null>(null);
  const isMobile = useIsMobile();

  const handleNext = () => {
    if (selectedRelationship) {
      onNext(selectedRelationship);
    }
  };

  return (
    <div className={mobileLayoutSizes.containerPadding}>
      <div className={mobileLayoutSizes.sectionSpacing}>
        <h2 className={getMobileTextStyles("heading", "font-bold text-neutral-800 mb-3")}>
          What's your relationship with this business?
        </h2>
        <p className={getMobileTextStyles("body", "text-neutral-600 mb-6")}>
          We'll tailor questions based on your experience
        </p>
        
        <div className="space-y-4">
          <RelationshipOption
            title="I've been a customer"
            description="I've used their products or services"
            value="customer"
            selected={selectedRelationship === "customer"}
            onClick={() => setSelectedRelationship("customer")}
          />
          
          <RelationshipOption
            title="I know or follow the business"
            description="I'm familiar with them but haven't used services"
            value="acquaintance"
            selected={selectedRelationship === "acquaintance"}
            onClick={() => setSelectedRelationship("acquaintance")}
          />
          
          {showAppointmentOption && (
            <RelationshipOption
              title="I scheduled an appointment"
              description="I've made contact but service is pending"
              value="appointment"
              selected={selectedRelationship === "appointment-before" || 
                         selectedRelationship === "appointment-after-no-purchase" || 
                         selectedRelationship === "appointment-after-purchase" || 
                         selectedRelationship === "appointment"}
              onClick={() => setSelectedRelationship("appointment")}
            />
          )}
        </div>
      </div>
      
      <div className={`mt-8 ${isMobile ? "flex flex-col space-y-3" : "flex justify-between"}`}>
        {isMobile ? (
          <>
            <Button
              onClick={handleNext}
              disabled={!selectedRelationship}
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
              className={getMobileButtonStyles("flex items-center")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!selectedRelationship}
              className={getMobileButtonStyles("flex items-center")}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

interface RelationshipOptionProps {
  title: string;
  description: string;
  value: string;
  selected: boolean;
  onClick: () => void;
}

function RelationshipOption({ title, description, value, selected, onClick }: RelationshipOptionProps) {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border ${selected ? 'border-primary' : 'border-neutral-200'} ${isMobile ? 'p-4' : 'p-4'} cursor-pointer hover:border-primary transition-all min-h-[72px]`} 
      data-value={value}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6'} rounded-full border-2 ${selected ? 'border-primary' : 'border-neutral-300'} flex items-center justify-center mr-3 flex-shrink-0`}>
          {selected && <div className="w-3 h-3 rounded-full bg-primary"></div>}
        </div>
        <div>
          <h3 className={getMobileTextStyles("subheading", "font-medium text-neutral-800")}>{title}</h3>
          <p className={getMobileTextStyles("label", "text-neutral-500")}>{description}</p>
        </div>
      </div>
    </div>
  );
}
