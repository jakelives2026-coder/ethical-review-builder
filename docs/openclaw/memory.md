# MEMORY.md

## Identity
- Project: Mission Control
- Stack: Next.js, Prisma, SQLite, Tailwind
- Owner: Jason

## Preferences
- Commit style: conventional commits (feat/fix/style/refactor)
- Code style: TypeScript strict, 2-space indent
- UI: CSS token classes (bg-c-panel, text-c-1, border-c, bg-c-accent)
- Always read files before editing

## Key Paths
| Path | Purpose |
|---|---|
| web/src/app/ | Next.js app router pages |
| web/src/components/ | Shared UI components |
| web/prisma/ | Schema + migrations |
| web/src/app/api/ | Route handlers |

## Stable Patterns
- Dynamic route params are Promises in Next.js 15 — always await
- Auto-seed DB on first load if table is empty
- Cat filter tabs show per-category doc counts
