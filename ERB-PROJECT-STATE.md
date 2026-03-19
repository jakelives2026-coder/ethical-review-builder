# ERB Project State — Living Memory Document
**App:** Ethical Review Builder (ERB)
**URL:** https://www.ethicalreviewbuilder.com
**GitHub:** https://github.com/jakelives2026-coder/ethical-review-builder
**Mission Control:** https://mission-control-two-self.vercel.app
**Last Updated:** 2026-03-19

---

## ⚠️ HOW TO USE THIS DOCUMENT
This file is the anti-compaction memory for ERB. At the start of every new Cowork session:
1. Share this file with Claude (drag-drop or paste path)
2. Claude reads it before doing anything else
3. At the end of the session, Claude updates this file with new work done

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

**Key deployment note:** Vercel is deployed via CLI (`npx vercel --prod --force`), NOT GitHub auto-deploy. Always push to GitHub first, then deploy.

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
- Username/password login
- Session-based auth
- Protected routes
- Registration flow

### Dashboard
- Business Profiles tab — lists all profiles with Edit/Branding/Share/Review buttons
- My Reviews tab — shows all generated reviews from `/api/reviews`
- History tab — **STUB ONLY** (shows placeholder text, no data wired up — candidate for removal)
- Settings tab — profile info + subscription plan display
- Mobile bottom navigation bar
- **Files:** `client/src/pages/dashboard.tsx`

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

---

## 🚧 PENDING / NEXT TO BUILD

### High Priority
1. **Proof Upload UX Flow** — When `requireProof: true`, reviewer needs to upload screenshot/photo after submitting review. Reward is shown conditionally. No backend endpoint exists yet.

2. **Review Delivery Methods** — Enhanced sending: Email, SMS, QR code delivery for review requests. Partially discussed, NOT started.
   - Should integrate with Review Platforms drip ordering
   - Email: send reviewer a direct link to the public review page
   - SMS: similar link via text
   - QR code: generate scannable code pointing to `/review/:slug`

3. **History Tab** — Either remove it (recommended) or implement as a proper audit log (all generation attempts including abandoned ones, with timestamps). Currently a dead stub.

4. **Mobile Copy Button** (UI-021) — Copy button on generated review not working on mobile.

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

### Self-Improvement Protocol
1. VERIFY — check live site and code before assuming anything
2. SYNC — confirm GitHub matches live (use Claude Code to read files directly, not GitHub browser search)
3. COMMIT — document changes in ERB-UI-UX-STANDARDS.md

### GitHub Browser Search Warning
⚠️ GitHub's in-browser file search is UNRELIABLE for large files (routes.ts is 1479 lines). It returns "no matches" for things that are definitely there. Always use Claude Code to read files directly.

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
