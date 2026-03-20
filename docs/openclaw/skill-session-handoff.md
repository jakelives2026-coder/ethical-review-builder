---
name: session-handoff
description: Protocol for starting new Claude Code sessions and ensuring context handoff alignment. Jake runs this automatically at session start to confirm active model rules, budget status, pending work, and advisor alignment. Triggers on every new session.
---

# Session Handoff & Advisor Alignment Protocol

## Purpose

Ensure every new Claude Code session starts with confirmed context: active model rules, budget constraints, Jason preferences, and pending tasks from prior work. Prevent external advisor recommendations from conflicting with established MEMORY.md rules.

---

## Rule 1: Confirm Active Model & Rules at Session Start

At the start of every new Claude Code session, Jake must:

1. Read MEMORY.md completely
2. Summarize for Jason:
   - Active model rule (currently: Haiku for all app-level API calls)
   - Current API balance status ($9.24 Anthropic balance as of 2026-03-14 — separate from OpenAI ERB budget)
   - Standing Jason preferences (autonomy, cost optimization, agent-centric)
   - Any pending tasks from last session

3. State clearly: **"Using [model] because [reason from MEMORY.md]"**
   - Example: "Using Haiku because MEMORY.md rule: app-level API calls must minimize cost ($9.24 budget)"

---

## Rule 2: Cross-Reference External Advisors Against MEMORY.md

Before accepting ANY model recommendation from external sources (Cowork, chat, advisors, etc.):

1. Check MEMORY.md for existing rule on that topic
2. If MEMORY.md has a rule → follow MEMORY.md (always wins)
3. If MEMORY.md has no rule → accept advisor recommendation only with Jason's explicit confirmation

**MEMORY.md always takes precedence over external advice.**

---

## Rule 3: Flag Conflicts Immediately

If an advisor recommendation conflicts with MEMORY.md:

1. **Do not implement the recommendation**
2. Flag immediately to Jason:
3. Wait for Jason's decision before proceeding

---

## Rule 4: Context Compaction Warning Protocol

When Jake detects the session is approaching context limit:

1. **Proactively alert Jason:** Session context ~80% full. Recommend sync before compaction.
2. **Offer to sync three layers:** MEMORY.md, mc-state.md, Mission Control dashboard
3. Complete sync BEFORE context compaction hits
4. Resume with fresh context after sync

---

## Rule 5: New Session Checklist (Run Automatically)

- Read MEMORY.md, confirm active model rule
- Confirm API balance status
- Check mc-state.md for app status
- Report pending tasks from last session
- State final readiness

---

## Rule 6: No External Override Without Jason's Word

Protected rules (cannot be overridden):
- Active model: Haiku for app-level Anthropic API calls
- Anthropic API balance: $9.24 finite (Telegram/gateway only, NOT ERB)
- OpenAI ERB budget: org spending cap raised to $50/month
- Agent autonomy priority (agents do it, not Jason)
- MEMORY.md always wins

---

