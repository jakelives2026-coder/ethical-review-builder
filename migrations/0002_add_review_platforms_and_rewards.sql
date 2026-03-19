-- Migration: Add review platforms and reward fields to business profiles
-- Adds support for configuring review platforms (Google, Yelp, TrustPilot, BBB)
-- and reward descriptions with proof requirements

ALTER TABLE business_profiles ADD COLUMN review_platforms JSONB;

ALTER TABLE business_profiles ADD COLUMN reward_description TEXT;

ALTER TABLE business_profiles ADD COLUMN require_proof BOOLEAN DEFAULT false;
