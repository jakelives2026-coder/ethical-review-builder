import { useState } from "react";
import { BusinessProfile } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Palette, 
  Link2, 
  Code, 
  Copy, 
  Check, 
  Loader2,
  Lock,
  ExternalLink,
  Image
} from "lucide-react";
import { getMobileTextStyles, getMobileButtonStyles } from "@/lib/mobile-standards";

interface ProfileSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
}

export function ProfileSettingsDialog({ isOpen, onClose, profile }: ProfileSettingsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState("branding");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Branding state
  const [primaryColor, setPrimaryColor] = useState(profile.primaryColor || "#6366f1");
  const [accentColor, setAccentColor] = useState(profile.accentColor || "#8b5cf6");
  const [welcomeMessage, setWelcomeMessage] = useState(profile.welcomeMessage || "");
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl || "");

  // Track the share slug locally so the UI updates immediately after generation
  // without needing to close/reopen the dialog (profile prop can be stale)
  const [localShareSlug, setLocalShareSlug] = useState<string | null>(profile.shareSlug || null);

  const isPaidPlan = user?.planType === 'pro' || user?.planType === 'enterprise';
  const isEnterprise = user?.planType === 'enterprise';

  const shareUrl = localShareSlug
    ? `${window.location.origin}/review/${localShareSlug}`
    : null;
  
  const embedCode = profile.embedToken && profile.isEmbedEnabled
    ? `<script src="${window.location.origin}/embed.js" data-token="${profile.embedToken}"></script>`
    : null;
  
  const handleSaveBranding = async () => {
    if (!isPaidPlan) {
      toast({
        title: "Upgrade Required",
        description: "Custom branding requires a Pro or Enterprise plan.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await apiRequest("PATCH", `/api/business-profiles/${profile.id}`, {
        primaryColor,
        accentColor,
        welcomeMessage: welcomeMessage || null,
        logoUrl: logoUrl || null
      });
      
      await queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });
      
      toast({
        title: "Branding Saved",
        description: "Your branding settings have been updated."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save branding settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateShareLink = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", `/api/business-profiles/${profile.id}/share-slug`);
      const data: { shareSlug: string; shareUrl: string } = await res.json();
      setLocalShareSlug(data.shareSlug);
      await queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });

      toast({
        title: "Share Link Generated",
        description: "Your shareable review link is ready."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate share link.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateEmbedToken = async () => {
    if (!isEnterprise) {
      toast({
        title: "Upgrade Required",
        description: "Embed widget requires an Enterprise plan.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await apiRequest("POST", `/api/business-profiles/${profile.id}/embed-token`);
      await queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });
      
      toast({
        title: "Embed Code Generated",
        description: "Your embed widget code is ready."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate embed code.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied",
      description: "Copied to clipboard"
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-none h-[90vh]' : 'max-w-2xl'} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className={getMobileTextStyles('heading')}>
            {profile.businessName} Settings
          </DialogTitle>
          <DialogDescription className={getMobileTextStyles('body')}>
            Customize branding and sharing options for your business profile
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="branding" className="flex items-center gap-1">
              <Palette className="h-4 w-4" />
              <span className={isMobile ? 'text-xs' : ''}>Branding</span>
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-1">
              <Link2 className="h-4 w-4" />
              <span className={isMobile ? 'text-xs' : ''}>Share</span>
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              <span className={isMobile ? 'text-xs' : ''}>Embed</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="branding" className="mt-4 space-y-4">
            {!isPaidPlan && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <Lock className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">Upgrade to Pro</p>
                    <p className="text-sm text-amber-700">Custom branding requires a Pro or Enterprise plan.</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Logo URL
                </Label>
                <Input
                  id="logoUrl"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  disabled={!isPaidPlan}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL to your logo image (PNG, JPG, or SVG recommended)
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                      disabled={!isPaidPlan}
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1"
                      disabled={!isPaidPlan}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="accentColor"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                      disabled={!isPaidPlan}
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#8b5cf6"
                      className="flex-1"
                      disabled={!isPaidPlan}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  placeholder="Welcome! We'd love to hear about your experience with us."
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                  disabled={!isPaidPlan}
                />
                <p className="text-xs text-muted-foreground">
                  This message will be shown to customers when they visit your review page
                </p>
              </div>
              
              {/* Preview */}
              {isPaidPlan && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="p-4 rounded-lg border"
                      style={{ 
                        background: `linear-gradient(135deg, ${primaryColor}10, ${accentColor}10)`,
                        borderColor: primaryColor
                      }}
                    >
                      {logoUrl && (
                        <img 
                          src={logoUrl} 
                          alt="Logo" 
                          className="h-12 mb-3 object-contain"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      )}
                      <h3 
                        className="font-bold text-lg"
                        style={{ color: primaryColor }}
                      >
                        {profile.businessName}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {welcomeMessage || "Share your experience with us!"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Button 
                onClick={handleSaveBranding} 
                disabled={!isPaidPlan || isLoading}
                className="w-full"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Branding
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="share" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Shareable Review Link
                </CardTitle>
                <CardDescription>
                  Share this link with customers to collect reviews
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shareUrl ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input 
                        value={shareUrl} 
                        readOnly 
                        className="flex-1 bg-muted"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleCopy(shareUrl)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => window.open(shareUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Customers who visit this link will see your branded review page
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      Generate a shareable link to collect reviews from customers
                    </p>
                    <Button onClick={handleGenerateShareLink} disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Generate Share Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="embed" className="mt-4 space-y-4">
            {!isEnterprise && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <Lock className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">Enterprise Feature</p>
                    <p className="text-sm text-amber-700">Embed widget requires an Enterprise plan.</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Embed Widget
                </CardTitle>
                <CardDescription>
                  Add the review form directly to your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {embedCode ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                        {embedCode}
                      </pre>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(embedCode)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add this code to your website to display the review form
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      Generate embed code to add the review form to your website
                    </p>
                    <Button 
                      onClick={handleGenerateEmbedToken} 
                      disabled={!isEnterprise || isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Generate Embed Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
