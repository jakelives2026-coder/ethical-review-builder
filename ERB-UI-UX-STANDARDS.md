# ERB UI/UX Standards & Best Practices
**Ethical Review Builder — Living Standards Document**
Last updated: 2026-03-16

---

## Purpose

This document defines the UI/UX standards that govern all development on the ERB app. Every bug sprint, feature build, and code review should reference these standards. Claude Code must read this file at the start of any UI/UX-related task.

These standards are grounded in three authoritative sources:
- [Nielsen Norman Group — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [WCAG 2.1 AA — Web Content Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [shadcn/ui + Tailwind best practices](https://ui.shadcn.com/) / [Vercel Academy](https://vercel.com/academy/shadcn-ui)

---

## Section 1 — Nielsen's 10 Heuristics Applied to ERB

Each heuristic is mapped to concrete ERB-specific implementation rules.

### H1 — Visibility of System Status
- Every async action (form submit, save, API call) must show a loading state: spinner, skeleton, or disabled button with label change (e.g. "Saving…")
- Toast notifications required for: save success, save failure, email sent, auth state change
- Progress indicators on multi-step wizards must reflect actual current step
- File/image upload must show progress or confirmation

### H2 — Match Between System and the Real World
- Labels and button text use plain business language ("Save changes", not "Commit entity state")
- Error messages describe what went wrong in plain English, not HTTP codes or stack traces
- Form field names match what a business owner would naturally expect
- Dates, currencies, and addresses use locale-appropriate formatting

### H3 — User Control and Freedom
- Every destructive action (delete, leave page with unsaved changes) requires confirmation
- Multi-step wizard must allow backwards navigation without losing data
- Users can cancel any in-progress operation
- Logout is always accessible from profile menu

### H4 — Consistency and Standards
- All primary CTAs use the same button variant and placement (bottom-right of forms, or full-width on mobile)
- Icon usage is consistent: same icon = same action everywhere in the app
- Color usage: blue = primary action, red = destructive, green = success, amber = warning
- Heading hierarchy is consistent: page title h1, section titles h2, card titles h3
- shadcn/ui component variants are never overridden inline — use defined variants only

### H5 — Error Prevention
- All forms use real-time validation (not just on submit)
- Email inputs validate format before submit
- Required fields are clearly marked
- Autocomplete fields (Google Places) should not allow free-text submission of unverified business names
- Duplicate entry prevention: check for existing records before creating new ones

### H6 — Recognition Rather Than Recall
- User's profile picture always visible in nav header after login (no blank avatar)
- Dashboard surfaces the user's current plan, usage, and next action without navigation
- Wizard steps show a visible summary of prior steps
- Search/autocomplete results appear inline — no separate search results page

### H7 — Flexibility and Efficiency of Use
- Keyboard navigation fully supported on all forms and modals
- Autocomplete on address/business name fields reduces typing
- "Save and continue" vs "Save" options on long forms
- Power users can access settings directly from the dashboard without wizard re-entry

### H8 — Aesthetic and Minimalist Design
- No redundant text — every word on screen must earn its place
- Cards should not exceed 3 levels of nesting
- Mobile: max 2 actions visible above the fold per screen
- Empty states must be designed (no blank white boxes)
- Modals should contain only what is necessary for the single decision at hand

### H9 — Help Users Recognize, Diagnose, and Recover from Errors
- Form validation errors appear inline below the offending field, never only at top of page
- Network/API errors show a user-friendly message with a retry option
- 404/500 pages are branded and offer a clear path back to the app
- Auth errors (token expired, email not verified) redirect with context, not a blank screen

### H10 — Help and Documentation
- Tooltips on all non-obvious form fields
- Onboarding wizard copy must be self-explanatory without requiring external docs
- "Learn more" links open in a new tab, never navigate away from current flow

---

## Section 2 — WCAG 2.1 AA Compliance Checklist

Minimum bar for all ERB UI work. Every new component must pass these.

### Perceivable
- [ ] All images have meaningful alt text (or `alt=""` for decorative images)
- [ ] Color is never the only means of conveying information (always pair with text/icon)
- [ ] Text contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] UI component contrast ratio ≥ 3:1 against adjacent colors
- [ ] No content flashes more than 3 times per second

### Operable
- [ ] All interactive elements are keyboard accessible (Tab, Enter, Space, Arrow keys)
- [ ] Focus indicators are visible on all focusable elements
- [ ] No keyboard traps — user can always Tab out of any component
- [ ] Sufficient time given for timed interactions (or ability to extend)
- [ ] Skip-to-content link available for screen readers

### Understandable
- [ ] Language declared on `<html lang="en">`
- [ ] Form labels programmatically associated with inputs (htmlFor / aria-label)
- [ ] Error messages identify the field, explain the issue, and suggest a fix
- [ ] Consistent navigation: same nav structure on every page

### Robust
- [ ] All custom components use appropriate ARIA roles/labels
- [ ] Interactive elements have accessible names
- [ ] Status messages use `aria-live` regions
- [ ] App functions without JavaScript for critical auth flows (graceful degradation)

---

## Section 3 — shadcn/ui + Tailwind Component Standards

### Component Architecture
```
components/
├── ui/                          # Raw shadcn components — never edited directly
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── tooltip.tsx
│   ├── dialog.tsx
│   ├── google-places-input.tsx  # Google Places autocomplete (business & address)
│   └── ...
├── primitives/                  # Lightly extended shadcn components ✅ CREATED 2026-03-16
│   ├── FormInput.tsx           # Input wrapper with validation error display
│   ├── FormSelect.tsx          # Select wrapper with ERB styling defaults
│   ├── AutocompleteField.tsx   # Consolidates GooglePlaces (business|address)
│   └── index.ts                # Central exports
├── blocks/                      # Product-level compositions
│   ├── ReviewBuilder/
│   │   └── BusinessInfo.tsx    # Uses FormInput, LocationInput
│   ├── BusinessProfiles/
│   │   └── BusinessProfileForm.tsx  # Uses FormInput, FormSelect, AutocompleteField
│   └── EditProfileDialog.tsx        # Uses FormInput
└── ...
```

**Key Rules:**
- Never override shadcn component styles inline with arbitrary Tailwind values
- Define custom design tokens in `tailwind.config.ts` → use via CSS variables
- Prefer Radix primitives for behavior (focus, keyboard, ARIA) — don't reinvent
- All extended components wrap ui/ components with: ERB styling + validation + accessibility
- `FormInput` and `FormSelect` apply: `getMobileInputStyles() + "border-primary/20 focus:border-primary"`
- `AutocompleteField` consolidates two Google Places variants into one component with `type` prop

### Responsive Breakpoints (Tailwind)
| Breakpoint | Prefix | Min Width | Usage |
|------------|--------|-----------|-------|
| Mobile     | (none) | 0px       | Default — mobile first |
| Small      | `sm:`  | 640px     | Large phones, small tablets |
| Medium     | `md:`  | 768px     | Tablets |
| Large      | `lg:`  | 1024px    | Desktops |
| XL         | `xl:`  | 1280px    | Wide screens |

**Rules:**
- Always design mobile-first (default styles = mobile)
- Button text must be readable at all breakpoints — use `text-sm md:text-base` pattern
- Icons in buttons: show text label on md+ screens, icon-only on mobile with `sr-only` label
- Bottom navigation bar on mobile must have equal-width tabs (`w-1/N` pattern)
- Modals on mobile should be full-screen or bottom sheets, not centered overlays

### Button Standards
```tsx
// Primary CTA
<Button className="w-full md:w-auto">Save Changes</Button>

// Destructive
<Button variant="destructive">Delete</Button>

// Icon + text (responsive)
<Button>
  <Icon className="h-4 w-4" />
  <span className="hidden md:inline ml-2">Action Label</span>
  <span className="sr-only">Action Label</span>  {/* for accessibility */}
</Button>
```

### Form Standards
- All form fields wrapped in `<FormItem>` → `<FormLabel>` → `<FormControl>` → `<FormMessage>`
- Never use raw `<input>` without shadcn `<Input>` wrapper
- Autocomplete inputs must use `<Command>` + `<CommandInput>` pattern from shadcn
- Google Places autocomplete: always use `types: ['establishment']` for business name lookups

### Profile / Avatar Standards
- User profile picture sourced from: `user.profileImageUrl` or Google OAuth `picture` field
- Always provide fallback: initials from `user.name` or `user.email[0].toUpperCase()`
- Use `<Avatar>` shadcn component — never raw `<img>` for profile pictures
- Avatar in nav header must be present after any OAuth login (Google, etc.)

---

## Section 4 — ERB-Specific Patterns

### Authentication Flow
- After Google OAuth login: immediately fetch and store `picture`, `name`, `email` from OAuth profile
- Profile image URL stored in `users.profile_image_url` column in DB
- Nav header Avatar must read from DB user record, not session token alone
- Email verification state must be clear from nav (badge or indicator)

### Google Places Autocomplete
- Field type for business name search: `types: ['establishment']`
- Field type for address search: `types: ['address']`
- Always request these fields: `place_id`, `name`, `formatted_address`, `geometry`
- Display name in input after selection — not place_id
- Allow "manual entry" fallback if no Places result satisfies user
- Error state if Places API fails: graceful fallback to plain text input (never block submission)

### Wizard (Multi-Step Form)
- Always scroll to top on step change (`window.scrollTo(0,0)` or `goToStep` with scroll)
- Step indicator persistent at top of wizard
- Validate current step before advancing — inline errors, not alert()
- Draft auto-save every 30s or on field blur (prevent data loss on refresh)
- "Exit wizard" button always visible with confirmation dialog

### Mobile Navigation
- Bottom nav bar: max 5 items, equal width, icons + labels
- Active tab: blue icon + text, inactive: muted gray
- All 5 tabs must be accessible — no tab should be hidden or overflow
- History/activity tab always present in bottom nav

### Dashboard
- Usage meter visible to Free tier users, hidden for Pro/Business
- Plan badge visible in profile area
- Quick actions always above the fold on mobile
- Empty state designed for new users (no blank cards)

---

## Section 5 — Performance Standards

- Lighthouse score targets: Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90
- No layout shift (CLS) on page load — skeleton screens instead of late-loading content
- Images: always specify `width` and `height`, use `loading="lazy"` for below-fold images
- API calls: debounce autocomplete inputs (≥ 300ms delay before firing Places request)
- Bundle: no new dependencies without justification — prefer native browser APIs

---

## Section 6 — QA Checklist (Run Before Every Deploy)

Before every production deploy, verify:

### Functional
- [ ] Login flow works (email + Google OAuth)
- [ ] Profile picture displays after Google login
- [ ] All nav items route correctly
- [ ] Forms validate inline and show errors correctly
- [ ] Wizard completes end-to-end without data loss

### Visual / Responsive
- [ ] Test at 375px (iPhone SE), 768px (tablet), 1280px (desktop)
- [ ] No text overflow or truncation on any screen size
- [ ] Button text aligned and readable at all breakpoints
- [ ] No horizontal scroll on mobile
- [ ] Bottom nav equal-width tabs on mobile

### Accessibility
- [ ] Tab through all interactive elements — no keyboard traps
- [ ] All form fields have visible labels
- [ ] Color contrast passes on all text
- [ ] Profile avatar has alt text / aria-label

### API & Data
- [ ] Google Places autocomplete returns results for real business names
- [ ] Autocomplete debounced (no request on every keystroke)
- [ ] API key restrictions in place (domain + API type)

---

## Section 7 — Issue Log Template

When a new UI/UX issue is identified, log it in this format:

```
**Issue:** [Short description]
**Heuristic violated:** [H1–H10 from Section 1, or WCAG criterion]
**Screen(s) affected:** [Page/component name]
**Severity:** Critical / Major / Minor / Cosmetic
**Reproduction:** [Steps to reproduce]
**Expected:** [What should happen]
**Actual:** [What happens now]
**Fix approach:** [Proposed solution]
```

### Current Open Issues (as of 2026-03-16)
| # | Issue | Heuristic | Severity | Status |
|---|-------|-----------|----------|--------|
| UI-001 | Profile picture not showing after Google OAuth login | H6 (Recognition) | Major | ✅ FIXED (2026-03-16) |
| UI-002 | Button text alignment broken on some screen sizes | H4 (Consistency) | Minor | Open |
| UI-003 | Google Places not autosuggesting correct business name | H5 (Error Prevention) | Major | Open |

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-03-16 | UI-001 Fixed — Google OAuth profile picture now stored and displayed | Claude Code |
| 2026-03-16 | Primitives layer created — FormInput, FormSelect, AutocompleteField | Claude Code |
| 2026-03-16 | Initial document created | Claude (Cowork) |
