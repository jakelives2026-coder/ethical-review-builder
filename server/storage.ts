import {
  users, type User, type InsertUser,
  businessProfiles, type BusinessProfile, type InsertBusinessProfile,
  reviews, type Review, type InsertReview,
  reviewTemplates, type ReviewTemplate, type InsertReviewTemplate,
  reviewRequests, type ReviewRequest, type InsertReviewRequest
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, not } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import * as crypto from "crypto";

const PostgresSessionStore = connectPg(session);

// Enhanced storage interface with all SaaS functionality
export interface IStorage {
  // Session store
  sessionStore: any;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByAuthId(authId: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<Omit<User, "id">>): Promise<User | undefined>;
  findOrCreateUserByOIDC(claims: { sub: string; email?: string; first_name?: string; last_name?: string; profile_image_url?: string }): Promise<User>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  setPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void>;
  clearPasswordResetToken(userId: number): Promise<void>;
  getUserByEmailVerificationToken(token: string): Promise<User | undefined>;
  setEmailVerificationToken(userId: number, token: string): Promise<void>;
  markEmailVerified(userId: number): Promise<void>;
  
  // Business profile operations
  getBusinessProfile(id: number): Promise<BusinessProfile | undefined>;
  getBusinessProfilesByUser(userId: number): Promise<BusinessProfile[]>;
  getPrimaryBusinessProfile(userId: number): Promise<BusinessProfile | undefined>;
  getBusinessProfileByShareSlug(shareSlug: string): Promise<BusinessProfile | undefined>;
  getBusinessProfileByEmbedToken(embedToken: string): Promise<BusinessProfile | undefined>;
  createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile>;
  updateBusinessProfile(id: number, data: Partial<Omit<BusinessProfile, "id">>): Promise<BusinessProfile | undefined>;
  deleteBusinessProfile(id: number): Promise<boolean>;
  generateShareSlug(profileId: number): Promise<string>;
  generateEmbedToken(profileId: number): Promise<string>;
  
