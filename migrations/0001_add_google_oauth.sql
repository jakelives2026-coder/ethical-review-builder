-- Migration: Add Google OAuth support
-- Adds googleId column for Google OAuth linkage and makes password nullable for OAuth users

ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;

CREATE INDEX idx_google_id ON users(google_id);
