import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ReviewBuilder } from "@/components/ReviewBuilder";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface PublicProfile {
  id: number;
  businessName: string;
  businessLocation: string;
  businessService: string;
  businessType: string | null;
  services: string | null;
  representativeName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  welcomeMessage: string | null;
}

interface ProjectContext {
  city?: string;
  services?: string[];
  areas?: string[];
  materials?: string;
  summary?: string;
}

interface ReviewRequestData {
  preFilledData: {
    businessName: string;
    businessLocation: string;
    businessService: string;
    businessType: string | null;
    representativeName?: string;
    city?: string;
    service?: string;
    contactName?: string;
    platformName?: string;
    platformUrl?: string;
  };
  projectContext?: ProjectContext | null;
  businessProfile: PublicProfile;
}

export default function PublicReview() {
  const params = useParams();
  const [location] = useLocation();
  const shareSlug = params.shareSlug;
  const [reviewRequestData, setReviewRequestData] = useState<ReviewRequestData | null>(null);
  const [platformInfo, setPlatformInfo] = useState<{ platformName: string; platformUrl: string } | undefined>(undefined);

  // Extract token from URL query params
  const requestToken = new URLSearchParams(window.location.search).get("req");

  // Fetch review request data if token is present
  const { data: requestData, isLoading: isLoadingRequest } = useQuery({
    queryKey: ["/api/email-review-requests", requestToken],
    queryFn: async () => {
      const res = await fetch(`/api/email-review-requests/${requestToken}`);
      if (!res.ok) {
        throw new Error("Review request not found or expired");
      }
      return res.json();
    },
    enabled: !!requestToken,
    retry: false
  });

  useEffect(() => {
    if (requestData) {
      setReviewRequestData(requestData);
      setPlatformInfo({
        platformName: requestData.preFilledData.platformName,
        platformUrl: requestData.preFilledData.platformUrl
      });
    }
  }, [requestData]);

  const { data: profile, isLoading, error } = useQuery<PublicProfile>({
    queryKey: ["/api/public/review", shareSlug],
    queryFn: async () => {
      const res = await fetch(`/api/public/review/${shareSlug}`);
      if (!res.ok) {
        throw new Error("Review page not found");
      }
      return res.json();
    },
    enabled: !!shareSlug
  });
  
  if (isLoading || isLoadingRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Review Page Not Found</h1>
          <p className="text-gray-600">This review link may be expired or invalid.</p>
        </div>
      </div>
    );
  }

  // Determine which prefill data to use (from request or profile)
  const prefillData = reviewRequestData
    ? reviewRequestData.preFilledData
    : {
        businessName: profile.businessName,
        businessLocation: profile.businessLocation,
        businessService: profile.businessService,
        businessType: profile.businessType as any,
        services: profile.services || undefined,
        representativeName: profile.representativeName || undefined
      };

  return (
    <div
      className="min-h-screen"
      style={{
        background: profile.primaryColor && profile.accentColor
          ? `linear-gradient(135deg, ${profile.primaryColor}08, ${profile.accentColor}08)`
          : undefined
      }}
    >
      {/* Header with branding */}
      {(profile.logoUrl || profile.welcomeMessage) && (
        <div className="p-4 text-center border-b bg-white/80 backdrop-blur-sm">
          {profile.logoUrl && (
            <img
              src={profile.logoUrl}
              alt={profile.businessName}
              className="h-12 mx-auto mb-2 object-contain"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          )}
          <h1
            className="text-xl font-bold"
            style={{ color: profile.primaryColor || undefined }}
          >
            {profile.businessName}
          </h1>
          {profile.welcomeMessage && (
            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              {profile.welcomeMessage}
            </p>
          )}
          {profile.services && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
              {profile.services.split(',').map((service, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                >
                  {service.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* About Your Project - structured memory prompts from the request */}
      {reviewRequestData?.projectContext &&
        (reviewRequestData.projectContext.city ||
          reviewRequestData.projectContext.materials ||
          reviewRequestData.projectContext.summary ||
          (reviewRequestData.projectContext.services?.length ?? 0) > 0 ||
          (reviewRequestData.projectContext.areas?.length ?? 0) > 0) && (
          <div className="max-w-2xl mx-auto px-4 pt-6">
            <div className="rounded-lg border bg-white/80 backdrop-blur-sm p-5 shadow-sm">
              <h2
                className="text-lg font-semibold mb-1"
                style={{ color: profile.primaryColor || undefined }}
              >
                About your project
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                These notes are provided to help you remember your project. Use anything that feels accurate.
              </p>
              <dl className="space-y-3 text-sm">
                {reviewRequestData.projectContext.city && (
                  <div className="flex flex-col sm:flex-row sm:gap-3">
                    <dt className="text-gray-500 sm:w-40 sm:flex-shrink-0">City</dt>
                    <dd className="text-gray-800">{reviewRequestData.projectContext.city}</dd>
                  </div>
                )}
                {(reviewRequestData.projectContext.services?.length ?? 0) > 0 && (
                  <div className="flex flex-col sm:flex-row sm:gap-3">
                    <dt className="text-gray-500 sm:w-40 sm:flex-shrink-0">Services</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {reviewRequestData.projectContext.services!.map((s, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
                        >
                          {s}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {(reviewRequestData.projectContext.areas?.length ?? 0) > 0 && (
                  <div className="flex flex-col sm:flex-row sm:gap-3">
                    <dt className="text-gray-500 sm:w-40 sm:flex-shrink-0">Areas completed</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {reviewRequestData.projectContext.areas!.map((a, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
                        >
                          {a}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {reviewRequestData.projectContext.materials && (
                  <div className="flex flex-col sm:flex-row sm:gap-3">
                    <dt className="text-gray-500 sm:w-40 sm:flex-shrink-0">Materials installed</dt>
                    <dd className="text-gray-800">{reviewRequestData.projectContext.materials}</dd>
                  </div>
                )}
                {reviewRequestData.projectContext.summary && (
                  <div className="flex flex-col sm:flex-row sm:gap-3">
                    <dt className="text-gray-500 sm:w-40 sm:flex-shrink-0">Summary</dt>
                    <dd className="text-gray-800 whitespace-pre-wrap">
                      {reviewRequestData.projectContext.summary}
                    </dd>
                  </div>
                )}
              </dl>
              <p className="text-xs text-gray-500 mt-4 border-t pt-3">
                Please only mention details that match your actual experience.
              </p>
            </div>
          </div>
        )}

      {/* Review Builder with pre-filled data */}
      <ReviewBuilder
        prefillData={prefillData as any}
        platformInfo={platformInfo}
        projectContext={reviewRequestData?.projectContext ?? undefined}
        branding={{
          primaryColor: profile.primaryColor,
          accentColor: profile.accentColor,
          logoUrl: profile.logoUrl
        }}
      />
    </div>
  );
}
