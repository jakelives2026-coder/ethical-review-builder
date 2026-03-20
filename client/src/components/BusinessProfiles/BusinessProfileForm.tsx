import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertBusinessProfileSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Search, MapPin, ArrowUp, ArrowDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FormInput, FormSelect, AutocompleteField } from "@/components/primitives";
import {
  getMobileTextStyles,
  getMobileButtonStyles,
  getMobileButtonContainerStyles
} from "@/lib/mobile-standards";

// Business type options with labels
const businessTypes = [
  { value: "restaurant", label: "Restaurant & Food" },
  { value: "retail", label: "Retail & Products" },
  { value: "professional-services", label: "Professional Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "home-services", label: "Home Services" },
  { value: "other", label: "Other" },
] as const;

// Dynamic labels and placeholders based on business type
const getServicesConfig = (businessType: string | null | undefined) => {
  switch (businessType) {
    case "restaurant":
      return {
        label: "Menu Specialties",
        placeholder: "e.g., Pizza, Pasta, Seafood, Catering, Delivery",
        description: "List your signature dishes or cuisine types. Reviewers will see these as guidance."
      };
    case "retail":
      return {
        label: "Product Categories",
        placeholder: "e.g., Electronics, Clothing, Home Goods, Accessories",
        description: "List your main product categories. Reviewers will see these as guidance."
      };
    case "professional-services":
      return {
        label: "Services Offered",
        placeholder: "e.g., Tax Preparation, Consulting, Bookkeeping, Auditing",
        description: "List your professional services. Reviewers will see these as guidance."
      };
    case "healthcare":
      return {
        label: "Specialties & Treatments",
        placeholder: "e.g., General Dentistry, Orthodontics, Cosmetic, Pediatric",
        description: "List your specialties or treatments. Reviewers will see these as guidance."
      };
    case "home-services":
      return {
        label: "Services Offered",
        placeholder: "e.g., Flooring, Tile Installation, Hardwood Refinishing, Carpet Removal",
        description: "List your services. Reviewers will see these as guidance."
      };
    default:
      return {
        label: "Products & Services",
        placeholder: "e.g., Product A, Service B, Specialty C",
        description: "List what you offer (comma-separated). Reviewers will see these as guidance."
      };
  }
};

// Add validation for the form
const formSchema = insertBusinessProfileSchema.extend({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessLocation: z.string().min(2, "Location must be at least 2 characters"),
  businessService: z.string().min(1, "Business service is required"),
  businessType: z.string().optional(),
  representativeName: z.string().optional(),
  isPrimary: z.boolean().optional(),
  reviewPlatforms: z.array(z.object({
    platformName: z.enum(["google", "yelp", "trustpilot", "bbb"]),
    platformUrl: z.string().url("Platform URL must be valid").or(z.literal("")),
    priorityOrder: z.number().int().min(0)
  })).optional(),
  rewardDescription: z.string().optional(),
  requireProof: z.boolean().optional(),
});

// Define the props for the component
type BusinessProfileFormProps = {
  isOpen: boolean;
  onClose: () => void;
  editData?: {
    id: number;
    businessName: string;
    businessLocation: string;
    businessService?: string;
    businessType?: string;
    services?: string;
    representativeName?: string;
    isPrimary?: boolean;
    reviewPlatforms?: Array<{
      platformName: "google" | "yelp" | "trustpilot" | "bbb";
      platformUrl: string;
      priorityOrder: number;
    }>;
    rewardDescription?: string;
    requireProof?: boolean;
  };
  userId: number;
};

export function BusinessProfileForm({ isOpen, onClose, editData, userId }: BusinessProfileFormProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Function to scroll focused input into view (for mobile)
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isMobile && dialogRef.current) {
      // Add visual indicator to the focused field
      const formItem = e.target.closest('.bg-card');
      if (formItem) {
        // Add subtle highlight to active form field
        formItem.classList.add('ring-2', 'ring-primary/20', 'bg-primary/5');
        
        // Remove the highlight when focus is lost
        const handleBlur = () => {
          formItem.classList.remove('ring-2', 'ring-primary/20', 'bg-primary/5');
          e.target.removeEventListener('blur', handleBlur);
        };
        
        e.target.addEventListener('blur', handleBlur);
      }
      
      // Add optimized delay to allow keyboard to appear 
      setTimeout(() => {
        // Calculate position - scroll the focused element to be in the middle of the visible area
        const element = e.target;
        const elementRect = element.getBoundingClientRect();
        const containerRect = dialogRef.current?.getBoundingClientRect();
        
        if (containerRect) {
          // Get window height and keyboard height (estimated based on device)
          const windowHeight = window.innerHeight;
          
          // More accurately estimate keyboard height based on viewport height
          // Smaller screens typically have relatively larger keyboards
          const smallScreen = windowHeight < 700;
          const estimatedKeyboardHeight = smallScreen ? 
            windowHeight * 0.45 : // Larger keyboard on small screens
            windowHeight * 0.35;  // Smaller keyboard on larger screens
          
          // Calculate the visible area height (excluding keyboard)
          const visibleAreaHeight = windowHeight - estimatedKeyboardHeight;
          
          // Position element slightly higher to allow space for seeing context and typing
          const offsetTop = elementRect.top - containerRect.top;
          
          // Target position: Position the element at 20% from the top of visible area
          const scrollTop = offsetTop - (visibleAreaHeight * 0.2);
          
          // Scroll the dialog content with smooth behavior
          dialogRef.current?.scrollTo({
            top: Math.max(0, scrollTop),
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  };
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      userId: userId,
      businessName: editData?.businessName || "",
      businessLocation: editData?.businessLocation || "",
      businessService: editData?.businessService || "",
      businessType: editData?.businessType || "other",
      services: editData?.services || "",
      representativeName: editData?.representativeName || "",
      isPrimary: editData?.isPrimary || false,
      reviewPlatforms: editData?.reviewPlatforms || [],
      rewardDescription: editData?.rewardDescription || "",
      requireProof: editData?.requireProof || false,
    },
  });

  // Function to provide haptic feedback (for devices that support it)
  const provideHapticFeedback = () => {
    if (isMobile && 'navigator' in window && 'vibrate' in navigator) {
      try {
        // Short vibration pattern for form submission
        navigator.vibrate([15, 10, 15]);
      } catch (e) {
        // Silently fail if vibration isn't supported
        console.log("Haptic feedback not supported");
      }
    }
  };

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Blur any active element to prevent keyboard from staying open
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    // Provide haptic feedback if supported
    provideHapticFeedback();
    
    // Show loading state
    setIsSubmitting(true);
    
    // Scroll to top of form for better loading state visibility
    if (dialogRef.current) {
      dialogRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    try {
      if (editData) {
        // Update existing profile
        const response = await apiRequest(
          "PATCH",
          `/api/business-profiles/${editData.id}`,
          values
        );
        if (response.ok) {
          toast({
            title: "Profile updated",
            description: "Your business profile has been updated successfully.",
          });
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });
          onClose();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update profile");
        }
      } else {
        // Create new profile
        const response = await apiRequest(
          "POST",
          "/api/business-profiles",
          values
        );
        if (response.ok) {
          toast({
            title: "Profile created",
            description: "Your new business profile has been created successfully.",
          });
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });
          onClose();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create profile");
        }
      }
    } catch (error) {
      // Provide error haptic feedback
      if (isMobile && 'navigator' in window && 'vibrate' in navigator) {
        try {
          // Error pattern - longer vibration
          navigator.vibrate([50, 20, 50]);
        } catch (e) {
          // Silently fail
        }
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={isMobile ? "w-[95vw] max-w-md p-4 pb-8 sm:p-6 max-h-[90vh] overflow-y-auto -webkit-overflow-scrolling-touch" : "max-w-md max-h-[90vh] overflow-y-auto"}
        aria-describedby="business-profile-form-description"
        ref={dialogRef}
        style={{ 
          scrollPaddingBottom: isMobile ? '60vh' : '0',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--primary) transparent'
        }}
      >
        <DialogHeader>
          <DialogTitle className={getMobileTextStyles("heading")}>
            {editData ? "Edit Business Profile" : "Create New Business Profile"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {editData 
              ? "Update your business information below" 
              : "Enter your business information to create a new profile"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2 form-container">
            {/* Business Name Field */}
            <div className="bg-card rounded-lg p-3 border border-border/50 shadow-sm transition-all duration-200">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <FormLabel className={`${getMobileTextStyles("label")} text-primary font-medium`}>
                        Business Name
                      </FormLabel>
                      <Badge variant="outline" className="gap-1">
                        <Search className="h-3 w-3" />
                        <span className="text-xs">Google Search</span>
                      </Badge>
                    </div>
                    <FormControl>
                      <AutocompleteField
                        type="business"
                        onSelect={(business) => {
                          field.onChange(business.businessName);
                          if (business.formattedAddress) {
                            form.setValue("businessLocation", business.formattedAddress);
                          }
                        }}
                        placeholder="Search for your business..."
                        defaultValue={field.value}
                        required={true}
                        autoFocus={!editData}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Search for your business or enter manually if not found
                    </p>
                    <FormMessage className="text-xs mt-1 font-medium" />
                  </FormItem>
                )}
              />
            </div>

            {/* Business Type Field */}
            <div className="bg-card rounded-lg p-3 border border-border/50 shadow-sm transition-all duration-200">
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <FormLabel className={`${getMobileTextStyles("label")} text-primary font-medium`}>
                        Business Type
                      </FormLabel>
                    </div>
                    <FormControl>
                      <FormSelect
                        value={field.value || "other"}
                        onValueChange={field.onChange}
                        placeholder="Select business type"
                        options={businessTypes}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      This helps tailor the review questions for your industry
                    </p>
                    <FormMessage className="text-xs mt-1 font-medium" />
                  </FormItem>
                )}
              />
            </div>

            {/* Business Service Field */}
            <div className="bg-card rounded-lg p-3 border border-border/50 shadow-sm transition-all duration-200">
              <FormField
                control={form.control}
                name="businessService"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className={`${getMobileTextStyles("label")} text-primary font-medium`}>
                      Primary Service <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Window replacement and installation"
                        {...field}
                        value={field.value || ""}
                        onFocus={handleInputFocus}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      One-line description shown on your profile card (e.g. walk-in shower installation)
                    </p>
                    <FormMessage className="text-xs mt-1 font-medium" />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Field */}
            <div className="bg-card rounded-lg p-3 border border-border/50 shadow-sm transition-all duration-200">
              <FormField
                control={form.control}
                name="businessLocation"
                render={({ field }) => (
                  <FormItem className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <FormLabel className={`${getMobileTextStyles("label")} text-primary font-medium`}>
                        Location
                      </FormLabel>
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">Address</span>
                      </Badge>
                    </div>
                    <FormControl>
                      <AutocompleteField
                        type="address"
                        defaultValue={field.value}
                        onSelect={(address) => {
                          field.onChange(address);
                          form.trigger("businessLocation");
                        }}
                        placeholder="Search for address..."
                        required={true}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Search for address or enter manually if not found
                    </p>
                    <FormMessage className="text-xs mt-1 font-medium" />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Services/Products Field - Dynamic based on business type */}
            <div className="bg-card rounded-lg p-3 border border-border/50 shadow-sm transition-all duration-200">
              <FormField
                control={form.control}
                name="services"
                render={({ field }) => {
                  const businessType = form.watch("businessType");
                  const config = getServicesConfig(businessType);
                  return (
                    <FormItem className="relative">
                      <div className="flex items-center gap-2 mb-1">
                        <FormLabel className={`${getMobileTextStyles("label")} text-primary font-medium`}>
                          Additional Services <span className="text-muted-foreground">(Optional)</span>
                        </FormLabel>
                      </div>
                      <FormControl>
                        <FormInput
                          placeholder="e.g. Bathroom remodels, tile work, fixture replacement"
                          {...field}
                          value={field.value || ""}
                          onFocus={handleInputFocus}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Optional. Shown to reviewers as guidance on what to mention.
                      </p>
                      <FormMessage className="text-xs mt-1 font-medium" />
                    </FormItem>
                  );
                }}
              />
            </div>
            
            {/* Representative Name Field */}
            <div className="bg-card rounded-lg p-3 border border-border/50 shadow-sm transition-all duration-200">
              <FormField
                control={form.control}
                name="representativeName"
                render={({ field }) => (
                  <FormItem className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <FormLabel className={`${getMobileTextStyles("label")} text-primary font-medium`}>
                        Representative Name <span className="text-muted-foreground">(Optional)</span>
                      </FormLabel>
                    </div>
                    <FormControl>
                      <FormInput
                        placeholder=""
                        {...field}
                        value={field.value || ""}
                        onFocus={handleInputFocus}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional. Shown to reviewers as their point of contact at the business.
                    </p>
                    <FormMessage className="text-xs mt-1 font-medium" />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Primary Business Checkbox */}
            <div className="bg-card rounded-lg p-3 border border-border/50 shadow-sm transition-all duration-200">
              <FormField
                control={form.control}
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5 h-5 w-5 rounded border-2 border-muted-foreground/40 data-[state=checked]:border-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className={`${getMobileTextStyles("label")} text-primary font-medium cursor-pointer`}>
                        Set as Primary Business
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Primary business profiles are used as defaults in review templates
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Review Platforms Section */}
            <div className="bg-card rounded-lg p-4 border border-border/50 shadow-sm transition-all duration-200 mt-6">
              <h3 className={`${getMobileTextStyles("label")} text-primary font-semibold mb-4`}>
                Review Platforms <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Select review platforms and set their order. Platform 1 will be sent first in your review drip campaign.
              </p>

              {/* Platform Rows */}
              {["google", "yelp", "trustpilot", "bbb"].map((platformName: string, index: number) => {
                const platforms = form.watch("reviewPlatforms") || [];
                const platformData = platforms.find((p) => p.platformName === platformName);
                const platformIndex = platforms.findIndex((p) => p.platformName === platformName);
                const isEnabled = platformIndex !== -1;

                return (
                  <div key={platformName} className="mb-4 pb-4 border-b border-border/30 last:border-b-0 last:mb-0 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium capitalize">
                        {platformName === "bbb" ? "BBB" : platformName.charAt(0).toUpperCase() + platformName.slice(1)}
                      </label>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => {
                            const newPlatforms = [...platforms];
                            if (checked) {
                              // Add platform with priority order (next position)
                              newPlatforms.push({
                                platformName: platformName as "google" | "yelp" | "trustpilot" | "bbb",
                                platformUrl: "",
                                priorityOrder: newPlatforms.length + 1,
                              });
                            } else if (platformIndex !== -1) {
                              // Remove platform and reorder
                              newPlatforms.splice(platformIndex, 1);
                              newPlatforms.forEach((p, i) => {
                                p.priorityOrder = i + 1;
                              });
                            }
                            form.setValue("reviewPlatforms", newPlatforms);
                          }}
                        />
                        {isEnabled && (
                          <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (platformIndex > 0) {
                                const newPlatforms = [...platforms];
                                const temp = newPlatforms[platformIndex];
                                newPlatforms[platformIndex] = newPlatforms[platformIndex - 1];
                                newPlatforms[platformIndex - 1] = temp;
                                newPlatforms.forEach((p, i) => {
                                  p.priorityOrder = i + 1;
                                });
                                form.setValue("reviewPlatforms", newPlatforms);
                              }
                            }}
                            disabled={platformIndex === 0}
                            className="p-1 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed rounded"
                            title="Move up"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (platformIndex < platforms.length - 1) {
                                const newPlatforms = [...platforms];
                                const temp = newPlatforms[platformIndex];
                                newPlatforms[platformIndex] = newPlatforms[platformIndex + 1];
                                newPlatforms[platformIndex + 1] = temp;
                                newPlatforms.forEach((p, i) => {
                                  p.priorityOrder = i + 1;
                                });
                                form.setValue("reviewPlatforms", newPlatforms);
                              }
                            }}
                            disabled={platformIndex === platforms.length - 1}
                            className="p-1 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed rounded"
                            title="Move down"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          {isEnabled && (
                            <span className="text-xs text-muted-foreground font-medium">
                              #{platformData?.priorityOrder}
                            </span>
                          )}
                        </div>
                        )}
                      </div>
                    </div>

                    {isEnabled && (
                      <div className="ml-6">
                        <Input
                          placeholder="https://g.page/r/your-business/review"
                          value={platformData?.platformUrl || ""}
                          onChange={(e) => {
                            const newPlatforms = [...platforms];
                            if (platformIndex !== -1) {
                              newPlatforms[platformIndex].platformUrl = e.target.value;
                              form.setValue("reviewPlatforms", newPlatforms);
                            }
                          }}
                          onFocus={handleInputFocus}
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Direct link to your review page
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Reviewer Reward Section */}
            <div className="bg-card rounded-lg p-4 border border-border/50 shadow-sm transition-all duration-200">
              <h3 className={`${getMobileTextStyles("label")} text-primary font-semibold mb-4`}>
                Reviewer Reward <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </h3>

              {/* Reward Description */}
              <div className="mb-4">
                <FormField
                  control={form.control}
                  name="rewardDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`${getMobileTextStyles("label")} text-sm font-medium`}>
                        Reward Description
                      </FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="e.g. Show this email to your server for a free dessert"
                          value={field.value || ""}
                          onChange={field.onChange}
                          onFocus={handleInputFocus}
                          className="w-full min-h-20 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Optional. This message will be shown to reviewers after they submit their review.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Require Proof Checkbox */}
              <FormField
                control={form.control}
                name="requireProof"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5 h-4 w-4 rounded border border-muted-foreground/40 data-[state=checked]:border-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className={`${getMobileTextStyles("label")} text-sm font-medium cursor-pointer`}>
                        Require Proof
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Ask reviewers to upload proof (screenshot, photo) before showing the reward
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Buttons */}
            <div className={`${getMobileButtonContainerStyles()} mt-6 gap-3`}>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {editData ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editData ? "Update Profile" : "Create Profile"
                )}
              </Button>
            </div>
            
            <input type="hidden" {...form.register("userId")} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}