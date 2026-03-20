# ERB Project State — Living Memory Document
**App:** Ethical Review Builder (ERB)
**URL:** https://www.ethicalreviewbuilder.com
**GitHub:** https://github.com/jakelives2026-coder/ethical-review-builder
**Mission Control:** https://mission-control-two-self.vercel.app
**Last Updated:** 2026-03-19 (session 3 — post-compaction fix)

---

## ⚠️ HOW TO USE THIS DOCUMENT
This file is the anti-compaction memory for ERB. At the start of every new Cowork session:
1. Share this file with Claude (drag-drop or paste path)
2. Claude reads this file AND `docs/openclaw/skill-ethical-review-builder.md` before any work
3. At the end of the session, Claude updates this file with new work done

**OpenClaw docs** (protocols, rules, monetization) live at `docs/openclaw/` in the repo and are also copied to the Cowork outputs folder. Read them with the Read tool — do not try to fetch them from Mission Control via browser.

---

## 🏗️ STACK
| Layer | Technology |
|---|---|
| Frontend | Vite 5 + React 18 + shadcn/ui + Tailwind |
| Backend | Express.js (Node 20) |
| ORM | Drizzle ORM |
| Database | Neon PostgreSQL (serverless) |
| AI | OpenAI API |
| Payments | Stripe |
| Hosting | Vercel (CLI deploy: `vercel --prod --force`) |
| Language | TypeScript throughout |

**Key deployment note:** Vercel GitHub auto-deploy is **permanently disabled** (Ignored Build Step → "Don't build anything", set 2026-03-19). The ONLY way to deploy is `npx vercel --prod --force` from the terminal. `git push` alone will NEVER trigger a deploy.

---

## ✅ FEATURES FULLY BUILT & LIVE

### Core Review Builder
- Multi-step wizard: Welcome → Business → Relationship → Keywords → Generate → Result
- Session persistence via `sessionStorage` (survives page refresh mid-flow)
- OpenAI-powered review generation
- Super Review mode (enhanced generation)
- Star rating selection
- Regenerate review option
- Copy-to-clipboard functionality
- **Files:** `client/src/components/ReviewBuilder/index.tsx`

### Business Profiles
- Full CRUD: create, edit, delete business profiles
- Primary profile designation
- Share slug generation (public review page at `/review/:slug`)
- Branding/settings dialog per profile
- Business logo upload support
- **Files:** `client/src/components/BusinessProfiles/BusinessProfileForm.tsx`, `server/routes.ts`

### Review Platforms (Drip Campaign Ordering) ✅ BUILT 2026-03
- Toggle platforms: Google, Yelp, Trustpilot, BBB
- Per-platform URL entry
- Drag-reorder for drip campaign priority
- **Schema field:** `reviewPlatforms JSONB` → `{platformName, platformUrl, priorityOrder}[]`
- **Files:** `client/src/components/BusinessProfiles/BusinessProfileForm.tsx`, `shared/schema.ts`

### Reviewer Reward System ✅ BUILT 2026-03
- Reward description textarea (shown to reviewer after submission)
- Require proof checkbox (enables screenshot/photo upload requirement)
- **Schema fields:** `rewardDescription TEXT`, `requireProof BOOLEAN DEFAULT false`
- **Files:** `client/src/components/BusinessProfiles/BusinessProfileForm.tsx`, `shared/schema.ts`
- **⚠️ PENDING:** The proof upload UX flow (customer uploads evidence to claim reward) is NOT yet built

### Authentication
- Username/password login with email verification
- **Google OAuth** (passport-google-oauth20) — fully live at `/api/auth/google`
- Session-based auth (1-week max age, secure cookies in prod)
- Rate limiting: 10 req/15min on auth routes
- Email verification via Resend API (auto-verified for Google OAuth users)
- Password reset: token-based, 1-hour expiry
- Protected routes
- Registration flow

### Dashboard
- Business Profiles tab — lists all profiles with Edit/Branding/Share/Review buttons
- My Reviews tab — shows all generated reviews from `/api/reviews`
- Settings tab — profile info + subscription plan display
- Mobile bottom navigation bar
- **Files:** `client/src/pages/dashboard.tsx`
- ✅ History tab removed 2026-03-19 (was empty stub, commit fcc7ef4)

