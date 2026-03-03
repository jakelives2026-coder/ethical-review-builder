# Design Guidelines: Ethical Review Builder SaaS

## Design Approach

**Selected System**: Shadcn/ui with Linear-inspired professional SaaS aesthetic
**Justification**: Wizard flows require clarity, hierarchy, and user confidence. Linear's clean typography and minimal interface combined with shadcn/ui's accessible components creates the ideal foundation for a step-by-step experience.

## Core Design Elements

### A. Typography
- **Primary Font**: Inter (Google Fonts)
- **Hierarchy**:
  - Step titles: text-2xl md:text-3xl, font-semibold
  - Step descriptions: text-base text-muted-foreground
  - Card labels: text-sm font-medium
  - Button text: text-sm font-medium
  - Helper text: text-xs text-muted-foreground

### B. Layout System
**Spacing Primitives**: Use Tailwind units of 3, 4, 6, 8, 12
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-3 to gap-4
- Container max-width: max-w-2xl for wizard steps

**Mobile-First Breakpoints**:
- Mobile: Single column, full-width cards
- Tablet (md:): 2-column selection grids where appropriate
- Desktop (lg:): Centered container with breathing room

### C. Component Library

**Wizard Container**:
- Fixed header with progress indicator (step N of M)
- Centered content area (max-w-2xl)
- Sticky footer with navigation buttons
- Background: Subtle gradient or solid neutral

**Progress Indicator**:
- Linear step dots with connecting lines
- Current step: filled, larger
- Completed: checkmark icon
- Upcoming: outlined, smaller
- Position: Top of wizard, below header

**Selection Cards**:
- Border-2 with hover state
- Active/selected state with accent border + subtle background tint
- Padding: p-6
- Icon/illustration at top (80px height)
- Title: font-semibold, text-lg
- Description: text-sm, text-muted-foreground
- Checkmark indicator when selected (top-right corner)
- Grid layout: grid-cols-1 md:grid-cols-2 gap-4

**Question Interface**:
- Question text: Prominent, text-xl font-semibold
- Supporting text: text-muted-foreground below question
- Input fields: Full-width text areas with 4-6 rows
- Character counter: Bottom-right, text-xs
- Star rating component for satisfaction questions

**Generated Review Preview**:
- Card with distinct background (subtle tint)
- Review text: text-base, leading-relaxed
- Edit button (pencil icon) in top-right
- Rating display with filled stars
- Copy to clipboard button at bottom

**Navigation Buttons**:
- Primary CTA: Full width on mobile, auto width on desktop
- Secondary/Back: Outlined variant
- Button group at bottom: justify-between layout
- Loading states with spinner

**App Header**:
- Logo/brand on left
- Progress indicator centered
- Save draft button (ghost variant) on right
- Border-b separator
- Padding: px-4 py-3

### D. Animations
**Minimal, Purposeful Motion**:
- Step transitions: Slide fade (300ms ease-out)
- Card selection: Scale and border color (150ms)
- Button interactions: Standard shadcn/ui states
- Progress indicator: Smooth fill animation (400ms)
- Success state: Gentle scale pulse (single iteration)

## App-Specific Features

**Dashboard (Post-Review)**:
- Header with app name and user menu
- Recent reviews list with cards showing:
  - Business name
  - Date created
  - Star rating
  - Review snippet (truncated)
  - Edit/Delete actions
- Empty state with illustration and CTA
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

**Relationship Type Selection** (Step 1):
- 6-8 card options in grid
- Icons representing each type (customer, employee, partner, etc.)
- Clear, distinct categories

**Question Forms** (Steps 2-3):
- One question per screen for focus
- Text areas with helpful placeholders
- Optional skip button for non-required fields

**Final Review Screen**:
- Large preview card
- Platform selection (Google, other future platforms)
- Terms/ethics disclaimer
- Prominent "Generate Review" button

## Images

**No hero images** - This is a utility app, not marketing.

**Supporting Illustrations**:
- Empty state illustration: Friendly, minimal line art (200x200px)
- Success state illustration: Celebration/checkmark graphic (150x150px)
- Card icons: Simple, monochromatic icons (48x48px) from Lucide or Heroicons

**Placement**:
- Empty states: Center of container
- Success confirmation: Center above review preview
- Card selection: Top-center of each card

---

**Critical Implementation Notes**:
- All interactive elements must have clear focus states
- Maintain consistent 8-12px spacing rhythm
- Use shadcn/ui's native components (Button, Card, Textarea, RadioGroup)
- Test wizard flow on 320px mobile viewport
- Implement form validation with inline error messages
- Add keyboard navigation support for wizard steps