-- Add structured project context to email review requests.
-- Used as customer-specific memory prompts on the public review page.
-- Shape: { city?: string, services?: string[], areas?: string[], materials?: string, summary?: string }
ALTER TABLE email_review_requests
  ADD COLUMN IF NOT EXISTS project_context jsonb;
