import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { ReviewBuilder } from "@/components/ReviewBuilder";
import { Loader2 } from "lucide-react";

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

export default function PublicReview() {
  const params = useParams();
  const shareSlug = params.shareSlug;
  
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
  
  if (isLoading) {
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
      
      {/* Review Builder with pre-filled data */}
      <ReviewBuilder 
        prefillData={{
          businessName: profile.businessName,
          businessLocation: profile.businessLocation,
          businessService: profile.businessService,
          businessType: profile.businessType as any,
          services: profile.services || undefined,
          representativeName: profile.representativeName || undefined
        }}
        branding={{
          primaryColor: profile.primaryColor,
          accentColor: profile.accentColor,
          logoUrl: profile.logoUrl
        }}
      />
    </div>
  );
}