  // Review template operations
  getReviewTemplate(id: number): Promise<ReviewTemplate | undefined>;
  getReviewTemplatesByUser(userId: number): Promise<ReviewTemplate[]>;
  getReviewTemplatesByBusiness(businessProfileId: number): Promise<ReviewTemplate[]>;
  getPublicReviewTemplates(): Promise<ReviewTemplate[]>;
  // New methods for enhanced template functionality
  getReviewTemplateByShareableId(shareableId: string): Promise<(ReviewTemplate & { businessProfile?: BusinessProfile }) | undefined>;
  createReviewTemplate(template: InsertReviewTemplate): Promise<ReviewTemplate>;
  updateReviewTemplate(id: number, data: Partial<Omit<ReviewTemplate, "id">>): Promise<ReviewTemplate | undefined>;
  generateShareableId(templateId: number): Promise<string>;
  deleteReviewTemplate(id: number): Promise<boolean>;
  
  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  getReviewsByBusiness(businessProfileId: number): Promise<Review[]>;
  getReviewsByTemplate(templateId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, data: Partial<Omit<Review, "id">>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;

  // Review request operations (drip campaign)
  getReviewRequest(id: number): Promise<ReviewRequest | undefined>;
  getReviewRequestByToken(token: string): Promise<(ReviewRequest & { platformName?: string }) | undefined>;
  createReviewRequest(request: InsertReviewRequest): Promise<ReviewRequest>;
  updateReviewRequest(id: number, data: Partial<Omit<ReviewRequest, "id">>): Promise<ReviewRequest | undefined>;
}

// Ensures the session table and index exist using IF NOT EXISTS so cold starts
// don't crash when connect-pg-simple tries to re-create an existing index.
export async function ensureSessionTable(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
      ) WITH (OIDS=FALSE);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
  } finally {
    client.release();
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // createTableIfMissing: false — we handle session table creation ourselves
    // in ensureSessionTable() with proper IF NOT EXISTS to avoid cold-start crashes.
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: false
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const [user] = await db.insert(users).values({
      ...insertUser,
      planType: 'free',
      createdAt: now,
      lastLoginAt: now
    }).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<Omit<User, "id">>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.authId, authId));
    return user;
  }

  async findOrCreateUserByOIDC(claims: { sub: string; email?: string; first_name?: string; last_name?: string; profile_image_url?: string }): Promise<User> {
    // First, try to find user by authId
    let user = await this.getUserByAuthId(claims.sub);
    if (user) {
      // Update profile info
      return await this.updateUser(user.id, {
        fullName: claims.first_name && claims.last_name ? `${claims.first_name} ${claims.last_name}` : claims.first_name || user.fullName,
        profileImageUrl: claims.profile_image_url || user.profileImageUrl,
        lastLoginAt: new Date()
      }) as User;
    }

    // Try to find by email and link the authId
    if (claims.email) {
      user = await this.getUserByEmail(claims.email);
      if (user) {
        return await this.updateUser(user.id, {
          authId: claims.sub,
          fullName: claims.first_name && claims.last_name ? `${claims.first_name} ${claims.last_name}` : claims.first_name || user.fullName,
          profileImageUrl: claims.profile_image_url || user.profileImageUrl,
          lastLoginAt: new Date()
        }) as User;
      }
    }

    // Create new user with unique username
    const baseUsername = claims.email?.split('@')[0] || `user_${claims.sub.slice(0, 8)}`;
    let uniqueUsername = baseUsername;
    let attempt = 0;
    
    while (attempt < 10) {
      const existingUser = await this.getUserByUsername(uniqueUsername);
      if (!existingUser) break;
      attempt++;
      uniqueUsername = `${baseUsername}_${crypto.randomBytes(4).toString('hex')}`;
    }
    
    const [newUser] = await db.insert(users).values({
      username: uniqueUsername,
      password: crypto.randomBytes(32).toString('hex'), // Random password since OIDC handles auth
      email: claims.email || `${claims.sub}@replit.auth`,
      fullName: claims.first_name && claims.last_name ? `${claims.first_name} ${claims.last_name}` : claims.first_name || null,
      authId: claims.sub,
      profileImageUrl: claims.profile_image_url || null,
      planType: 'free',
      createdAt: new Date(),
      lastLoginAt: new Date()
    }).returning();
    return newUser;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user;
  }

  async setPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    await db.update(users)
      .set({ passwordResetToken: token, passwordResetExpiresAt: expiresAt })
      .where(eq(users.id, userId));
  }

  async clearPasswordResetToken(userId: number): Promise<void> {
    await db.update(users)
      .set({ passwordResetToken: null, passwordResetExpiresAt: null })
      .where(eq(users.id, userId));
  }

  async getUserByEmailVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user;
  }

  async setEmailVerificationToken(userId: number, token: string): Promise<void> {
    await db.update(users)
      .set({ emailVerificationToken: token })
      .where(eq(users.id, userId));
  }

  async markEmailVerified(userId: number): Promise<void> {
    await db.update(users)
      .set({ emailVerified: true, emailVerificationToken: null })
      .where(eq(users.id, userId));
  }

  // Business profile operations
  async getBusinessProfile(id: number): Promise<BusinessProfile | undefined> {
    const [profile] = await db.select().from(businessProfiles).where(eq(businessProfiles.id, id));
    return profile;
  }

  async getBusinessProfilesByUser(userId: number): Promise<BusinessProfile[]> {
    return db.select().from(businessProfiles).where(eq(businessProfiles.userId, userId));
  }

  async getPrimaryBusinessProfile(userId: number): Promise<BusinessProfile | undefined> {
    const [profile] = await db.select().from(businessProfiles)
      .where(and(
        eq(businessProfiles.userId, userId),
        eq(businessProfiles.isPrimary, true)
      ));
    return profile;
  }

  async createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile> {
    const now = new Date();

    // If this is the first profile or marked as primary, ensure it's the only primary
    if (profile.isPrimary) {
      await db.update(businessProfiles)
        .set({ isPrimary: false })
        .where(eq(businessProfiles.userId, profile.userId));
    }

    const [newProfile] = await db.insert(businessProfiles).values({
      ...profile,
      reviewPlatforms: profile.reviewPlatforms as any,
      createdAt: now,
      updatedAt: now
    }).returning();

    return newProfile;
  }

  async updateBusinessProfile(id: number, data: Partial<Omit<BusinessProfile, "id">>): Promise<BusinessProfile | undefined> {
    const now = new Date();

    // If setting as primary, unset any other primary profiles
    if (data.isPrimary) {
      const [profile] = await db.select().from(businessProfiles).where(eq(businessProfiles.id, id));
      if (profile) {
        await db.update(businessProfiles)
          .set({ isPrimary: false })
          .where(and(
            eq(businessProfiles.userId, profile.userId),
            not(eq(businessProfiles.id, id))
          ));
      }
    }

    const updateData: any = {
      ...data,
      updatedAt: now
    };

    // Ensure reviewPlatforms is properly typed
    if (data.reviewPlatforms !== undefined) {
      updateData.reviewPlatforms = data.reviewPlatforms as any;
    }

    const [updatedProfile] = await db.update(businessProfiles)
      .set(updateData)
      .where(eq(businessProfiles.id, id))
      .returning();

    return updatedProfile;
  }

  async deleteBusinessProfile(id: number): Promise<boolean> {
    const [deletedProfile] = await db.delete(businessProfiles)
      .where(eq(businessProfiles.id, id))
      .returning();
    return !!deletedProfile;
  }

  async getBusinessProfileByShareSlug(shareSlug: string): Promise<BusinessProfile | undefined> {
    const [profile] = await db.select().from(businessProfiles).where(eq(businessProfiles.shareSlug, shareSlug));
    return profile;
  }

  async getBusinessProfileByEmbedToken(embedToken: string): Promise<BusinessProfile | undefined> {
    const [profile] = await db.select().from(businessProfiles).where(eq(businessProfiles.embedToken, embedToken));
    return profile;
  }

  async generateShareSlug(profileId: number): Promise<string> {
    const profile = await this.getBusinessProfile(profileId);
    if (!profile) throw new Error("Profile not found");
    
    // Generate a URL-friendly slug based on business name + random suffix
    const baseName = profile.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const shareSlug = `${baseName}-${randomSuffix}`;
    
    await this.updateBusinessProfile(profileId, { shareSlug });
    return shareSlug;
  }

  async generateEmbedToken(profileId: number): Promise<string> {
    const profile = await this.getBusinessProfile(profileId);
    if (!profile) throw new Error("Profile not found");
    
    const embedToken = crypto.randomBytes(32).toString('hex');
    await this.updateBusinessProfile(profileId, { embedToken, isEmbedEnabled: true });
    return embedToken;
  }

  // Review template operations
  async getReviewTemplate(id: number): Promise<ReviewTemplate | undefined> {
    const [template] = await db.select().from(reviewTemplates).where(eq(reviewTemplates.id, id));
    return template;
  }

  async getReviewTemplatesByUser(userId: number): Promise<ReviewTemplate[]> {
    return db.select().from(reviewTemplates).where(eq(reviewTemplates.userId, userId));
  }

  async getReviewTemplatesByBusiness(businessProfileId: number): Promise<ReviewTemplate[]> {
    return db.select().from(reviewTemplates).where(eq(reviewTemplates.businessProfileId, businessProfileId));
  }

  async getPublicReviewTemplates(): Promise<ReviewTemplate[]> {
    return db.select().from(reviewTemplates).where(eq(reviewTemplates.isPublic, true));
  }

  async getReviewTemplateByShareableId(shareableId: string): Promise<ReviewTemplate & { businessProfile?: BusinessProfile } | undefined> {
    // First fetch the template
    const [template] = await db.select().from(reviewTemplates).where(eq(reviewTemplates.shareableId, shareableId));
    
    if (!template) {
      return undefined;
    }
    
    // If there's a business profile ID, fetch that profile
    if (template.businessProfileId) {
      const profile = await this.getBusinessProfile(template.businessProfileId);
      if (profile) {
        return {
          ...template,
          businessProfile: profile
        };
      }
    }
    
    return template;
  }

  async createReviewTemplate(template: InsertReviewTemplate): Promise<ReviewTemplate> {
    const now = new Date();
    
    // Prepare the values for insertion
    // Extract only the fields that are defined in the schema
    const insertValues = {
      userId: template.userId,
      businessProfileId: template.businessProfileId,
      name: template.name,
      description: template.description,
      relationshipType: template.relationshipType,
      allowRelationshipChange: template.allowRelationshipChange,
      thankYouMessage: template.thankYouMessage,
      redirectUrl: template.redirectUrl,
      customQuestions: template.customQuestions as any,
      settings: template.settings,
      isPublic: template.isPublic,
      updatedAt: now
    };
    
    // Create the template without a shareable ID initially
    const [newTemplate] = await db.insert(reviewTemplates).values(insertValues as any).returning();
    
    // Generate and update with a shareable ID
    if (newTemplate) {
      const shareableId = await this.generateShareableId(newTemplate.id);
      const [updatedTemplate] = await db.update(reviewTemplates)
        .set({ shareableId })
        .where(eq(reviewTemplates.id, newTemplate.id))
        .returning();
      
      return updatedTemplate || newTemplate;
    }
    
    return newTemplate;
  }
  
  async generateShareableId(templateId: number): Promise<string> {
    // Generate a unique shareable ID based on template ID and timestamp
    // Format: t-{templateId}-{randomString}
    const randomBytes = crypto.randomBytes(8);
    const randomString = randomBytes.toString('hex');
    
    const shareableId = `t-${templateId}-${randomString}`;
    return shareableId;
  }

  async updateReviewTemplate(id: number, data: Partial<Omit<ReviewTemplate, "id">>): Promise<ReviewTemplate | undefined> {
    const now = new Date();
    const [updatedTemplate] = await db.update(reviewTemplates)
      .set({
        ...data,
        updatedAt: now
      })
      .where(eq(reviewTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteReviewTemplate(id: number): Promise<boolean> {
    const [deletedTemplate] = await db.delete(reviewTemplates)
      .where(eq(reviewTemplates.id, id))
      .returning();
    return !!deletedTemplate;
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
  }

  async getReviewsByBusiness(businessProfileId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.businessProfileId, businessProfileId)).orderBy(desc(reviews.createdAt));
  }

  async getReviewsByTemplate(templateId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.templateId, templateId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const now = new Date();
    const [newReview] = await db.insert(reviews).values({
      ...review,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newReview;
  }

  async updateReview(id: number, data: Partial<Omit<Review, "id">>): Promise<Review | undefined> {
    const now = new Date();
    const [updatedReview] = await db.update(reviews)
      .set({
        ...data,
        updatedAt: now
      })
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }

  async deleteReview(id: number): Promise<boolean> {
    const [deletedReview] = await db.delete(reviews)
      .where(eq(reviews.id, id))
      .returning();
    return !!deletedReview;
  }

  // Review request operations
  async getReviewRequest(id: number): Promise<ReviewRequest | undefined> {
    const [request] = await db.select().from(reviewRequests).where(eq(reviewRequests.id, id));
    return request;
  }

  async getReviewRequestByToken(token: string): Promise<(ReviewRequest & { platformName?: string }) | undefined> {
    // Search for token in confirmationTokens JSONB
    const [request] = await db.select().from(reviewRequests)
      .where(eq(reviewRequests.id, eq(reviewRequests.id, reviewRequests.id))) // This is a placeholder, actual search below
      .limit(1);

    // For token lookup, we need to scan the table since tokens are in JSONB
    const requests = await db.select().from(reviewRequests);
    for (const req of requests) {
      const tokens = req.confirmationTokens as Record<string, string> | null;
      if (tokens) {
        for (const [platform, tkn] of Object.entries(tokens)) {
          if (tkn === token) {
            return { ...req, platformName: platform };
          }
        }
      }
    }
    return undefined;
  }

  async createReviewRequest(request: InsertReviewRequest): Promise<ReviewRequest> {
    const insertData: any = {
      businessProfileId: request.businessProfileId,
      reviewerEmail: request.reviewerEmail,
      reviewText: request.reviewText,
      currentPlatformIndex: request.currentPlatformIndex ?? 0,
    };

    if (request.platformsSequence) {
      insertData.platformsSequence = request.platformsSequence as any;
    }
    if (request.statusPerPlatform) {
      insertData.statusPerPlatform = request.statusPerPlatform as any;
    }
    if (request.confirmationTokens) {
      insertData.confirmationTokens = request.confirmationTokens;
    }

    const [newRequest] = await db.insert(reviewRequests).values(insertData).returning();
    return newRequest;
  }

  async updateReviewRequest(id: number, data: Partial<Omit<ReviewRequest, "id">>): Promise<ReviewRequest | undefined> {
    const [updatedRequest] = await db.update(reviewRequests)
      .set(data as any)
      .where(eq(reviewRequests.id, id))
      .returning();
    return updatedRequest;
  }
}

export const storage = new DatabaseStorage();
