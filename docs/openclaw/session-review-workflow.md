# Session Review Workflow

## Session Review Checklist

### After every session:
- [ ] What changed? Update the relevant markdown file in Mission Control
- [ ] New preference or pattern discovered? Add to MEMORY.md
- [ ] Any workflow that was slow or broke? Note fix in Workflows
- [ ] Write 3-line daily note: done / learned / next

### Token hygiene:
- [ ] Are any files over 500 tokens that could be trimmed?
- [ ] Are pinned files still the right ones?
- [ ] Delete or archive anything no longer relevant

### Self-improvement signal:
- [ ] Did anything take more than 2 back-and-forths to resolve? → If yes, write a clearer instruction into the relevant file

---

## Debugging Protocol (Terminal-First)

**Rule: Never use screen takeover / browser automation to verify complex bug fixes. Use terminal verification first.**

### For any complex bug fix:
1. Apply fix via terminal prompt (Claude Code)
2. Run `tsc --noEmit` — must return zero errors before proceeding
3. Run targeted `grep` commands to confirm key lines are present in the correct files
4. Only proceed to minimal browser spot-check after terminal confirms 100%

### Why: Screen takeover is slower and less reliable for verifying code-level changes. Terminal verification catches errors immediately without deployment lag.

### Vercel force deploy rule (ERB and Node/Express apps):
After any non-frontend-only commit, Vercel build cache may stale-bundle `api/index.js`, causing 405 errors on POST routes. Always run:
```
npx vercel --prod --force
```
This forces a clean rebuild. Required after every backend or shared code change.
