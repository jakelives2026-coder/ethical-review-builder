import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { BusinessProfile, Review } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn, getRelationshipTypeLabel } from "@/lib/utils";
import { Link } from "wouter";
import { 
  Building2, 
  FilePlus, 
  Star, 
  History, 
  Settings, 
  PlusCircle,
  Loader2,
  Copy,
  Eye,
  Edit,
  ChevronRight,
  ExternalLink,
  User,
  Badge,
  Sparkles,
  Home,
  Link2,
  Palette
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getMobileTextStyles, 
  getMobileButtonStyles, 
  mobileLayoutSizes,
  getMobileButtonContainerStyles
} from "@/lib/mobile-standards";
import { BusinessProfileForm } from "@/components/BusinessProfiles/BusinessProfileForm";
import { ProfileSettingsDialog } from "@/components/BusinessProfiles/ProfileSettingsDialog";
import { EditProfileDialog } from "@/components/EditProfileDialog";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("business-profiles");
  const isMobile = useIsMobile();
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BusinessProfile | null>(null);
  const [settingsProfile, setSettingsProfile] = useState<BusinessProfile | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  // Handle tab selection from URL parameters
  useEffect(() => {
    // Get the tab parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    
    // Set the active tab if the param exists and is valid
    if (tabParam && ["settings", "business-profiles", "reviews", "history"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const { data: businessProfiles, isLoading: isLoadingProfiles } = useQuery<BusinessProfile[]>({
    queryKey: ["/api/business-profiles"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Handle create profile button click
  const handleCreateProfile = () => {
    setEditingProfile(null);
    setIsProfileFormOpen(true);
  };
  
  // Handle edit profile button click
  const handleEditProfile = (profile: BusinessProfile) => {
    setEditingProfile(profile);
    setIsProfileFormOpen(true);
  };
  
  // Handle form close
  const handleCloseForm = () => {
    setIsProfileFormOpen(false);
    setEditingProfile(null);
  };

  // Show loading state
  if (isLoadingProfiles || isLoadingReviews) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className={`container mx-auto ${isMobile ? 'px-4 py-4 pb-20' : 'p-6'}`}>
      {/* Business Profile Form */}
      {isProfileFormOpen && (
        <BusinessProfileForm
          isOpen={isProfileFormOpen}
          onClose={handleCloseForm}
          editData={editingProfile as any}
          userId={user?.id || 0}
        />
      )}
      
      {/* Profile Settings Dialog */}
      {settingsProfile && (
        <ProfileSettingsDialog
          isOpen={!!settingsProfile}
          onClose={() => setSettingsProfile(null)}
          profile={settingsProfile}
        />
      )}
      
      {!isMobile && (
        <header className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome, {user?.fullName || user?.username}
          </h1>
          <p className="text-muted-foreground">
            Manage your business profiles and reviews
          </p>
        </header>
      )}
      
      {isMobile && (
        <header className="mb-4">
          <h1 className="text-xl font-semibold">
            {activeTab === "business-profiles" && "Business Profiles"}
            {activeTab === "reviews" && "My Reviews"}
            {activeTab === "history" && "Review History"}
            {activeTab === "settings" && "Account"}
          </h1>
        </header>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {!isMobile && (
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-none gap-2">
            <TabsTrigger value="business-profiles" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Business Profiles</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>My Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
        )}

        <div className={isMobile ? 'mt-0' : 'mt-6'}>
          <TabsContent value="business-profiles">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
              <h2 className="text-xl font-semibold">Your Business Profiles</h2>
              <Button
                variant="default"
                size="sm"
                className="w-full md:w-auto"
                onClick={handleCreateProfile}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                New Profile
              </Button>
            </div>

            {businessProfiles?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No business profiles yet</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-2">
                    Create your first business profile to start generating personalized reviews
                  </p>
                  <Button className="mt-4" onClick={handleCreateProfile}>Create Business Profile</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businessProfiles?.map((profile) => (
                  <Card key={profile.id} className={isMobile ? 'border-2 transition-colors hover:border-primary/30 active:bg-muted' : ''}>
                    <CardHeader className={isMobile ? 'px-4 py-4' : ''}>
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className={getMobileTextStyles('body', 'font-medium')}>{profile.businessName}</span>
                        {profile.isPrimary && (
                          <span className="bg-primary/10 text-primary text-xs py-0.5 px-2 rounded-full ml-auto">
                            Primary
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className={getMobileTextStyles('label')}>
                        {profile.businessLocation}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className={isMobile ? 'px-4 py-2' : ''}>
                      <div className={`${isMobile ? 'space-y-2' : 'space-y-1'}`}>
                        <p className={getMobileTextStyles('body')}>
                          <span className="font-medium">Service:</span> {profile.businessService}
                        </p>
                        {profile.representativeName && (
                          <p className={getMobileTextStyles('body', 'mt-1')}>
                            <span className="font-medium">Representative:</span> {profile.representativeName}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[72px]"
                        onClick={() => handleEditProfile(profile)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[72px]"
                        onClick={() => setSettingsProfile(profile)}
                      >
                        <Palette className="h-4 w-4 mr-2" />
                        Branding
                      </Button>
                      {/* Share button appears only if profile has a shareSlug (generated share link) */}
                      {profile.shareSlug && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 min-w-[72px]"
                          onClick={() => window.open(`/review/${profile.shareSlug}`, '_blank')}
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 min-w-[72px]"
                        onClick={() => window.location.href = `/?profileId=${profile.id}`}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <div className={`flex ${isMobile ? 'justify-end' : 'flex-col sm:flex-row sm:justify-between sm:items-center'} mb-4 gap-3`}>
              {!isMobile && (
                <h2 className="text-xl font-semibold">
                  Your Reviews
                </h2>
              )}
              <Link href="/" className={isMobile ? 'w-auto' : ''}>
                <Button className={`flex items-center gap-2`} 
                  size={isMobile ? "sm" : "default"}>
                  <PlusCircle className="h-4 w-4" />
                  {isMobile ? "Add" : "Create New Review"}
                </Button>
              </Link>
            </div>

            {reviews?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No reviews yet</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-2">
                    Start creating professional reviews for your business
                  </p>
                  <Link href="/">
                    <Button className="mt-4">Create Review</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reviews?.map((review) => (
                  <Card key={review.id} className={isMobile ? 'border-2 transition-colors hover:border-primary/30 active:bg-muted' : ''}>
                    <CardHeader className={isMobile ? 'px-4 py-4' : ''}>
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        <Star className="h-5 w-5 text-primary" />
                        <span className={getMobileTextStyles('body', 'font-medium')}>{review.businessName}</span>
                        {review.isSuperReview && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs py-0.5 px-2 rounded-full ml-auto">
                            Super Review
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className={getMobileTextStyles('label')}>
                        {review.businessLocation} • Reviewer: {getRelationshipTypeLabel(review.relationshipType)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className={isMobile ? 'px-4 py-2' : ''}>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className={getMobileTextStyles('body', 'line-clamp-3 italic')}>
                          "{review.generatedReview}"
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className={`flex ${isMobile ? 'justify-between flex-wrap gap-2 px-4 py-4' : 'justify-between'}`}>
                      <Button 
                        variant="outline" 
                        size={isMobile ? "default" : "sm"}
                        className={isMobile ? 'flex-1 min-w-[100px]' : ''}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button 
                        variant="default" 
                        size={isMobile ? "default" : "sm"}
                        className={isMobile ? 'flex-1 min-w-[150px]' : ''}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className={`flex ${isMobile ? 'justify-end' : 'flex-col sm:flex-row sm:justify-between sm:items-center'} mb-4 gap-3`}>
              {!isMobile && (
                <h2 className="text-xl font-semibold">
                  Review History
                </h2>
              )}
            </div>

            <Card>
              <CardContent className={`p-6 ${isMobile ? 'py-5 px-4' : ''}`}>
                <p className={getMobileTextStyles('body', 'text-muted-foreground text-center')}>
                  Your review history will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className={`flex ${isMobile ? 'justify-end' : 'flex-col sm:flex-row sm:justify-between sm:items-center'} mb-4 gap-3`}>
              {!isMobile && (
                <h2 className="text-xl font-semibold">
                  Account Settings
                </h2>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card className={isMobile ? 'border-2 transition-colors hover:border-primary/30 active:bg-muted' : ''}>
                <CardHeader className={isMobile ? 'px-4 py-4' : ''}>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <span className={getMobileTextStyles('body', 'font-medium')}>Profile Information</span>
                  </CardTitle>
                  <CardDescription className={getMobileTextStyles('label')}>
                    Update your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className={isMobile ? 'px-4 py-2' : ''}>
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.username || "User"} />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {user?.username?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className={getMobileTextStyles('body', 'font-semibold')}>{user?.fullName || user?.username}</h3>
                      <p className={getMobileTextStyles('label', 'text-muted-foreground')}>{user?.email}</p>
                    </div>
                  </div>
                  <div className={`${isMobile ? 'space-y-3' : 'space-y-2'}`}>
                    <div className="flex flex-col">
                      <span className={getMobileTextStyles('label', 'text-muted-foreground')}>Username</span>
                      <span className={getMobileTextStyles('body')}>{user?.username}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className={getMobileTextStyles('label', 'text-muted-foreground')}>Full Name</span>
                      <span className={getMobileTextStyles('body')}>{user?.fullName || "Not set"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className={getMobileTextStyles('label', 'text-muted-foreground')}>Company</span>
                      <span className={getMobileTextStyles('body')}>{user?.company || "Not set"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className={isMobile ? 'px-4 py-4' : ''}>
                  <Button 
                    variant="outline" 
                    className={isMobile ? 'w-full' : ''}
                    size={isMobile ? "default" : "default"}
                    onClick={() => setIsEditProfileOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>

              <EditProfileDialog
                open={isEditProfileOpen}
                onOpenChange={setIsEditProfileOpen}
                currentFullName={user?.fullName}
                currentCompany={user?.company}
              />

              {/* Review Usage Card for Free Users */}
              {user?.planType === "free" && (
                <Card className={isMobile ? 'border-2 transition-colors hover:border-primary/30 active:bg-muted' : ''}>
                  <CardHeader className={isMobile ? 'px-4 py-4' : ''}>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      <span className={getMobileTextStyles('body', 'font-medium')}>Monthly Review Limit</span>
                    </CardTitle>
                    <CardDescription className={getMobileTextStyles('label')}>
                      You have {user.reviewsGeneratedThisMonth ?? 0} of 3 reviews used this month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={isMobile ? 'px-4 py-2' : ''}>
                    <div className={`${isMobile ? 'space-y-3' : 'space-y-3'}`}>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          getMobileTextStyles('body'),
                          'font-medium',
                          (user.reviewsGeneratedThisMonth ?? 0) >= 3 && 'text-destructive'
                        )}>
                          {user.reviewsGeneratedThisMonth ?? 0} / 3
                        </span>
                        <Progress
                          value={Math.min(100, ((user.reviewsGeneratedThisMonth ?? 0) / 3) * 100)}
                          className="flex-1"
                        />
                      </div>
                      {(user.reviewsGeneratedThisMonth ?? 0) >= 3 && (
                        <p className={cn(getMobileTextStyles('label', 'text-destructive text-xs'))}>
                          Limit reached.{" "}
                          <Link href="/pricing" className="underline underline-offset-2 hover:text-destructive">
                            Upgrade to Pro
                          </Link>{" "}
                          for unlimited reviews.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className={isMobile ? 'border-2 transition-colors hover:border-primary/30 active:bg-muted' : ''}>
                <CardHeader className={isMobile ? 'px-4 py-4' : ''}>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="h-5 w-5 text-primary" />
                    <span className={getMobileTextStyles('body', 'font-medium')}>Subscription Plan</span>
                  </CardTitle>
                  <CardDescription className={getMobileTextStyles('label')}>
                    Manage your subscription
                  </CardDescription>
                </CardHeader>
                <CardContent className={isMobile ? 'px-4 py-2' : ''}>
                  <div className={`${isMobile ? 'space-y-3' : 'space-y-2'}`}>
                    <div className="flex flex-col">
                      <span className={getMobileTextStyles('label', 'text-muted-foreground')}>Current Plan</span>
                      <div className="flex items-center gap-2">
                        <span className={getMobileTextStyles('body', 'font-medium')}>
                          {user?.planType ? (user.planType.charAt(0).toUpperCase() + user.planType.slice(1)) : "Free"}
                        </span>
                        {user?.planType === "pro" && (
                          <span className="bg-primary/10 text-primary text-xs py-0.5 px-2 rounded-full">
                            Pro
                          </span>
                        )}
                      </div>
                    </div>
                    {user?.planType === "free" && (
                      <p className={getMobileTextStyles('label', 'text-muted-foreground text-xs')}>
                        Upgrade to Pro for additional features including templates, priority support, and more.
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className={isMobile ? 'px-4 py-4' : ''}>
                  {user?.planType === "free" ? (
                    <Button 
                      className={isMobile ? 'w-full' : ''}
                      size={isMobile ? "default" : "default"}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className={isMobile ? 'w-full' : ''}
                      size={isMobile ? "default" : "default"}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => setActiveTab("business-profiles")}
              className={`flex flex-col items-center justify-center p-2 w-1/5 ${activeTab === "business-profiles" ? "text-primary" : "text-muted-foreground"}`}
            >
              <Building2 className="h-4 w-4" />
              <span className="text-xs mt-1">Profiles</span>
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex flex-col items-center justify-center p-2 w-1/5 ${activeTab === "reviews" ? "text-primary" : "text-muted-foreground"}`}
            >
              <Star className="h-4 w-4" />
              <span className="text-xs mt-1">Reviews</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex flex-col items-center justify-center p-2 w-1/5 ${activeTab === "history" ? "text-primary" : "text-muted-foreground"}`}
            >
              <History className="h-4 w-4" />
              <span className="text-xs mt-1">History</span>
            </button>
            <Link href="/" className="w-1/5">
              <div className="flex flex-col items-center justify-center">
                <div className="bg-primary text-primary-foreground rounded-full p-3 -mt-5 shadow-md">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <span className="text-xs mt-1">New</span>
              </div>
            </Link>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center justify-center p-2 w-1/5 ${activeTab === "settings" ? "text-primary" : "text-muted-foreground"}`}
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs mt-1">Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}