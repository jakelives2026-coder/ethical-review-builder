export enum Step {
  Welcome = 1,
  Relationship = 2,
  BusinessInfo = 3,
  Question1 = 4,
  Question2 = 5,
  Question3 = 6,
  Question4 = 7,
  Generating = 8,
  Preview = 9,
  Complete = 10,
  AppointmentStatus = 11,
  JobStatus = 12,
  BusinessType = 13,
  ServiceLocation = 14,
}

export type RelationshipType = "customer" | "acquaintance" | "appointment" | "appointment-before" | "appointment-after-no-purchase" | "appointment-after-purchase" | "appointment-after-purchase-not-started";

export type BusinessType = "restaurant" | "home-services" | "retail" | "professional-services" | "healthcare" | "other";

export type ServiceLocationType = "visited" | "came-to-me";

export const serviceLocationLabels: Record<ServiceLocationType, string> = {
  "visited": "I visited their location",
  "came-to-me": "They came to me"
};

export const serviceLocationDescriptions: Record<ServiceLocationType, string> = {
  "visited": "I went to their office, store, or facility",
  "came-to-me": "They provided service at my home, office, or another location"
};

export const businessTypeLabels: Record<BusinessType, string> = {
  "restaurant": "Restaurant & Food",
  "home-services": "Home Services",
  "retail": "Retail & Shopping",
  "professional-services": "Professional Services",
  "healthcare": "Healthcare & Wellness",
  "other": "Other Business"
};

export const businessTypeDescriptions: Record<BusinessType, string> = {
  "restaurant": "Restaurants, cafes, bars, food trucks, bakeries",
  "home-services": "Contractors, plumbers, electricians, landscapers, cleaners",
  "retail": "Stores, shops, boutiques, online retailers",
  "professional-services": "Lawyers, accountants, consultants, agencies",
  "healthcare": "Doctors, dentists, therapists, wellness centers, salons",
  "other": "Any other type of business"
};

export interface BusinessInfo {
  businessName: string;
  businessLocation: string;
  businessService: string;
  representativeName?: string; // Name of the person at the business
  businessType?: BusinessType; // Category of business
}

export interface RelationshipQuestion {
  question: string;
  subtitle: string;
  placeholder: string;
  options?: string[];
}

export interface ReviewData {
  businessType: BusinessType | null;
  relationship: RelationshipType | null;
  serviceLocation: ServiceLocationType | null;
  businessInfo: BusinessInfo;
  answers: {
    customer: string[];
    acquaintance: string[];
    appointment: string[];
    "appointment-before": string[];
    "appointment-after-no-purchase": string[];
    "appointment-after-purchase": string[];
    "appointment-after-purchase-not-started": string[];
  };
  userName: string;
  generatedReview: string;
}

export interface GenerateReviewRequest {
  relationshipType: RelationshipType;
  businessType?: BusinessType;
  serviceLocation?: ServiceLocationType;
  businessName: string;
  businessLocation: string;
  businessService: string;
  representativeName?: string;
  answers: string[];
  isSuperReview?: boolean;
}

export interface GenerateReviewResponse {
  review: string;
}
