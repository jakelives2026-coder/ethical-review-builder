import { Progress } from "@/components/ui/progress";
import { getMobileTextStyles, mobileLayoutSizes } from "@/lib/mobile-standards";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  return (
    <div className={`sticky top-0 z-10 pt-2 pb-4 bg-neutral-50 ${mobileLayoutSizes.containerPadding}`}>
      <div className="flex justify-center mb-2">
        <span className={getMobileTextStyles("label")}>
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}
