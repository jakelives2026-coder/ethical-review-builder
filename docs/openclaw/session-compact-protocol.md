# Session Compact Protocol

## Why This Exists
Claude's context window has a limit. When a session runs long, context gets compacted — earlier conversation is summarized and detail is lost. Without a recovery protocol, the next session starts blind, repeating mistakes, losing progress, and wasting time.

This protocol ensures every session starts with full operational awareness, regardless of what was compacted.

---

## On Session Start (Every Time)

### Step 1 — Read Core Memory
```
~/.openclaw/workspace/MEMORY.md
```
Non-negotiable. Contains mission, active projects, agent rules, operational decisions.

### Step 2 — Read Current State
```
~/Projects/mission-control/web/public/mc-state.md
```
Contains last known task statuses, what was in progress, what's blocked.

### Step 3 — Check Active Todo List
Review any in-progress or pending items from the previous session's todo list.

### Step 4 — State Your Awareness
Before doing any work, briefly confirm:
- Active model and subscription (Claude Max = no API cost impact)
- Last known project status
- What was in progress when context was lost
- Any blockers that were unresolved

---

## After Context Was Compacted

If you know context was compacted (session summary was loaded), also do:

### Check the Session Summary
The summary loaded at the top of the conversation contains the last known state. Read it carefully — it includes files modified, errors encountered, commands run, and pending work.

### Check the JSONL Transcript (if detail is missing)
Full transcript lives at:
```
/sessions/[session-id]/mnt/.claude/projects/[project-path]/[session-id].jsonl
```
Use this to recover exact code changes, error messages, or commands from before the compact.

### Resume From Where We Left Off
- Do NOT restart work that was already done
- Do NOT repeat fixes that were already applied
- Do NOT re-ask questions that were already answered
- State what you're picking up and why

---

## On Session End (Every Time)

### Update mc-state.md
Record what was completed, what's in progress, what's blocked. This is the primary handoff document.

### Update MEMORY.md
Add any new patterns, decisions, or rules discovered this session.

### Run Session Review Workflow
See: Session Review Workflow doc in Mission Control /context

---

## Agent Specialization Rule
Different agents own different domains. Before starting work, confirm which agent role applies:

| Agent | Scope |
|---|---|
| Coding Agent | App source code, features, bug fixes |
| Vercel Agent | vercel.json, .vercelignore, env vars, deployments |
| UX Agent | Browser testing, audit reports (read-only) |
| Debugging Agent | Isolated single-issue fix, owns the loop start to finish |

Never mix agent concerns. If you find yourself touching files outside your domain, stop and hand off.

---

## The Mission Filter
Before every task ask: **Does this help Hello Support serve clients, or attract new clients?**
If no → deprioritize.
If yes → proceed.

Agents do it. Not Jason.
