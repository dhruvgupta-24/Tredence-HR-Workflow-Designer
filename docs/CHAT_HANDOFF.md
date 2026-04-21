# Chat Handoff
## HR Workflow Designer

> Paste this file as the FIRST message in every new agent chat session.
> Fill in the bracketed fields from docs/PROJECT_PROGRESS.md before sending.
> Do not skip this step - the agent needs this context to resume correctly.

---

## Live Project State

Update these fields from docs/PROJECT_PROGRESS.md before pasting:

| Field | Value (fill from docs/PROJECT_PROGRESS.md) |
|---|---|
| Completed Prompts | [e.g. 01, 02, 03] |
| Current Phase | [e.g. P2 - Canvas + Sidebar] |
| Next Prompt | [e.g. Prompt 04 - App Layout Shell] |
| Last Commit | [paste last commit message] |
| Last Commit Hash | [paste short hash, e.g. a1b2c3d] |
| Active Blocker | [None, or describe it] |

---

## Copy-Paste Handoff Message

```
You are an AI coding agent resuming work on the HR Workflow Designer project for a Tredence internship assessment.

PROJECT: HR Workflow Designer
STACK: React 18, TypeScript, Vite, @xyflow/react (v12), Zustand, Tailwind CSS 3
REPO: c:\Users\Dhruv\Desktop\Tredence-HR-Workflow-Designer

COMPLETED PROMPTS: [fill from table above]
CURRENT PHASE: [fill from table above]
LAST COMMIT: [fill from table above]

YOUR TASK THIS SESSION:
[Paste the exact prompt block from docs/AI_EXECUTION_PLAN.md for the next prompt number]

DOCUMENTS TO READ FIRST (in this order):
1. docs/PROJECT_PROGRESS.md - verify what is done and what is next
2. docs/AGENT_RULES.md - non-negotiable rules you must follow
3. The relevant section of docs/AI_EXECUTION_PLAN.md for context

NON-NEGOTIABLE RULES (summary - read docs/AGENT_RULES.md for full list):
- No em dashes anywhere (not in code, comments, strings, or docs)
- TypeScript only. No 'any' unless unavoidable with a comment explaining why.
- No console.log left in code
- No additional UI libraries. Tailwind + custom components only.
- Commit after every prompt, not after every file.
- Update docs/PROJECT_PROGRESS.md after completing the prompt.
- No em dashes.

ACTIVE BLOCKER: [None, or paste the blocker description]

Start by reading docs/PROJECT_PROGRESS.md to confirm what is done. Then execute the task above exactly as written.
```

---

## When to Start a New Chat

Start a new chat session when any of these are true:
- You have completed 2+ prompts in one session
- Agent responses are getting truncated or feel slow
- Agent starts contradicting previous decisions
- Agent starts rewriting things it built correctly earlier
- You see any context window warning

Fresh chat checkpoints are also marked in docs/AI_EXECUTION_PLAN.md with: [FRESH CHAT RECOMMENDED]

Rule of thumb: new chat every 2 prompts maximum during heavy coding phases (P2 through P10).

---

## Before Ending a Chat Session

Checklist before closing a chat:
- [ ] docs/PROJECT_PROGRESS.md is updated with the completed prompt number
- [ ] Commit is made with the correct message from docs/AI_EXECUTION_PLAN.md
- [ ] Commit hash is noted
- [ ] Any blockers or manual steps are noted in docs/PROJECT_PROGRESS.md
- [ ] You know exactly which prompt number comes next

---

## Project Status: IN PROGRESS (Prompts 01 + 02 complete)

Update this status line after each phase completes:
- NOT STARTED
- IN PROGRESS (Current: Phase P__, Prompt __)
- COMPLETE (All 22 prompts done, submission ready)