### Subscription / Stripe
- Free tier with monthly review limit (`reviewsThisMonth` counter)
- Pro tier
- Stripe integration for upgrades
- Plan display in Settings tab

### Public Review Page
- Shareable URL at `/review/:slug`
- Shows business branding
- Reviewer fills in their details → generates review via wizard
- **Files:** `client/src/pages/review-page.tsx` (confirm path)

### Contact Page ✅ BUILT 2026-03-19
- Route: `/contact`
- Email contact link + support resources
- **Files:** `client/src/pages/contact-page.tsx`, `client/src/App.tsx`

### Branded 404 Page ✅ FIXED 2026-03-19
- Replaced developer error message with friendly branded 404
- Home + Dashboard nav buttons
- **Files:** `client/src/pages/not-found.tsx`

---

## 🐛 KNOWN BUGS & STATUS

See full details in: `ERB-UI-UX-STANDARDS.md`

| ID | Description | Status |
|---|---|---|
| UI-019 | Developer 404 message showing to users | ✅ Fixed 2026-03-19 |
| UI-020 | /contact route missing | ✅ Fixed 2026-03-19 |
| UI-021 | Mobile copy button not functioning | 🔴 Open |
| UI-022 | No loading state on regenerate | 🔴 Open |
| UI-023 | Reward description not shown on public page | 🔴 Open |
| UI-024 | Session race condition in handleStartOver | ✅ Fixed 2026-03-19 |
| UI-025 | Full address showing instead of City, ST | ✅ Fixed 2026-03-19 |
| BUG-006 | ?tab=register URL param broken | 🔴 Open (needs logged-out test) |
| BUG-007 | Google Places auto-populates businessService with wrong type mapping | ✅ Fixed 2026-03-19 |
| BUG-008 | Saving profile with enabled platform but empty URL returns 400 error | ✅ Fixed 2026-03-19 |

---

## 🚧 PENDING / NEXT TO BUILD

### High Priority
1. **Proof Upload UX Flow** — When `requireProof: true`, reviewer needs to upload screenshot/photo after submitting review. Reward is shown conditionally. No backend endpoint exists yet.

2. **Review Delivery Methods** — Enhanced sending: Email, SMS, QR code delivery for review requests. Partially discussed, NOT started.
   - Should integrate with Review Platforms drip ordering
   - Email: send reviewer a direct link to the public review page
   - SMS: similar link via text
   - QR code: generate scannable code pointing to `/review/:slug`

3. **Mobile Copy Button** (UI-021) — Copy button on generated review not working on mobile.

5. **Regenerate Loading State** (UI-022) — No spinner/feedback when regenerating review.

### Medium Priority
6. **Reward Display on Public Page** (UI-023) — `rewardDescription` from business profile not shown to reviewer after they submit.

7. **BUG-006** — `?tab=register` URL param not working (needs logged-out browser test to verify).

### Housekeeping
8. **Reset `reviewsThisMonth`** for jake.lives.2026@gmail.com in Neon PostgreSQL to enable C1 (free tier limit) testing.

---

## 📁 KEY FILE LOCATIONS

```
client/src/
  pages/
    dashboard.tsx          ← Main dashboard (tabs, profiles, reviews)
    not-found.tsx          ← 404 page
    contact-page.tsx       ← /contact route
    review-page.tsx        ← Public reviewer page (/review/:slug)
  components/
    BusinessProfiles/
      BusinessProfileForm.tsx   ← Edit profile modal (Review Platforms, Reward sections)
      ProfileSettingsDialog.tsx ← Branding settings
    ReviewBuilder/
      index.tsx            ← Multi-step review wizard
  App.tsx                  ← Routes

server/
  routes.ts                ← All API endpoints (1479 lines)
  storage.ts               ← Database queries

shared/
  schema.ts                ← Drizzle schema (source of truth for DB fields)
```

---

## 🧠 WORKFLOW RULES

