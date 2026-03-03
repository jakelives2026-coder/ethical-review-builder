import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getMobileTextStyles, 
  getMobileButtonStyles,
  mobileLayoutSizes
} from "@/lib/mobile-standards";

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`flex flex-col h-full justify-between ${mobileLayoutSizes.containerPadding}`}>
      <div className="text-center pt-6 pb-4">
        <h1 className={getMobileTextStyles("heading", "font-bold text-neutral-800 mb-2 text-2xl md:text-3xl")}>
          Ethical Review Builder
        </h1>
        <p className={getMobileTextStyles("body", "text-neutral-600 mb-6")}>Create a thoughtful review in under 2 minutes.</p>
        
        <Card className="bg-white rounded-xl shadow-md p-6 mb-6">
          <svg 
            className="mx-auto mb-4 w-full h-40"
            viewBox="0 0 400 225"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="225" rx="8" fill="#F0F4FF" />
            <path d="M200 112.5C200 129.897 185.897 144 168.5 144C151.103 144 137 129.897 137 112.5C137 95.103 151.103 81 168.5 81C185.897 81 200 95.103 200 112.5Z" fill="#4A6FFF" fillOpacity="0.2" />
            <path d="M168.5 144C185.897 144 200 129.897 200 112.5C200 95.103 185.897 81 168.5 81C151.103 81 137 95.103 137 112.5C137 129.897 151.103 144 168.5 144Z" stroke="#4A6FFF" strokeWidth="2" />
            <path d="M173.5 106.5L166 114L163.5 111.5" stroke="#4A6FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M263 112.5C263 129.897 248.897 144 231.5 144C214.103 144 200 129.897 200 112.5C200 95.103 214.103 81 231.5 81C248.897 81 263 95.103 263 112.5Z" fill="#3DD598" fillOpacity="0.2" />
            <path d="M231.5 144C248.897 144 263 129.897 263 112.5C263 95.103 248.897 81 231.5 81C214.103 81 200 95.103 200 112.5C200 129.897 214.103 144 231.5 144Z" stroke="#3DD598" strokeWidth="2" />
            <path d="M236.5 106.5L229 114L226.5 111.5" stroke="#3DD598" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="127" y="157" width="146" height="32" rx="4" fill="white" />
            <rect x="134" y="169" width="132" height="8" rx="4" fill="#E2E8F0" />
          </svg>
          <h2 className={getMobileTextStyles("subheading", "font-semibold text-neutral-800 mb-2")}>
            Why use this tool?
          </h2>
          <ul className="text-left text-neutral-700 space-y-3">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-secondary-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className={getMobileTextStyles("body")}>Simple, guided process</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-secondary-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className={getMobileTextStyles("body")}>AI helps craft the perfect wording</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-secondary-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className={getMobileTextStyles("body")}>Always follows Google's guidelines</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-secondary-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className={getMobileTextStyles("body")}>Optimized for local SEO impact</span>
            </li>
          </ul>
        </Card>
      </div>
      <div className="mt-auto">
        <Button 
          onClick={onNext}
          className={getMobileButtonStyles("w-full")}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
