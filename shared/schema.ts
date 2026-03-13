import { pgTable, text, serial, timestamp, varchar, integer, boolean, index, uniqueIndex, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enhanced user table for SaaS
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  company: text("company"),
  planType: text("plan_type").default("free").notNull(), // free, pro, enterprise
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
  // Replit Auth OIDC user ID (sub claim) for linking to auth provider
  authId: text("auth_id").unique(),
  profileImageUrl: text("profile_image_url"),
  // Password reset
  passwordResetToken: text("password_reset_token").unique(),
  passwordResetExpiresAt: timestamp("password_reset_expires_at"),
  // Email verification
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerificationToken: text("email_verification_token").unique(),
  // Stripe billing
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripePlanId: text("stripe_plan_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  company: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Business profiles for users
export const businessProfiles = pgTable("business_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  businessLocation: varchar("business_location", { length: 255 }).notNull(),
  businessService: varchar("business_service", { length: 255 }).notNull(),
  businessType: varchar("business_type", { length: 50 }).default("other"), // restaurant, home-services, retail, professional-services, healthcare, other
  services: text("services"), // Comma-separated list of services offered
  representativeName: varchar("representative_name", { length: 255 }),
  isPrimary: boolean("is_primary").default(false),
  // Branding fields
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#6366f1"), // hex color
  accentColor: varchar("accent_color", { length: 7 }).default("#8b5cf6"), // hex color
  welcomeMessage: text("welcome_message"),
  // Shareable link fields
  shareSlug: varchar("share_slug", { length: 64 }).unique(),
  // Embed widget fields
  embedToken: varchar("embed_token", { length: 64 }).unique(),
  isEmbedEnabled: boolean("is_embed_enabled").default(false),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
}, (table) => {
  return {
    shareSlugIdx: index("business_profiles_share_slug_idx").on(table.shareSlug),
    embedTokenIdx: index("business_profiles_embed_token_idx").on(table.embedToken),
  };
});

export const businessProfilesRelations = relations(businessProfiles, ({ one }) => ({
  user: one(users, {
    fields: [businessProfiles.userId],
    references: [users.id],
  }),
}));

export const insertBusinessProfileSchema = createInsertSchema(businessProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
export type BusinessProfile = typeof businessProfiles.$inferSelect;

// Review templates
export const reviewTemplates = pgTable("review_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessProfileId: integer("business_profile_id").references(() => businessProfiles.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // Default relationship type for this template
  relationshipType: varchar("relationship_type", { length: 50 }).notNull(),
  // Allow recipient to change relationship type?
  allowRelationshipChange: boolean("allow_relationship_change").default(true),
  // Unique shareable identifier (slug) for this template
  shareableId: varchar("shareable_id", { length: 64 }).unique(),
  // Custom thank you message after submission
  thankYouMessage: text("thank_you_message"),
  // Redirect URL after submission (optional)
  redirectUrl: varchar("redirect_url", { length: 255 }),
  // Custom questions specific to this template
  customQuestions: jsonb("custom_questions").$type<{
    question: string;
    subtitle: string;
    placeholder: string;
    options?: string[];
  }[]>(),
  // Template settings
  settings: jsonb("settings").$type<{
    prefilledFields: string[]; // Which fields are pre-populated
    editableFields: string[]; // Which fields recipient can edit
    displayLogo: boolean; // Whether to show business logo
    useCustomColors: boolean; // Whether to use custom colors
    primaryColor: string; // Primary color for template
    accentColor: string; // Accent color for template
  }>(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const reviewTemplatesRelations = relations(reviewTemplates, ({ one }) => ({
  user: one(users, {
    fields: [reviewTemplates.userId],
    references: [users.id],
  }),
  businessProfile: one(businessProfiles, {
    fields: [reviewTemplates.businessProfileId],
    references: [businessProfiles.id],
  }),
}));

export const insertReviewTemplateSchema = createInsertSchema(reviewTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReviewTemplate = z.infer<typeof insertReviewTemplateSchema>;
export type ReviewTemplate = typeof reviewTemplates.$inferSelect;

// Enhanced review table with user association
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  businessProfileId: integer("business_profile_id").references(() => businessProfiles.id),
  templateId: integer("template_id").references(() => reviewTemplates.id),
  // Business information
  businessName: varchar("business_name", { length: 255 }).notNull(),
  businessLocation: varchar("business_location", { length: 255 }).notNull(),
  businessService: varchar("business_service", { length: 255 }).notNull(),
  representativeName: varchar("representative_name", { length: 255 }),
  // Review information
  relationshipType: varchar("relationship_type", { length: 50 }).notNull(),
  // Store all answers as JSON with question IDs
  answers: jsonb("answers").$type<Record<string, string>>(),
  reviewerName: varchar("reviewer_name", { length: 255 }),
  reviewerEmail: varchar("reviewer_email", { length: 255 }),
  generatedReview: text("generated_review").notNull(),
  // Review quality and status
  isSuperReview: boolean("is_super_review").default(false),
  isPublished: boolean("is_published").default(false),
  // Timestamps and tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  publishedAt: timestamp("published_at"),
}, (table) => {
  return {
    userIdIdx: index("reviews_user_id_idx").on(table.userId),
    businessProfileIdIdx: index("reviews_business_profile_id_idx").on(table.businessProfileId),
    templateIdIdx: index("reviews_template_id_idx").on(table.templateId),
  };
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  businessProfile: one(businessProfiles, {
    fields: [reviews.businessProfileId],
    references: [businessProfiles.id],
  }),
  template: one(reviewTemplates, {
    fields: [reviews.templateId],
    references: [reviewTemplates.id],
  }),
}));

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Re-export auth models for Replit Auth
export * from "./models/auth";
