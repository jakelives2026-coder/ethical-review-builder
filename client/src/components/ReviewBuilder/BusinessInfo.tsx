import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import { BusinessInfo } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  getMobileTextStyles,
  getMobileInputStyles,
  getMobileButtonStyles,
  mobileLayoutSizes
} from "@/lib/mobile-standards";
import { LocationInput } from "@/components/ui/location-input";
import { GooglePlacesBusinessInput } from "@/components/ui/google-places-input";

// Helper function to extract city and state from formatted address
function shortAddress(full: string): string {
  const parts = full.split(',');
  if (parts.length >= 3) {
    const city = parts[parts.length - 3]?.trim();
    const stateZip = parts[parts.length - 2]?.trim();
    const state = stateZip?.split(' ').find(s => /^[A-Z]{2}$/.test(s));
    return city && state ? `${city}, ${state}` : full;
  }
  return full;
}

interface BusinessInfoScreenProps {
  initialData?: BusinessInfo;
  onNext: (data: BusinessInfo) => void;
  onBack: () => void;
}

export function BusinessInfoScreen({ initialData, onNext, onBack }: BusinessInfoScreenProps) {
  const [businessName, setBusinessName] = useState(initialData?.businessName || "");
  const [businessLocation, setBusinessLocation] = useState(initialData?.businessLocation || "");
  const [businessService, setBusinessService] = useState(initialData?.businessService || "");
  const [representativeName, setRepresentativeName] = useState(initialData?.representativeName || "");
  const [isValid, setIsValid] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setIsValid(
      businessName.trim() !== "" && 
      businessLocation.trim() !== "" && 
      businessService.trim() !== ""
    );
  }, [businessName, businessLocation, businessService]);
  
  const handleSubmit = () => {
    if (isValid) {
      onNext({
        businessName,
        businessLocation,
        businessService,
        representativeName: representativeName.trim() || undefined
      });
    }
  };
  
  return (
    <div className={mobileLayoutSizes.containerPadding}>
      <div className={mobileLayoutSizes.sectionSpacing}>
        <h2 className={getMobileTextStyles("heading", "font-bold text-neutral-800 mb-3")}>
          Tell us about the business
        </h2>
        <p className={getMobileTextStyles("body", "text-neutral-600 mb-6")}>
          This helps us create a relevant review
        </p>
        
        <div className="space-y-5">
          <div className="form-group">
            <div className="flex items-center gap-2 mb-2">
              <Label
                htmlFor="business-name"
                className={getMobileTextStyles("label", "font-medium text-neutral-700")}
              >
                Business Name
              </Label>
            </div>
            <GooglePlacesBusinessInput
              onBusinessSelect={(business) => {
                setBusinessName(business.businessName);
                if (business.formattedAddress) {
                  setBusinessLocation(shortAddress(business.formattedAddress));
                }
              }}
              defaultValue={businessName}
              placeholder="Search for your business..."
              className={getMobileInputStyles()}
              required={true}
            />
          </div>
          
          <div className="form-group">
            <div className="flex items-center gap-2 mb-2">
              <Label 
                htmlFor="business-location" 
                className={getMobileTextStyles("label", "font-medium text-neutral-700")}
              >
                City or Location
              </Label>
            </div>
            <LocationInput
              onLocationSelect={(locationData) => {
                // Use the formatted address or fallback to city/state format
                if (locationData.formatted_address) {
                  setBusinessLocation(locationData.formatted_address);
                } else if (locationData.city && locationData.state) {
                  setBusinessLocation(`${locationData.city}, ${locationData.state}`);
                } else if (locationData.city) {
                  setBusinessLocation(locationData.city);
                }
              }}
              defaultValue={businessLocation}
              placeholder="Enter city and state..."
              className={getMobileInputStyles()}
              required={true}
            />
          </div>
          
          <FormInput
            label="Service or Product"
            id="business-service"
            value={businessService}
            onChange={(e) => setBusinessService(e.target.value)}
            placeholder="e.g. Hair salon, Plumbing services"
          />
          
          <div className="form-group">
            <div className="flex items-center gap-2 mb-2">
              <Label 
                htmlFor="representative-name" 
                className={getMobileTextStyles("label", "font-medium text-neutral-700")}
              >
                Contact Name at Business
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <HelpCircle className="h-4 w-4 text-neutral-400" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className={getMobileTextStyles("body", "w-[200px]")}>
                      Adding a person's name (like "Jason" or "Sarah") will make your review more personal and authentic.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input 
              id="representative-name" 
              value={representativeName}
              onChange={(e) => setRepresentativeName(e.target.value)}
              className={getMobileInputStyles()}
              placeholder="e.g. Jason, Sarah (optional but recommended)"
            />
          </div>
        </div>
      </div>
      
      <div className={`mt-8 ${isMobile ? "flex flex-col space-y-3" : "flex justify-between"}`}>
        {isMobile ? (
          <>
            <Button
              onClick={handleSubmit}
              disabled={!isValid}
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
              onClick={handleSubmit}
              disabled={!isValid}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
