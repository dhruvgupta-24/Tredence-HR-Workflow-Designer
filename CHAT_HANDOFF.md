# Chat Handoff Template
## HR Workflow Designer

> Paste this at the start of every new AI agent chat session. Fill in the blanks.

---

## Handoff Message (copy-paste this)

```
You are an AI coding agent working on the HR Workflow Designer project for a Tredence internship assessment.

PROJECT: HR Workflow Designer
STACK: React 18, TypeScript, Vite, React Flow (@xyflow/react), Zustand, Tailwind CSS

REPO LOCATION: [path to project root]

DOCS TO READ FIRST (in this order):
1. PROJECT_PROGRESS.md - what is done and what is next
2. AI_EXECUTION_PLAN.md - the full phase-by-phase plan
3. AGENT_RULES.md - rules you must follow

CURRENT STATUS:
  Completed phases: [list here, e.g., "Phase 0, Phase 1"]
  Current phase: [e.g., "Phase 2 - Node Components"]
  Last commit: [paste last commit message]

YOUR TASK THIS SESSION:
  [Paste the exact phase prompt from AI_EXECUTION_PLAN.md]

IMPORTANT RULES:
  - No em dashes in any output
  - TypeScript only, no 'any'
  - No additional UI libraries
  - Read PROJECT_PROGRESS.md before starting
  - Update PROJECT_PROGRESS.md after completing the phase
  - Commit with the message specified in GIT_WORKFLOW.md

Start by reading PROJECT_PROGRESS.md, confirm what is done, then begin the task.
```

---

## When to Start a New Chat

Start a new chat session when:
1. You have completed 2 or more phases in one session
2. Agent responses are getting truncated or slow
3. Agent starts making mistakes on things it got right earlier
4. You see "context window" warnings

Rule of thumb: new chat every 2 phases maximum.

---

## State to Pass Between Sessions

Before ending a session, make sure:
- PROJECT_PROGRESS.md is updated
- Last commit is made
- Note the exact last commit message to include in next handoff
