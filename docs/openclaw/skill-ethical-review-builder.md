# Skill: Ethical Review Builder
**Version:** 1.9.0 | **Updated:** 2026-03-19
**GitHub:** https://github.com/jakelives2026-coder/ethical-review-builder
**Production:** https://www.ethicalreviewbuilder.com
**MC Project ID:** cmmmryy3i000004l123q3jvt5

## Purpose
Multi-tenant SaaS for authentic Google review generation. Users answer guided questions; OpenAI (gpt-4o-mini) synthesizes answers into a polished review paragraph the customer can post themselves.
Primary customers: Hello Support clients (Apex Windows and Bath, Floor Daddy, Aqua Science, Alta Window and Door, Ben Humble).
Revenue model: Free / Pro / Enterprise tiers via users.subscriptionTier column.

## Tech Stack
TypeScript strict | Vite 5 + React 18 + shadcn/ui | Express.js (Node 20)
Drizzle ORM | Neon PostgreSQL | OpenAI API gpt-4o-mini native fetch | Stripe | Resend | Vercel
Monorepo layout: client/ server/ shared/

## Database Schema
Table users: id, email, password (hashed), subscriptionTier (free/pro/enterprise), emailVerified, createdAt
Table sessions: sid, sess, expire (express-session/connect-pg-simple)

## Critical Deployment Rules
1. Use gpt-4o-mini ONLY. Vercel Hobby 10s timeout kills gpt-4o.
2. Do NOT use OpenAI SDK. Use native fetch() to https://api.openai.com/v1/chat/completions directly.
3. OpenAI quota errors: check ORG spending limit at platform.openai.com/settings/organization/limits (not account credits).
4. vercel.json must include functions.api/index.js.maxDuration = 60.
5. Never add api/index.js to .vercelignore.
6. Strip quotes from env vars when copying from .env.local.
7. DEPLOY RULE (PERMANENT — set 2026-03-19): Vercel GitHub auto-deploy is DISABLED (Ignored Build Step → "Don't build anything"). `git push` will NEVER trigger a Vercel deploy. The ONLY deploy command is `npx vercel --prod --force`. Always append it to every commit workflow:
   `git add -A && git commit -m "..." && git push origin main && npx vercel --prod --force`

## Bug Fix History
C1 — Free tier 403 silent reset: FIXED commit 8776e1d (2026-03-14)
  Problem: 403 from backend caused wizard to silently reset to earlier step with no user feedback.
  Fix: Error handler now parses 403 body, shows destructive toast "Free reviews limit reached" with description and Upgrade button. Wizard stays on current step.
  Verified live: Toast appears at Step 8. Wizard does NOT reset. ✅

C2 — Guest session state leak into authenticated session: FIXED commit 32b1eb8 (2026-03-15)
  Problem: Guest wizard session (_userId: null) persisted into authenticated session due to (a) race condition — mount useEffect ran before useAuth() resolved, and (b) missing React state reset after sessionStorage clear.
  Fix Round 1 (commit 60e8248): Tagged sessionStorage with _userId. Load/save/mid-session useEffects validate identity.
  Fix Round 2 / Patch (commit 32b1eb8): Added isLoading guard, hasRestoredSession ref (prevents double-restore), React state reset (setFormData + setCurrentStep + setVisibleStep) on identity mismatch.
  Key file: client/src/components/ReviewBuilder/index.tsx
  Verified via tsc --noEmit + grep. ✅

H1 — Step counter denominator wrong: FIXED commit 709e690 (2026-03-15)
H2 — Registration form disclaimer wrong: FIXED commit 5d31561 (2026-03-15)
H3 — ?tab=register URL param broken: FIXED commit 28c9bb4 (2026-03-15)
H3.5 — Google OAuth: FIXED commit 8d771c1 (2026-03-15) — passport-google-oauth20, /api/auth/google live
BUG-007 — Google Places auto-populates businessService with wrong type: FIXED commit de0b71a (2026-03-19)
  Problem: BusinessProfileForm.tsx called form.setValue("businessService", business.service) using Google Places type mapping (e.g. furniture_store → "Furniture Retail"), silently corrupting business profiles.
  Fix: Removed the auto-population block. Service field now requires manual entry.

## Smoke Test (Required After Every Deployment)
1. / loads with "Ethical Review Builder" heading and Get Started button
2. Get Started advances to Step 1 (business category grid)
3. Home Services continues to Step 2 (relationship question)
4. /pricing shows Free/Pro/Business plans with pricing
5. /auth renders login form with no console errors
6. /api/health returns { status: "ok" }
Run via Claude in Chrome. Attach screenshots to MC execution log before marking task complete.

## Terminal-First Verification Protocol (Added 2026-03-15)
For any complex bug fix, verify via terminal BEFORE any browser automation:
1. Run `tsc --noEmit` in project root — must return zero errors
2. Run targeted grep commands to confirm key fix lines are present
3. Run `npx vercel --prod --force` for any change
4. Only proceed to minimal browser spot-check after terminal confirms 100%
Rationale: Screen takeover is slower and less reliable for code-level verification. Terminal catches errors without deployment lag.

## Mission Control Task Protocol
Project ID: cmmmryy3i000004l123q3jvt5
Claim task: POST /api/tasks/[id]/claim
Log progress: POST /api/tasks/[id]/log with { logId, message, level }
Close task: commit + Vercel deploy confirmed + smoke test + screenshots + PATCH /api/tasks/[id] status done
APPROVAL GATE (ENFORCED): Stop after each task. Report to Jason. Await explicit approval before next task.

## Current Status
ERB-01 through ERB-21 all done. C1, C2, H1, H2, H3, H3.5, BUG-007 all fixed and live.
Remaining: H4 → M1-M5 (Medium) → L1-L6 (Low/Visual) from ERB-Claude-Code-Prompts.md.

## Monetization Tiers
Free: $0, 3 reviews/month, 1 business profile
Pro: $29/month, unlimited reviews, 5 business profiles, tone controls
Business: $99/month, unlimited, white-label, team seats, API access
Hello Support 5 existing clients = $495/mo MRR potential.
