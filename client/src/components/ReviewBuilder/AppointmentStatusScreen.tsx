import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RelationshipType } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getMobileTextStyles, 
  getMobileButtonStyles,
  mobileLayoutSizes
} from "@/lib/mobile-standards";

interface AppointmentStatusScreenProps {
  onNext: (status: RelationshipType) => void;
  onBack: () => void;
}

export function AppointmentStatusScreen({ onNext, onBack }: AppointmentStatusScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<RelationshipType | null>(null);
  const isMobile = useIsMobile();
  
  const handleContinue = () => {
    if (selectedStatus) {
      onNext(selectedStatus);
    }
  };
  
  return (
    <div className={mobileLayoutSizes.containerPadding}>
      <div className={mobileLayoutSizes.sectionSpacing}>
        <h2 className={getMobileTextStyles("heading", "font-bold text-neutral-800 mb-3")}>
          Where are you in the process?
        </h2>
        <p className={getMobileTextStyles("body", "text-neutral-600 mb-6")}>
          Select the option that best describes your current relationship with the business.
        </p>
        
        <Card className="bg-white rounded-xl shadow-md p-6 mb-6">
          <RadioGroup 
            value={selectedStatus || ""} 
            onValueChange={(value) => setSelectedStatus(value as RelationshipType)}
            className="space-y-5"
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="appointment-before" id="appointment-before" className="mt-1 h-5 w-5 min-h-5 min-w-5 shrink-0" />
              <div className="grid gap-1.5">
                <Label 
                  htmlFor="appointment-before" 
                  className={getMobileTextStyles("subheading", "font-medium")}
                >
                  I've scheduled an appointment, but it hasn't happened yet
                </Label>
                <p className={getMobileTextStyles("label", "text-muted-foreground")}>
                  You've set up an appointment or consultation, but you haven't met with them yet.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="appointment-after-no-purchase" id="appointment-after-no-purchase" className="mt-1 h-5 w-5 min-h-5 min-w-5 shrink-0" />
              <div className="grid gap-1.5">
                <Label 
                  htmlFor="appointment-after-no-purchase" 
                  className={getMobileTextStyles("subheading", "font-medium")}
                >
                  I've already had my appointment, but haven't purchased yet
                </Label>
                <p className={getMobileTextStyles("label", "text-muted-foreground")}>
                  You've met with them for a consultation, but you haven't made a purchase decision.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="appointment-after-purchase" id="appointment-after-purchase" className="mt-1 h-5 w-5 min-h-5 min-w-5 shrink-0" />
              <div className="grid gap-1.5">
                <Label 
                  htmlFor="appointment-after-purchase" 
                  className={getMobileTextStyles("subheading", "font-medium")}
                >
                  I had the appointment and became a customer
                </Label>
                <p className={getMobileTextStyles("label", "text-muted-foreground")}>
                  You've had your appointment and decided to purchase their product or service.
                </p>
              </div>
            </div>
          </RadioGroup>
        </Card>
      </div>
      
      <div className={`mt-8 ${isMobile ? "flex flex-col space-y-3" : "flex justify-between"}`}>
        {isMobile ? (
          <>
            <Button
              onClick={handleContinue}
              disabled={!selectedStatus}
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
              onClick={handleContinue}
              disabled={!selectedStatus}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}