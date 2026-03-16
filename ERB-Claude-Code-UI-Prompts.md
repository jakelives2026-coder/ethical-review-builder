# ERB — Claude Code UI/UX Prompt Templates
**Ethical Review Builder — Reusable Audit & Fix Prompts**
Last updated: 2026-03-16

---

## How to Use This File

These prompts are designed to be pasted directly into a Claude Code session (Jake's terminal). Each prompt references `ERB-UI-UX-STANDARDS.md` as the governing standards document. Run the **Session Start** prompt at the beginning of every UI/UX sprint. Use individual fix prompts as needed.

---

## PROMPT 0 — Session Start (Run First Every UI/UX Sprint)

```
Read the following files to load project context before doing any work:
1. ~/.openclaw/workspace/MEMORY.md
2. ~/Projects/mission-control/web/public/mc-state.md
3. ~/Projects/erb/ERB-UI-UX-STANDARDS.md (or wherever this file lives in the repo)

Confirm you have read all three files and summarize:
- Current ERB stack and deployment status
- Any open UI/UX issues from the standards doc issue log
- Account boundary rule (Jason = billing, Jake = operations)

Do not make any code changes until confirming context.
```

---

## PROMPT 1 — Full UI/UX Audit

```
You are performing a UI/UX audit of the Ethical Review Builder app at https://www.ethicalreviewbuilder.com

Reference: ERB-UI-UX-STANDARDS.md (Section 1–6)

Stack: TypeScript strict | Vite 5 + React 18 + shadcn/ui | Express.js (Node 20) | Drizzle ORM | Neon PostgreSQL | Vercel

Audit scope:
1. Run `tsc --noEmit` — confirm zero TypeScript errors before starting
2. Review all page-level components in client/src/pages/
3. Review all shared components in client/src/components/
4. For each issue found, log it using the Issue Log Template from ERB-UI-UX-STANDARDS.md Section 7
5. Categorize by heuristic violated (H1–H10 from Section 1)
6. Categorize severity: Critical / Major / Minor / Cosmetic
7. Do NOT auto-fix — produce an issue log only

Output format:
- Issue log table (Issue # | Description | Heuristic | Severity | File | Line)
- Summary: total issues by severity
- Recommended fix order (Critical first)
```

---

## PROMPT 2 — Responsive Design Audit

```
Audit all UI components in client/src/components/ and client/src/pages/ for responsive design issues.

Reference: ERB-UI-UX-STANDARDS.md Section 3 (Responsive Breakpoints)

Check for:
1. Any button or interactive element missing responsive text classes (text-sm md:text-base pattern)
2. Any hardcoded pixel widths that could overflow on mobile (< 375px viewport)
3. Bottom nav tabs — verify all use w-1/N equal-width pattern
4. Any modal or dialog that doesn't adapt to mobile (should be full-screen or bottom sheet on mobile)
5. Any flex/grid layout that could cause horizontal scroll on mobile
6. Any icon-only button missing a sr-only accessible label

For each issue found:
- File path and line number
- Current code snippet
- Proposed fix using Tailwind responsive classes

After audit, fix all Minor/Cosmetic responsive issues directly.
Run `tsc --noEmit` to confirm zero errors after fixes.
Deploy with `npx vercel --prod --force`.
```

---

## PROMPT UI-001 — Fix: Profile Picture Not Showing After Google OAuth

```
Bug UI-001: After logging in with Google OAuth, the user's profile picture is not displayed in the nav header. The Avatar component shows initials or a blank state instead of the Google profile photo.

Reference: ERB-UI-UX-STANDARDS.md Section 3 (Profile/Avatar Standards) and Section 4 (Authentication Flow)

Fix requirements:
1. Confirm the Google OAuth callback handler is extracting the `picture` field from the Google profile object
2. Confirm `picture` URL is being stored in the `users` table — check Drizzle schema for `profile_image_url` or equivalent column
3. If the column doesn't exist, add it via Drizzle migration: `profile_image_url: text('profile_image_url')`
4. Confirm the user record is being updated on every OAuth login (upsert the picture URL)
5. Confirm the nav header Avatar component reads from the DB user record (not just session/JWT)
6. Use shadcn <Avatar> component with:
   - <AvatarImage src={user.profileImageUrl} alt={user.name} />
   - <AvatarFallback>{user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}</AvatarFallback>
7. Test: log in as a Google OAuth user, confirm profile photo appears in nav header within 1 second of login

Run `tsc --noEmit` before and after.
Run `npx vercel --prod --force` after fix is confirmed.
```

---

## PROMPT UI-002 — Fix: Button Text Alignment on Different Screen Sizes

```
Bug UI-002: Button text alignment is inconsistent or broken across different screen sizes.

Reference: ERB-UI-UX-STANDARDS.md Section 3 (Button Standards) and Section 3 (Responsive Breakpoints)

Fix requirements:
1. Search for all <Button> components across client/src/ with:
   grep -rn "<Button" client/src/ --include="*.tsx"
2. For each button, verify:
   - Text is horizontally and vertically centered (shadcn Button handles this by default — check for overrides)
   - No inline styles overriding alignment
   - No conflicting justify-* or items-* Tailwind classes
   - Icon + text buttons use: flex items-center gap-2
   - Full-width mobile buttons use: w-full md:w-auto
3. Check for any custom CSS in index.css or component-level styles that overrides button alignment
4. Fix all instances using Tailwind utility classes only — no inline styles
5. Specifically test at 375px, 768px, and 1280px viewport widths after fix

Run `tsc --noEmit` before and after.
Run `npx vercel --prod --force` after fix is confirmed.
```

---

## PROMPT UI-003 — Fix: Google Places Not Autosuggesting Correct Business

```
Bug UI-003: When editing a business name profile field, Google Places Autocomplete is not returning the expected business suggestions.

Reference: ERB-UI-UX-STANDARDS.md Section 4 (Google Places Autocomplete)

Fix requirements:
1. Find the business name autocomplete component in client/src/
   grep -rn "Places\|autocomplete\|google.maps" client/src/ --include="*.tsx" --include="*.ts"
2. Verify the autocomplete is configured with:
   - types: ['establishment']  ← for business name lookups (NOT 'geocode' or 'address')
   - fields: ['place_id', 'name', 'formatted_address', 'geometry']
   - No country restriction unless intentional
3. Verify the GOOGLE_MAPS_API_KEY env var is being passed correctly to the frontend:
   - Backend: check that the key is exposed via an API endpoint (never hardcode in frontend bundle)
   - Or: VITE_GOOGLE_MAPS_API_KEY in .env for client-side use (confirm this is acceptable given key restrictions)
4. Verify the autocomplete input is debounced (≥ 300ms) before firing the Places request
5. Verify the selected place's `name` field (not `formatted_address`) is populated in the form input after selection
6. Add graceful fallback: if Places API fails or returns no results, allow free-text entry with a visible "(manual entry)" note
7. Test with a real business name (e.g. "Starbucks Chicago") — confirm suggestions appear within 1–2 seconds

Run `tsc --noEmit` before and after.
Run `npx vercel --prod --force` after fix is confirmed.
```

---

## PROMPT 3 — Standards Sync (Run After Every Sprint)

```
Update the ERB UI/UX Standards document and memory files to reflect completed work.

1. Read ERB-UI-UX-STANDARDS.md Section 7 (Issue Log)
2. Mark any fixed issues as ✅ Fixed with the date
3. Add any new issues discovered during this sprint
4. Update ~/.openclaw/workspace/MEMORY.md with:
   - Any new UI/UX patterns established
   - Any new component patterns added
5. Update ~/Projects/mission-control/web/public/mc-state.md with:
   - Updated issue log status
   - Lighthouse score if a full audit was run
6. Confirm ERB-UI-UX-STANDARDS.md is committed to the repo:
   git add ERB-UI-UX-STANDARDS.md
   git commit -m "docs: update UI/UX standards issue log after sprint"
   npx vercel --prod --force
```

---

## PROMPT 4 — Accessibility Quick Audit

```
Run a focused accessibility audit on the ERB app.

Reference: ERB-UI-UX-STANDARDS.md Section 2 (WCAG 2.1 AA Checklist)

Check:
1. All <img> tags have meaningful alt attributes
   grep -rn "<img" client/src/ --include="*.tsx"
2. All form inputs have associated <label> elements or aria-label
   grep -rn "<Input\|<input" client/src/ --include="*.tsx"
3. All icon-only buttons have sr-only labels or aria-label
4. Color contrast: flag any text-gray-300 or text-gray-400 on white backgrounds (likely fails 4.5:1)
5. Focus indicators: confirm no `outline-none` classes without a custom focus style replacement
   grep -rn "outline-none" client/src/ --include="*.tsx"
6. ARIA: confirm any custom modal/dialog uses <Dialog> from shadcn (handles ARIA automatically)

Report issues by WCAG criterion.
Fix all Level A violations immediately.
Flag Level AA violations for next sprint.
```

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-03-16 | Initial document created | Claude (Cowork) |