### ⚠️ MANDATORY: Doc Sync After Every Update
Whenever ERB-PROJECT-STATE.md or any file in docs/openclaw/ is updated, ALWAYS immediately provide this copy-paste command without waiting to be asked:
```bash
cd ~/Projects/ethical-review-builder && cp "/Users/jakelives/Library/Application Support/Claude/local-agent-mode-sessions/92b1eccf-e2c2-44ff-ae6b-c641811f4753/20c71548-9130-4e5b-ad4d-0bb7586671b1/local_7ee715ed-36d3-4a4e-b80c-ef7a0b0c0ab9/outputs/ERB-PROJECT-STATE.md" docs/ERB-PROJECT-STATE.md && git add docs/ERB-PROJECT-STATE.md && git commit -m "docs: update ERB-PROJECT-STATE" && git push origin main
```
Never require Jason to ask for this. It is part of every task completion.

### Cowork vs Claude Code Boundary
- **Cowork (here):** Auditing, documentation, reading code, planning, creating prompts for Claude Code
- **Claude Code (terminal):** File edits, commits, deploys — Jason runs commands I provide

### GitHub Sync Protocol
Always verify before assuming code is or isn't live:
```bash
# Jason runs in terminal to check last commit
git log --oneline -5
```

### Deploy Command
```bash
git add -A && git commit -m "description" && git push origin main && npx vercel --prod --force
```
Note: `git push` no longer triggers auto-deploy (permanently disabled). The `npx vercel --prod --force` at the end is the actual deploy — it is always required.

### ⚠️ CRITICAL: Deploy Rule
GitHub auto-deploy is **permanently disabled** in Vercel (set 2026-03-19). `git push` will NEVER trigger a deploy. The only deploy command is:
```bash
npx vercel --prod --force
```
This always produces a clean ~100KB API bundle. Never use `git push` alone as a deploy method.

### Self-Improvement Protocol
1. VERIFY — check live site and code before assuming anything
2. SYNC — confirm GitHub matches live (use Claude Code to read files directly, not GitHub browser search)
3. COMMIT — document changes in ERB-UI-UX-STANDARDS.md

### GitHub Browser Search Warning
⚠️ GitHub's in-browser file search is UNRELIABLE for large files (routes.ts is 1479 lines). It returns "no matches" for things that are definitely there. Always use Claude Code to read files directly.

### OpenClaw Protocols (from docs/openclaw/ in repo)
- **Session start:** Read MEMORY.md + ERB-PROJECT-STATE.md before any work
- **OpenClaw docs location:** `docs/openclaw/` in repo, also copied to Cowork outputs folder
- **Mission filter:** Does this help Hello Support serve clients or attract new ones? If no → deprioritize
- **Approval gate:** Stop after each task. Report to Jason. Await explicit approval before next task
- **Terminal-first:** Run `tsc --noEmit` before any browser verification
- **OpenAI model:** gpt-4o-mini ONLY (Vercel 10s timeout kills gpt-4o)
- **OpenAI calls:** Native fetch() directly — do NOT use OpenAI SDK
- **Smoke test required after every deployment** (see skill-ethical-review-builder.md)

### Monetization Tiers
- Free: $0, 3 reviews/month, 1 business profile
- Pro: $29/month, unlimited reviews, 5 business profiles, tone controls
- Business: $99/month, unlimited, white-label, team seats, API access
- Hello Support 5 clients = $495/mo MRR potential

---

## 📋 ERB TASK LOG (Mission Control)

ERB-21 (Final App Completion Audit) — **CLOSED ✅** 2026-03-19, 18/18 PASS

Next task to open: Review Delivery Methods (Email/SMS/QR) or Proof Upload UX

---

## 🗓️ SESSION HISTORY

| Date | Work Done |
|---|---|
| 2026-03-15 | Review Platforms + Reviewer Reward feature built and deployed |
| 2026-03-19 | ERB-21 audit complete; fixed UI-019, UI-020, UI-024, UI-025; created this doc |
| 2026-03-19 (s2) | Fixed Google OAuth (stale bundle from auto-deploy); removed stub History tab (fcc7ef4); added Google OAuth + Resend to state doc; synced all 5 OpenClaw docs to docs/openclaw/ in repo + Cowork outputs folder (commit 027abb0) |
| 2026-03-19 (s3) | Fixed BUG-007: removed Google Places auto-population of businessService field (commit de0b71a); smoke test 6/6 PASS; Floor Daddy service corrected to "Flooring Installation and Sales" via Edit UI; permanently disabled Vercel GitHub auto-deploy (Ignored Build Step → Don't build anything, commit 0307480); fixed BUG-008: allow empty platformUrl on enabled platforms (commit 27bd985) |
