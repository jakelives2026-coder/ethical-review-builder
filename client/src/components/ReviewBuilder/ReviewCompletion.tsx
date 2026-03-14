import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy, RotateCcw, Camera, Image, Sparkles } from "lucide-react";
import { BusinessInfo } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import {
  getMobileTextStyles,
  getMobileButtonStyles,
  mobileLayoutSizes
} from "@/lib/mobile-standards";

interface ReviewCompletionProps {
  review: string;
  businessInfo: BusinessInfo;
  onStartOver: () => void;
}

export function ReviewCompletion({ review, businessInfo, onStartOver }: ReviewCompletionProps) {
  const [copied, setCopied] = useState(false);
  const [showPhotoTips, setShowPhotoTips] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(review);
      setCopied(true);
      toast({
        title: "Success",
        description: "Review copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };
  
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${businessInfo.businessName} ${businessInfo.businessService} ${businessInfo.businessLocation}`
  )}`;
  
  return (
    <div className={mobileLayoutSizes.containerPadding}>
      <h2 className={getMobileTextStyles("heading", "font-bold text-neutral-800 mb-3 text-center")}>
        Your Generated Review
      </h2>
      
      <Card className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div id="reviewOutput" className="text-neutral-700 mb-4 text-left whitespace-pre-wrap bg-[#f9f9f9] p-4 rounded-md">
          {review}
        </div>
        
        <Button
          onClick={handleCopy}
          variant={copied ? "secondary" : "default"}
          className={getMobileButtonStyles("w-full")}
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
            </>
          )}
        </Button>
      </Card>
      
      <div className="bg-neutral-100 rounded-lg p-4 text-left mb-6">
        <h3 className="font-semibold text-neutral-800 mb-2">Next steps:</h3>
        <ol className="text-neutral-700 space-y-2 list-decimal list-inside">
          <li>Click the Google button below</li>
          <li>Find "<span className="font-medium">{businessInfo.businessName} in {businessInfo.businessLocation}</span>" in the search results</li>
          <li>Click "Write a review"</li>
          <li>Paste your review and submit</li>
          <li className="flex items-start">
            <span className="mr-2">On Google, you can also include a photo with your review</span>
            <button
              onClick={() => setShowPhotoTips(!showPhotoTips)}
              className="text-xs underline text-primary-500 flex-shrink-0 py-1 px-1 -my-1 -mx-1"
              aria-label={showPhotoTips ? "Hide helpful tips" : "Show helpful tips"}
            >
              {showPhotoTips ? "Hide tips" : "Show tips"}
            </button>
          </li>
        </ol>

        {showPhotoTips && (
          <div className="ml-5 mt-2 bg-primary-50 p-3 rounded-md border border-primary-100">
            <h4 className="font-medium text-primary-700 flex items-center mb-2">
              <Camera className="h-4 w-4 mr-1.5" />
              Helpful Photo Tips for Google Reviews
            </h4>
            <div className="text-xs text-neutral-600 italic mb-2">
              Note: Photos are added directly on Google's platform, not in this app.
            </div>
            <ul className="text-sm text-neutral-700 space-y-1.5 list-disc list-inside mb-3">
              <li>Reviews with photos are <span className="font-medium">twice as likely to be helpful</span> to other users</li>
              <li>Choose a clear, well-lit photo of the business, product, or service</li>
              <li>Photos showing the storefront, signage, or inside the business work well</li>
              <li>Include photos that show what makes this business special</li>
              <li>Avoid photos with personal information or faces of others</li>
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-center p-2 bg-white rounded border border-primary-100">
              <div className="text-center p-2 bg-neutral-50 rounded-md border border-dashed border-neutral-300 flex-1 w-full">
                <div className="flex flex-col items-center gap-1">
                  <Image className="h-5 w-5 text-neutral-500 mb-1" />
                  <p className="text-xs text-neutral-700 font-medium">Select photos on Google</p>
                  <p className="text-xs text-neutral-500">You'll be able to add photos when writing your review on Google</p>
                </div>
              </div>
              
              <div className="text-center p-2 flex-1 w-full">
                <div className="border border-dashed border-neutral-300 rounded-md p-4 flex flex-col items-center bg-neutral-50">
                  <div className="text-xs text-neutral-500 mb-1">Example photo types for Google Reviews</div>
                  <div className="flex gap-2 mt-1">
                    <div className="w-12 h-12 bg-primary-100 rounded flex items-center justify-center">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 rounded flex items-center justify-center">
                      <span className="text-2xl">🛍️</span>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 rounded flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-2 text-sm text-neutral-500">Search query: "{businessInfo.businessName} {businessInfo.businessService} {businessInfo.businessLocation}"</div>
        <div className="mt-3 pt-3 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 mb-1"><strong>Can't find the business?</strong> Try:</p>
          <ul className="text-sm text-neutral-600 list-disc list-inside">
            <li>Adding "google reviews" to your search</li>
            <li>Looking for a Google Maps result or Knowledge Panel</li>
            <li>Searching for their website, then finding the "Leave a review" link</li>
          </ul>
        </div>
      </div>
      
      <a 
        href={googleSearchUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className={`${getMobileButtonStyles("block w-full flex items-center justify-center mb-4")} bg-white border border-neutral-300 text-neutral-800 font-medium rounded-lg transition duration-200 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300`}
      >
        <svg className="h-6 mr-2" viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg">
          <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
          <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
          <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
          <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
          <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
          <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" fill="#4285F4"/>
        </svg>
        Find Business on Google
      </a>
      
      {!isAuthenticated && (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <Sparkles className="mx-auto mb-2 h-5 w-5 text-primary" />
          <p className="mb-1 text-sm font-semibold text-neutral-800">Save this review to your account</p>
          <p className="mb-3 text-xs text-neutral-500">Track all your reviews, manage multiple businesses, and generate unlimited reviews — free to start.</p>
          <a
            href="/auth?tab=register"
            className={getMobileButtonStyles("block w-full flex items-center justify-center bg-primary text-white font-medium rounded-lg transition duration-200 hover:bg-primary/90")}
          >
            Create Free Account →
          </a>
        </div>
      )}

      <Button
        onClick={onStartOver}
        variant="outline"
        className={getMobileButtonStyles("w-full")}
      >
        <RotateCcw className="mr-2 h-4 w-4" /> Create Another Review
      </Button>
    </div>
  );
}
