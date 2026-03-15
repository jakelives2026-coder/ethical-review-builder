import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage, ensureSessionTable } from "./storage";
import OpenAI from "openai";
import { setupAuth } from "./auth";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { businessProfiles, reviewTemplates, users } from "@shared/schema";
import { stripe } from "./stripe";
import { PLAN_PRICE_MAP, PRICE_PLAN_MAP } from "./stripe-config";

// AI generation limiter — 20 requests per 15 minutes per IP
const generateReviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

// Passport-based auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Authentication required" });
}

function requirePremiumPlan(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Authentication required" });
  if (req.user!.planType === 'free') return res.status(403).json({ error: "This feature requires a premium plan" });
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure session table exists with IF NOT EXISTS — prevents cold-start crashes
  // when connect-pg-simple tries to re-create an already existing index.
  await ensureSessionTable();

  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
    timeout: 50000, // 50 second timeout
  });

  // Debug endpoint to check if env var is loaded
  app.get("/api/debug-env", (_req, res) => {
    res.json({
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY?.length || 0,
      keyPrefix: process.env.OPENAI_API_KEY?.slice(0, 15) || "missing",
    });
  });

  // Set up session, passport, and auth routes (/api/login, /api/logout, /api/register, /api/user)
  setupAuth(app);

  // =====================
  // Health check
  // =====================

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  // =====================
  // Config APIs
  // =====================
  
  // Get Google Maps API key for Places Autocomplete
  app.get("/api/config/google-maps-key", (req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(404).json({ error: "Google Maps API key not configured" });
    }
    res.json({ apiKey });
  });
  
  // =====================
  // Business Profile APIs
  // =====================
  
  // Get all business profiles for the authenticated user
  app.get("/api/business-profiles", requireAuth, async (req, res) => {
    try {
      const profiles = await storage.getBusinessProfilesByUser(req.user!.id);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching business profiles:", error);
      res.status(500).json({ error: "Failed to fetch business profiles" });
    }
  });
  
  // Get a single business profile
  app.get("/api/business-profiles/:id", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const profile = await storage.getBusinessProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ error: "Business profile not found" });
      }
      
      // Check if the profile belongs to the authenticated user
      if (profile.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to access this profile" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching business profile:", error);
      res.status(500).json({ error: "Failed to fetch business profile" });
    }
  });
  
  // Create a new business profile
  app.post("/api/business-profiles", requireAuth, async (req, res) => {
    try {
      // Validate request body
      const schema = z.object({
        businessName: z.string().min(1, "Business name is required"),
        businessLocation: z.string().min(1, "Business location is required"),
        businessService: z.string().min(1, "Business service is required"),
        representativeName: z.string().optional(),
        isPrimary: z.boolean().optional().default(false)
      });
      
      const validatedData = schema.parse(req.body);
      
      // Add the user ID
      const profile = await storage.createBusinessProfile({
        ...validatedData,
        userId: req.user!.id
      });
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error("Error creating business profile:", error);
      res.status(500).json({ error: "Failed to create business profile" });
    }
  });
  
  // Update a business profile
  app.patch("/api/business-profiles/:id", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      // Check if the profile exists and belongs to the user
      const existingProfile = await storage.getBusinessProfile(profileId);
      if (!existingProfile) {
        return res.status(404).json({ error: "Business profile not found" });
      }
      
      if (existingProfile.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to update this profile" });
      }
      
      // Validate request body
      const schema = z.object({
        businessName: z.string().min(1, "Business name is required").optional(),
        businessLocation: z.string().min(1, "Business location is required").optional(),
        businessService: z.string().min(1, "Business service is required").optional(),
        businessType: z.string().optional(),
        representativeName: z.string().optional(),
        isPrimary: z.boolean().optional(),
        // Branding fields (require paid plan check if setting these)
        logoUrl: z.string().url().nullable().optional(),
        primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        welcomeMessage: z.string().max(500).nullable().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Check plan for branding features
      const user = req.user!;
      const hasBrandingFields = validatedData.logoUrl !== undefined || 
        validatedData.primaryColor !== undefined || 
        validatedData.accentColor !== undefined ||
        validatedData.welcomeMessage !== undefined;
      
      if (hasBrandingFields && user.planType === 'free') {
        return res.status(403).json({ error: "Custom branding requires a Pro or Enterprise plan" });
      }
      
      // Update the profile
      const updatedProfile = await storage.updateBusinessProfile(profileId, validatedData);
      
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error("Error updating business profile:", error);
      res.status(500).json({ error: "Failed to update business profile" });
    }
  });
  
  // Delete a business profile
  app.delete("/api/business-profiles/:id", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      // Check if the profile exists and belongs to the user
      const existingProfile = await storage.getBusinessProfile(profileId);
      if (!existingProfile) {
        return res.status(404).json({ error: "Business profile not found" });
      }
      
      if (existingProfile.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to delete this profile" });
      }
      
      // Delete the profile
      await storage.deleteBusinessProfile(profileId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting business profile:", error);
      res.status(500).json({ error: "Failed to delete business profile" });
    }
  });
  
  // Update branding for a business profile
  app.patch("/api/business-profiles/:id/branding", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      // Check if profile exists and belongs to user
      const existingProfile = await storage.getBusinessProfile(profileId);
      if (!existingProfile) {
        return res.status(404).json({ error: "Business profile not found" });
      }
      
      if (existingProfile.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to update this profile" });
      }
      
      // Check plan for branding features
      const user = req.user!;
      if (user.planType === 'free') {
        return res.status(403).json({ error: "Custom branding requires a Pro or Enterprise plan" });
      }
      
      // Validate branding data
      const schema = z.object({
        logoUrl: z.string().url().nullable().optional(),
        primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        welcomeMessage: z.string().max(500).nullable().optional()
      });
      
      const validatedData = schema.parse(req.body);
      const updatedProfile = await storage.updateBusinessProfile(profileId, validatedData);
      
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating branding:", error);
      res.status(500).json({ error: "Failed to update branding" });
    }
  });
  
  // Generate share slug for a business profile
  app.post("/api/business-profiles/:id/share-slug", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      const existingProfile = await storage.getBusinessProfile(profileId);
      if (!existingProfile) {
        return res.status(404).json({ error: "Business profile not found" });
      }
      
      if (existingProfile.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to update this profile" });
      }
      
      const shareSlug = await storage.generateShareSlug(profileId);
      res.json({ shareSlug, shareUrl: `/review/${shareSlug}` });
    } catch (error) {
      console.error("Error generating share slug:", error);
      res.status(500).json({ error: "Failed to generate share link" });
    }
  });
  
  // Generate embed token for a business profile
  app.post("/api/business-profiles/:id/embed-token", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      const existingProfile = await storage.getBusinessProfile(profileId);
      if (!existingProfile) {
        return res.status(404).json({ error: "Business profile not found" });
      }
      
      if (existingProfile.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to update this profile" });
      }
      
      // Check plan for embed features
      const user = req.user!;
      if (user.planType !== 'enterprise') {
        return res.status(403).json({ error: "Embed widget requires an Enterprise plan" });
      }
      
      const embedToken = await storage.generateEmbedToken(profileId);
      res.json({ embedToken, embedEnabled: true });
    } catch (error) {
      console.error("Error generating embed token:", error);
      res.status(500).json({ error: "Failed to generate embed token" });
    }
  });
  
  // ========================
  // Public Review Page APIs
  // ========================
  
  // Get business profile by share slug (public access)
  app.get("/api/public/review/:shareSlug", async (req, res) => {
    try {
      const { shareSlug } = req.params;
      const profile = await storage.getBusinessProfileByShareSlug(shareSlug);
      
      if (!profile) {
        return res.status(404).json({ error: "Review page not found" });
      }
      
      // Return public-safe profile data with branding
      res.json({
        id: profile.id,
        businessName: profile.businessName,
        businessLocation: profile.businessLocation,
        businessService: profile.businessService,
        businessType: profile.businessType,
        services: profile.services,
        representativeName: profile.representativeName,
        logoUrl: profile.logoUrl,
        primaryColor: profile.primaryColor,
        accentColor: profile.accentColor,
        welcomeMessage: profile.welcomeMessage
      });
    } catch (error) {
      console.error("Error fetching public review profile:", error);
      res.status(500).json({ error: "Failed to fetch review page" });
    }
  });
  
  // Get embed config by token (for widget)
  app.get("/api/embed/:embedToken/config", async (req, res) => {
    try {
      const { embedToken } = req.params;
      const profile = await storage.getBusinessProfileByEmbedToken(embedToken);
      
      if (!profile || !profile.isEmbedEnabled) {
        return res.status(404).json({ error: "Embed not found or disabled" });
      }
      
      // Return embed-safe profile data
      res.json({
        businessName: profile.businessName,
        businessLocation: profile.businessLocation,
        businessService: profile.businessService,
        businessType: profile.businessType,
        representativeName: profile.representativeName,
        logoUrl: profile.logoUrl,
        primaryColor: profile.primaryColor,
        accentColor: profile.accentColor,
        welcomeMessage: profile.welcomeMessage,
        shareSlug: profile.shareSlug
      });
    } catch (error) {
      console.error("Error fetching embed config:", error);
      res.status(500).json({ error: "Failed to fetch embed configuration" });
    }
  });
  
  // ======================
  // Review Template APIs
  // ======================
  
  // Get all review templates for the authenticated user
  app.get("/api/review-templates", requireAuth, async (req, res) => {
    try {
      const templates = await storage.getReviewTemplatesByUser(req.user!.id);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching review templates:", error);
      res.status(500).json({ error: "Failed to fetch review templates" });
    }
  });
  
  // Get all public templates plus user's templates
  app.get("/api/review-templates/all", requireAuth, async (req, res) => {
    try {
      const userTemplates = await storage.getReviewTemplatesByUser(req.user!.id);
      const publicTemplates = await storage.getPublicReviewTemplates();
      
      // Filter out duplicates (user's templates that are also public)
      const publicTemplateIds = new Set(publicTemplates.map(t => t.id));
      const uniqueUserTemplates = userTemplates.filter(t => !publicTemplateIds.has(t.id));
      
      res.json([...uniqueUserTemplates, ...publicTemplates]);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });
  
  // Get a template by its shareable ID (public access - no auth required)
  app.get("/api/shared-templates/:shareableId", async (req, res) => {
    try {
      const { shareableId } = req.params;
      const template = await storage.getReviewTemplateByShareableId(shareableId);
      
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      // Include business profile information in the response
      res.json(template);
    } catch (error) {
      console.error("Error fetching shared template:", error);
      res.status(500).json({ error: "Failed to fetch shared template" });
    }
  });
  
  // Get templates for a specific business profile
  app.get("/api/business-profiles/:id/templates", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      // Check if the profile exists and belongs to the user
      const existingProfile = await storage.getBusinessProfile(profileId);
      if (!existingProfile) {
        return res.status(404).json({ error: "Business profile not found" });
      }
      
      if (existingProfile.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to access this profile" });
      }
      
      const templates = await storage.getReviewTemplatesByBusiness(profileId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates for business:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });
  
  // Get a single review template
  app.get("/api/review-templates/:id", requireAuth, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getReviewTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ error: "Review template not found" });
      }
      
      // Allow access to public templates or owned templates
      if (!template.isPublic && template.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to access this template" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching review template:", error);
      res.status(500).json({ error: "Failed to fetch review template" });
    }
  });
  
  // Create a new review template
  app.post("/api/review-templates", requireAuth, async (req, res) => {
    try {
      // Validate request body
      const schema = z.object({
        name: z.string().min(1, "Template name is required"),
        description: z.string().optional(),
        relationshipType: z.string().min(1, "Relationship type is required"),
        businessProfileId: z.number().optional(),
        customQuestions: z.array(
          z.object({
            question: z.string(),
            subtitle: z.string(),
            placeholder: z.string(),
            options: z.array(z.string()).optional()
          })
        ).optional(),
        isPublic: z.boolean().optional().default(false)
      });
      
      const validatedData = schema.parse(req.body);
      
      // Check if making public templates is restricted to premium users
      if (validatedData.isPublic && req.user!.planType === 'free') {
        return res.status(403).json({ error: "Creating public templates requires a premium plan" });
      }
      
      // If a business profile is specified, verify it belongs to the user
      if (validatedData.businessProfileId) {
        const profile = await storage.getBusinessProfile(validatedData.businessProfileId);
        if (!profile || profile.userId !== req.user!.id) {
          return res.status(403).json({ error: "Invalid business profile" });
        }
      }
      
      // Add the user ID
      const template = await storage.createReviewTemplate({
        ...validatedData,
        userId: req.user!.id
      });
      
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error("Error creating review template:", error);
      res.status(500).json({ error: "Failed to create review template" });
    }
  });
  
  // Update a review template
  app.patch("/api/review-templates/:id", requireAuth, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      
      // Check if the template exists and belongs to the user
      const existingTemplate = await storage.getReviewTemplate(templateId);
      if (!existingTemplate) {
        return res.status(404).json({ error: "Review template not found" });
      }
      
      if (existingTemplate.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to update this template" });
      }
      
      // Validate request body
      const schema = z.object({
        name: z.string().min(1, "Template name is required").optional(),
        description: z.string().optional(),
        relationshipType: z.string().min(1, "Relationship type is required").optional(),
        businessProfileId: z.number().optional().nullable(),
        customQuestions: z.array(
          z.object({
            question: z.string(),
            subtitle: z.string(),
            placeholder: z.string(),
            options: z.array(z.string()).optional()
          })
        ).optional(),
        isPublic: z.boolean().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Check if making public templates is restricted to premium users
      if (validatedData.isPublic === true && req.user!.planType === 'free') {
        return res.status(403).json({ error: "Creating public templates requires a premium plan" });
      }
      
      // If a business profile is specified, verify it belongs to the user
      if (validatedData.businessProfileId) {
        const profile = await storage.getBusinessProfile(validatedData.businessProfileId);
        if (!profile || profile.userId !== req.user!.id) {
          return res.status(403).json({ error: "Invalid business profile" });
        }
      }
      
      // Update the template
      const updatedTemplate = await storage.updateReviewTemplate(templateId, validatedData);
      
      res.json(updatedTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error("Error updating review template:", error);
      res.status(500).json({ error: "Failed to update review template" });
    }
  });
  
  // Delete a review template
  app.delete("/api/review-templates/:id", requireAuth, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      
      // Check if the template exists and belongs to the user
      const existingTemplate = await storage.getReviewTemplate(templateId);
      if (!existingTemplate) {
        return res.status(404).json({ error: "Review template not found" });
      }
      
      if (existingTemplate.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to delete this template" });
      }
      
      // Delete the template
      await storage.deleteReviewTemplate(templateId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting review template:", error);
      res.status(500).json({ error: "Failed to delete review template" });
    }
  });
  
  // ============
  // Review APIs
  // ============
  
  // Get all reviews for the authenticated user
  app.get("/api/reviews", requireAuth, async (req, res) => {
    try {
      const reviews = await storage.getReviewsByUser(req.user!.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  
  // Get a single review
  app.get("/api/reviews/:id", requireAuth, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const review = await storage.getReview(reviewId);
      
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      
      // Check if the review belongs to the authenticated user
      if (review.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to access this review" });
      }
      
      res.json(review);
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ error: "Failed to fetch review" });
    }
  });

  // Generate review endpoint (supports both regular and super reviews)
  app.post("/api/generate-review", generateReviewLimiter, async (req, res) => {
    try {
      const { relationshipType, businessType, serviceLocation, businessName, businessLocation, businessService, representativeName, answers, isSuperReview, userName = '', userId, businessProfileId, templateId } = req.body;
      
      // Validate required fields (answers can be 3 or 4 depending on relationship type)
      if (!relationshipType || !businessName || !businessLocation || !businessService || !Array.isArray(answers) || answers.length < 3 || answers.length > 4) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Sanitize answers: strip control characters and cap each at 500 characters
      const sanitize = (val: unknown): string =>
        String(val ?? "").replace(/[\x00-\x1F\x7F]/g, "").trim().slice(0, 500);
      const sanitizedAnswers = answers.map(sanitize);

      // Extract meeting location if provided (first answer for certain appointment types)
      const hasMeetingLocation = sanitizedAnswers.length === 4 &&
        ["appointment-after-no-purchase", "appointment-after-purchase", "appointment-after-purchase-not-started"].includes(relationshipType);
      const meetingLocation = hasMeetingLocation ? sanitizedAnswers[0] : null;
      const experienceAnswers = hasMeetingLocation ? sanitizedAnswers.slice(1) : sanitizedAnswers;
      
      // Super reviews are premium features - check if authenticated and on premium plan
      if (isSuperReview && req.isAuthenticated() && req.user!.planType === 'free') {
        return res.status(403).json({ error: "Super reviews require a premium plan" });
      }

      // Enforce free plan monthly limit (3 reviews/month for authenticated free users)
      let freeUserReviewCount: number | null = null;
      if (req.isAuthenticated() && req.user!.planType === 'free') {
        const freshUser = await storage.getUser(req.user!.id);
        if (freshUser) {
          const now = new Date();
          const periodStart = freshUser.reviewPeriodStart;
          const isNewPeriod =
            !periodStart ||
            now.getFullYear() !== periodStart.getFullYear() ||
            now.getMonth() !== periodStart.getMonth();

          if (isNewPeriod) {
            await storage.updateUser(freshUser.id, {
              reviewsGeneratedThisMonth: 0,
              reviewPeriodStart: now,
            });
            freeUserReviewCount = 0;
          } else {
            freeUserReviewCount = freshUser.reviewsGeneratedThisMonth;
            if (freeUserReviewCount >= 3) {
              return res.status(403).json({
                error: "You've used all 3 free reviews for this month. Upgrade to Pro for unlimited reviews.",
                upgradeUrl: "/pricing",
              });
            }
          }
        }
      }
      
      // Build the representative line if a name was provided
      const repLine = representativeName ? `- Representative's name: ${representativeName}` : "";
      
      // ============================================
      // BANNED PHRASES - These sound robotic/AI-written
      // ============================================
      const bannedPhrases = [
        // Formal/academic words
        "utilize", "utilized", "endeavor", "meticulous", "exceptional", "impeccable",
        "seamless", "seamlessly", "commence", "facilitate", "leverage", "optimal",
        "paramount", "plethora", "robust", "synergy", "aforementioned",
        // Overused review clichés
        "exceeded expectations", "exceeded my expectations", "above and beyond",
        "went above and beyond", "second to none", "top-notch", "first-rate",
        "world-class", "best in class", "highly recommend", "cannot recommend enough",
        "look no further", "gem of a", "hidden gem", "absolute gem",
        "game changer", "game-changer", "breath of fresh air",
        // Vague corporate speak
        "has built a strong reputation", "is known for", "is dedicated to",
        "committed to excellence", "strives for excellence", "prides themselves",
        "takes pride in", "passion for", "passionate about",
        // Hedging/uncertain phrases (undermine authority)
        "from what I know", "from what I hear", "from what I've heard",
        "I've heard that", "they seem to be", "they appear to be",
        "it seems like", "it appears that", "supposedly",
        // Formal transitions
        "furthermore", "moreover", "in addition", "subsequently",
        "consequently", "henceforth", "thus", "hence",
        // Overly formal phrases
        "I felt at ease", "with ease", "at my earliest convenience",
        "do not hesitate", "don't hesitate to", "rest assured",
        "it goes without saying", "needless to say",
        // AI-sounding praise
        "truly remarkable", "truly exceptional", "absolutely wonderful",
        "absolutely amazing", "simply the best", "nothing short of",
        "I was blown away", "blew me away", "pleasantly surprised",
        // Generic business descriptors
        "attention to detail", "customer-centric", "customer-focused",
        "client-focused", "results-driven", "solution-oriented"
      ];
      
      // ============================================
      // NATURAL LANGUAGE ALTERNATIVES
      // ============================================
      const toneGuidelines = `
TONE & LANGUAGE RULES:
- Write like you're texting a friend about a good experience
- Use contractions: "I'm", "they're", "didn't", "wasn't", "couldn't"
- Keep sentences short (under 15 words is ideal)
- Use common words a 10-year-old would understand
- Be specific about what happened, not how you felt about it
- Show, don't tell: instead of "great service" say what they actually did

BANNED SPECIAL CHARACTERS (never use these - people don't type them on phones):
- Parentheses: ( )
- Angle brackets: < >
- Colons and semicolons: : ;
- Carets and percent: ^ %
- Ampersand and asterisk: & *
- Em dashes: —
- Use commas, periods, exclamation marks, and question marks only

WORD SWAPS (use the second option):
- "utilize" → "use"
- "exceptional" → "really good" or just describe what was good
- "meticulous" → "careful" or "paid attention"
- "exceeded expectations" → describe what they did specifically
- "highly recommend" → "you should check them out" or "give them a call"
- "seamless" → "easy" or "smooth"
- "I felt at ease" → "I felt comfortable" or "I relaxed"
- "with ease" → "easily" or "without any problems"
- "knowledgeable" → "knew their stuff" or "answered all my questions"
- "professional" → describe what made them professional
- "outstanding" → "really good" or be specific

AUTHENTICITY MARKERS (include 1-2 of these, but ONLY if explicitly mentioned in responses):
- Use informal sentence starters: "So", "Honestly", "Okay so"
- Rephrase the user's actual answers into natural conversation
- Vary sentence structure and length for natural flow

STRICT FACTUAL RULES:
- ONLY use information explicitly provided in the business info and responses
- NEVER invent reasons why the customer needed the service
- NEVER fabricate problems, issues, or backstory (e.g., "broken window", "letting in cold air")
- NEVER add specific details not mentioned (colors, times, what someone said)
- When context is missing, use generic openings like "needed [service]" or start with the experience directly
- If you don't know WHY they needed the service, don't guess - just say they "used" or "worked with" the business
`;

      // ============================================
      // RELATIONSHIP-SPECIFIC GUIDANCE
      // ============================================
      let relationshipGuidance = "";
      
      if (relationshipType === "customer") {
        relationshipGuidance = `
REVIEWER CONTEXT: Direct customer who used the service/product

WRITE AS IF:
- You personally went there and experienced it
- You're telling a friend what happened
- Use past tense for what happened: "I went", "They did", "It was"

OPENING VARIETY (pick ONE style randomly - use ONLY the service type provided, never invent problems):
- Time-based: "Just had [service] done by..." or "Recently worked with..." or "A few weeks ago I used..."
- Direct action: "Called [business] for [service]..." or "Reached out to [business] for help with [service]..."
- Location-based: "Stopped by [business] in [city]..." or "Went to [business] for [service]..."
- Casual start: "So I needed [service] and..." or "Honestly, [business] really helped with my [service]..."
- Experience-first: "Working with [business] was great..." or "[Rep name] from [business] was awesome..."

DO NOT use these opening styles (they invite fabrication):
- "Had an issue with..." or "Had a problem with..." (we don't know if there was an issue)
- "My neighbor told me..." or "Found through a friend..." (we don't know how they found the business)

INCLUDE (only from provided responses):
- The service type they provide (from business info)
- What stood out from their actual responses
- Their recommendation sentiment

AVOID:
- Inventing WHY they needed the service
- Making up problems or issues that weren't mentioned
- Adding backstory about their situation
- Fabricating specific details (broken things, weather, timing)
- Sounding like a commercial
`;
      } else if (relationshipType === "acquaintance") {
        relationshipGuidance = `
REVIEWER CONTEXT: Someone who knows/follows the business but isn't describing a direct transaction

WRITE AS IF:
- You're recommending a place you trust
- You have a genuine connection or reason to recommend them
- You're speaking from knowledge, not just hearsay

CRITICAL RULES:
- NEVER say "I haven't used their service" or similar
- NEVER use hedging phrases like "from what I know" or "I've heard"
- NEVER fabricate how you know them unless stated in responses
- ONLY use details explicitly mentioned in the user's responses
- Write with confidence - no disclaimers or qualifiers
- Focus on what you DO know, not what you don't

GOOD APPROACH:
- Describe your genuine impression
- Mention why you'd recommend them
- Keep it simple and direct
`;
      } else if (relationshipType === "appointment-before") {
        relationshipGuidance = `
REVIEWER CONTEXT: Has scheduled an appointment that hasn't happened yet

WRITE AS IF:
- You just booked and are excited about it
- You're sharing your booking experience
- Use future tense for the actual service

GOOD PHRASES:
- "I just scheduled my appointment..."
- "Looking forward to..."
- "The booking process was..."
- "Can't wait for my appointment..."

CRITICAL - NEVER SAY:
- "My appointment hasn't happened yet"
- "Even though I haven't been there yet"
- "I haven't actually used their service"
- Any mention of not having experienced the service yet
`;
      } else if (relationshipType === "appointment-after-no-purchase") {
        relationshipGuidance = `
REVIEWER CONTEXT: Had a consultation/meeting but didn't make a purchase

WRITE AS IF:
- You had a good informative meeting
- You appreciated their time and information
- Focus on the consultation experience only

INCLUDE:
- How helpful the consultation was
- What you learned
- How they treated you during the meeting

AVOID:
- Any mention of buying/not buying
- Any mention of moving forward or not
- Pressure or sales tactics references
`;
      } else if (relationshipType === "appointment-after-purchase-not-started") {
        relationshipGuidance = `
REVIEWER CONTEXT: Made a purchase/commitment but work hasn't started

WRITE AS IF:
- You made a decision and feel good about it
- You're in the waiting period before service begins
- You're confident in your choice

GOOD PHRASES:
- "I've decided to go with them for..."
- "Just signed on with them..."
- "Looking forward to getting started..."
- "They've been great to work with so far..."
`;
      } else if (relationshipType === "appointment-after-purchase") {
        relationshipGuidance = `
REVIEWER CONTEXT: Complete experience - appointment, purchase, and finished work

WRITE AS IF:
- You went through the whole process
- You can speak to the entire experience
- Everything is done and you're reflecting on it

INCLUDE:
- Brief mention of the process from start to finish
- What the end result was like
- Whether you'd use them again
`;
      }

      // ============================================
      // BUSINESS TYPE CONTEXT
      // ============================================
      let businessTypeGuidance = "";
      
      if (businessType === "restaurant") {
        businessTypeGuidance = `
BUSINESS CATEGORY: Restaurant/Food Service
- Focus on: food quality, taste, freshness, portion size
- Mention: server/staff friendliness, atmosphere, wait time if relevant
- Vocabulary: "delicious", "tasty", "fresh", "cozy", "welcoming", "quick service"
- Opening ideas: "Tried [business] for the first time...", "Grabbed lunch at...", "Stopped in for dinner..."
- DO NOT use home service language like "installation", "job site", "consultation", "estimate"
`;
      } else if (businessType === "retail") {
        businessTypeGuidance = `
BUSINESS CATEGORY: Retail/Shopping
- Focus on: product selection, quality, prices, store cleanliness
- Mention: staff helpfulness, checkout experience, finding what you needed
- Vocabulary: "great selection", "helpful staff", "easy checkout", "good prices", "clean store"
- Opening ideas: "Stopped by [business] looking for...", "Found exactly what I needed at...", "Love shopping at..."
- DO NOT use home service language like "installation", "job site", "consultation", "estimate"
`;
      } else if (businessType === "professional-services") {
        businessTypeGuidance = `
BUSINESS CATEGORY: Professional Services (legal, accounting, consulting, etc.)
- Focus on: expertise, communication, responsiveness, results
- Mention: how they explained things, their availability, follow-through
- Vocabulary: "knew their stuff", "easy to talk to", "responsive", "got back to me quickly", "explained everything"
- Opening ideas: "Worked with [business] for...", "Needed help with... and [business] was great...", "Used [business] for..."
- DO NOT use restaurant language like "delicious", "tasty", or home service language like "installation"
`;
      } else if (businessType === "healthcare") {
        businessTypeGuidance = `
BUSINESS CATEGORY: Healthcare/Wellness (doctors, dentists, therapists, spas, salons)
- Focus on: care quality, comfort, professionalism, environment
- Mention: how the staff made you feel, cleanliness, thoroughness
- Vocabulary: "caring", "thorough", "took their time", "listened", "comfortable", "clean", "professional"
- Opening ideas: "Had an appointment at [business]...", "Been going to [business] for...", "First visit to [business]..."
- DO NOT use restaurant or home service language
`;
      } else if (businessType === "home-services") {
        businessTypeGuidance = `
BUSINESS CATEGORY: Home Services (contractors, plumbers, electricians, etc.)
- Focus on: work quality, timeliness, cleanliness, professionalism
- Mention: if they arrived on time, cleaned up after, explained the work
- Vocabulary: "showed up on time", "did a great job", "cleaned up after", "fair price", "would hire again"
- Opening ideas: "Had [business] come out for...", "Used [business] for...", "Called [business] when I needed..."
- This category supports appointment-based flows with meeting locations
`;
      } else {
        businessTypeGuidance = `
BUSINESS CATEGORY: General Business
- Adapt your language to match the service/product described
- Focus on: quality of service/product, staff interactions, overall experience
- Keep language neutral and appropriate for any business type
`;
      }

      // ============================================
      // LENGTH & FORMAT SETTINGS
      // ============================================
      let lengthGuideline = "4-6 sentences total. Short and punchy.";
      let maxTokens = 500;
      
      if (isSuperReview) {
        lengthGuideline = "10-15 sentences (stay under Google's 4000 character limit). More detail but still conversational.";
        maxTokens = 3500;
        
        relationshipGuidance += `

SUPER REVIEW ADDITIONS:
- Include more specific details from the responses
- Add a bit more about what made it a good experience
- Still sound natural, just more thorough
- DON'T pad with generic praise - add real details only
- Keep every sentence adding new information
`;
      }

      // ============================================
      // BUILD THE FINAL PROMPT
      // ============================================
      const meetingLocationLine = meetingLocation ? `- Meeting took place: ${meetingLocation}` : "";
      
      let serviceLocationContext = "";
      if (serviceLocation === "visited") {
        serviceLocationContext = `
SERVICE LOCATION CONTEXT:
- The customer VISITED the business location (e.g., store, office, showroom, restaurant)
- Write as if the reviewer went to their location
- Opening ideas: "Stopped by...", "Visited...", "Went to...", "Headed over to..."
`;
      } else if (serviceLocation === "came-to-me") {
        serviceLocationContext = `
SERVICE LOCATION CONTEXT:
- The business came TO THE CUSTOMER (e.g., mobile service, home visit, on-site work)
- Write as if the provider came to the reviewer's location (home, office, job site)
- Opening ideas: "Had them come out to...", "They came to my place...", "Called them to come out...", "They made a house call..."
- Vocabulary: "came to my home", "showed up at my place", "came out to", "arrived on time"
`;
      }
      
      const prompt = `
Write a Google review based on these details:

BUSINESS INFO:
- Business: ${businessName}
- Location: ${businessLocation}
- Service/Product: ${businessService}
${repLine}
${meetingLocationLine}

REVIEWER'S RESPONSES:
1. ${experienceAnswers[0]}
2. ${experienceAnswers[1]}
3. ${experienceAnswers[2]}

${meetingLocation ? `MEETING LOCATION CONTEXT:
The meeting happened "${meetingLocation}". Use this to write the opening naturally:
- "At my home" → write something like "I had a meeting with [business] at my home in [city]..."
- "At their showroom or office" → write something like "I stopped by [business] in [city]..." or "I visited [business] at their office in [city]..."
- "Over the phone or video call" → write something like "I had a call with [business]..." or "I spoke with [business] over the phone..."
- "At a job site or other location" → adapt naturally based on context
` : ""}
${serviceLocationContext}
${relationshipGuidance}

${businessTypeGuidance}

${toneGuidelines}

BANNED PHRASES (never use any of these):
${bannedPhrases.join(", ")}

FORMAT:
- Length: ${lengthGuideline}
- Include business name and location naturally for SEO
${representativeName ? `- Mention ${representativeName} naturally if appropriate` : ""}
${userName && userName.trim() ? `- End with signature: "- ${userName.trim()}"` : "- DO NOT add any name or signature at the end"}

FINAL CHECK:
- Does this sound like a real person wrote it?
- Would you believe this if you read it on Google?
- Is every detail from the responses, not made up?
`;
      
      // Using gpt-4o-mini for Vercel Hobby plan compatibility (10s function timeout — gpt-4o-mini completes in 2-4s)
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You write Google reviews that sound like real people wrote them.

CORE IDENTITY:
- You write like a regular person, not a marketing department
- Every review sounds different because real people write differently  
- You ONLY use information explicitly provided - never invent details
- You follow Google's review policies

WRITING STYLE:
- Casual, conversational, like texting a friend
- Short sentences (under 15 words)
- Simple words a 10-year-old knows
- Use contractions: "I'm", "they're", "didn't"
- Vary sentence structure and length
- Include 1-2 specific details to sound authentic

ABSOLUTE RULES:
- NEVER use banned phrases from the list provided
- NEVER say someone "hasn't used the service" or similar
- NEVER invent names, scenarios, or how someone knows the business
- NEVER add hedging phrases like "from what I know" or "I've heard"
- ONLY include a signature if a name was explicitly provided
- Match the relationship type's tense (future for upcoming, past for completed)
- If a representative name is provided, mention them naturally in the review

${isSuperReview ? "This is a SUPER REVIEW - write longer (10-15 sentences) but maintain the same natural tone. Stay under 4000 characters." : ""}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.65,
        max_tokens: maxTokens
      });
      
      const review = response.choices[0].message.content?.trim() || 
        "We couldn't generate a review at this time. Please try again.";
        
      // If the user is authenticated and specified business profile and/or template ID
      // save the review to the database
      if (req.isAuthenticated() && req.user!.id) {
        try {
          const reviewData = {
            userId: req.user!.id,
            businessProfileId: businessProfileId || null,
            templateId: templateId || null,
            businessName,
            businessLocation,
            businessService,
            representativeName: representativeName || null,
            relationshipType,
            answer1: answers[0],
            answer2: answers[1],
            answer3: answers[2],
            reviewerName: userName || null,
            generatedReview: review,
            isSuperReview: isSuperReview || false,
            isPublished: false
          };

          await storage.createReview(reviewData);
        } catch (saveError) {
          console.error("Error saving review:", saveError);
          // Continue even if saving fails
        }

        // Increment monthly usage counter for free plan users
        if (req.user!.planType === 'free' && freeUserReviewCount !== null) {
          try {
            await storage.updateUser(req.user!.id, {
              reviewsGeneratedThisMonth: freeUserReviewCount + 1,
            });
          } catch (counterError) {
            console.error("Error incrementing review counter:", counterError);
          }
        }
      }
      
      res.json({ review });
    } catch (error) {
      console.error("Error generating review:", error);
      res.status(500).json({ 
        error: "Failed to generate review",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Update review publication status
  app.patch("/api/reviews/:id/publish", requireAuth, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { isPublished } = req.body;
      
      if (typeof isPublished !== 'boolean') {
        return res.status(400).json({ error: "isPublished must be a boolean" });
      }
      
      // Check if the review exists and belongs to the user
      const existingReview = await storage.getReview(reviewId);
      if (!existingReview) {
        return res.status(404).json({ error: "Review not found" });
      }
      
      if (existingReview.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to update this review" });
      }
      
      // Update the review
      const updatedReview = await storage.updateReview(reviewId, { isPublished });
      
      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ error: "Failed to update review" });
    }
  });
  
  // Delete a review
  app.delete("/api/reviews/:id", requireAuth, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      
      // Check if the review exists and belongs to the user
      const existingReview = await storage.getReview(reviewId);
      if (!existingReview) {
        return res.status(404).json({ error: "Review not found" });
      }
      
      if (existingReview.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to delete this review" });
      }
      
      // Delete the review
      await storage.deleteReview(reviewId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ error: "Failed to delete review" });
    }
  });
  
  // Update user profile (fullName, company)
  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const { fullName, company, hasOnboarded } = req.body;

      // Update only allowed fields
      const updateData: { fullName?: string; company?: string; hasOnboarded?: boolean } = {};
      if (fullName !== undefined) updateData.fullName = fullName;
      if (company !== undefined) updateData.company = company;
      if (hasOnboarded !== undefined) updateData.hasOnboarded = Boolean(hasOnboarded);
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      
      const updatedUser = await storage.updateUser(req.user!.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  
  // Update user plan (this would normally be handled by a payment processor webhook)
  app.post("/api/user/update-plan", requireAuth, async (req, res) => {
    try {
      const { planType } = req.body;
      
      if (!planType || !['free', 'pro', 'enterprise'].includes(planType)) {
        return res.status(400).json({ error: "Invalid plan type" });
      }
      
      // Update the user's plan
      const updatedUser = await storage.updateUser(req.user!.id, { planType });
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user plan:", error);
      res.status(500).json({ error: "Failed to update user plan" });
    }
  });

  // =====================
  // Stripe Webhook
  // =====================

  app.post("/api/stripe/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !secret) {
      return res.status(400).json({ error: "Missing stripe signature or webhook secret" });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, secret);
    } catch (err: any) {
      console.error("Stripe webhook signature verification failed:", err.message);
      return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }

    async function getUserByCustomerId(customerId: string) {
      const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
      return user;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;
          if (!customerId || !subscriptionId) break;

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price?.id;
          const planName = priceId ? PRICE_PLAN_MAP[priceId] : undefined;

          const user = await getUserByCustomerId(customerId);
          if (user && planName) {
            await storage.updateUser(user.id, {
              stripeCustomerId: customerId,
              stripePlanId: subscriptionId,
              planType: planName,
            });
          }
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as any;
          const customerId = subscription.customer as string;
          const priceId = subscription.items?.data?.[0]?.price?.id as string | undefined;
          const planName = priceId ? PRICE_PLAN_MAP[priceId] : undefined;

          const user = await getUserByCustomerId(customerId);
          if (user) {
            await storage.updateUser(user.id, {
              stripePlanId: subscription.id,
              ...(planName ? { planType: planName } : {}),
            });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as any;
          const customerId = subscription.customer as string;

          const user = await getUserByCustomerId(customerId);
          if (user) {
            await storage.updateUser(user.id, {
              stripePlanId: null,
              planType: "free",
            });
          }
          break;
        }

        default:
          // Ignore other event types
          break;
      }
    } catch (err) {
      console.error("Stripe webhook handler error:", err);
      return res.status(500).json({ error: "Webhook handler failed" });
    }

    res.json({ received: true });
  });

  // =====================
  // Stripe Checkout
  // =====================

  // Create a Stripe Checkout Session for Pro or Business plan
  app.post("/api/stripe/create-checkout-session", requireAuth, async (req, res) => {
    try {
      const { planId } = z.object({ planId: z.enum(["pro", "business"]) }).parse(req.body);

      const priceId = PLAN_PRICE_MAP[planId];
      if (!priceId) {
        return res.status(400).json({ error: "Invalid plan" });
      }

      const user = req.user!;
      const appUrl = process.env.APP_URL ?? "http://localhost:5000";

      // Retrieve or create Stripe customer
      let customerId = user.stripeCustomerId ?? undefined;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email ?? undefined,
          metadata: { userId: String(user.id) },
        });
        customerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/dashboard?upgraded=true`,
        cancel_url: `${appUrl}/pricing`,
      });

      res.json({ url: session.url });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Create a Stripe Billing Portal Session for managing subscriptions
  app.post("/api/stripe/create-portal-session", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const appUrl = process.env.APP_URL ?? "http://localhost:5000";

      if (!user.stripeCustomerId) {
        return res.status(400).json({ error: "No Stripe customer found for this account" });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${appUrl}/dashboard`,
      });

      res.json({ url: portalSession.url });
    } catch (error) {
      console.error("Stripe portal error:", error);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
