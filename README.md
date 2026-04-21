# HR Workflow Designer

> Visual drag-and-drop HR workflow automation builder built for Tredence Full Stack Engineering Intern assessment.

---

## Status

**In Progress** | Phase 0 complete - core scaffold and folder structure done

---

## Project Docs

All planning and architecture docs live in `/docs`:

| Doc | Purpose |
|---|---|
| [PROJECT_PROGRESS.md](docs/PROJECT_PROGRESS.md) | Current phase, completed prompts, blockers |
| [AI_EXECUTION_PLAN.md](docs/AI_EXECUTION_PLAN.md) | Full sequential build prompt checklist |
| [AGENT_RULES.md](docs/AGENT_RULES.md) | Code style and agent behavior rules |
| [CHAT_HANDOFF.md](docs/CHAT_HANDOFF.md) | Handoff template for new agent sessions |
| [PRD.md](docs/PRD.md) | Product requirements |
| [SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md) | Architecture, data flow, validation rules |
| [TECH_ARCHITECTURE.md](docs/TECH_ARCHITECTURE.md) | Stack, folder structure, component specs |

---

## What's Built

- [ ] Project scaffold (Vite + React + TS + Tailwind + React Flow + Zustand)
- [ ] Sidebar toolbox with draggable node types
- [ ] Canvas with drag-drop, connect, delete
- [ ] Start Node with metadata key-value pairs
- [ ] Task Node with assignee, due date, custom fields
- [ ] Approval Node with role and threshold
- [ ] Automated Step Node with dynamic API-driven forms
- [ ] End Node with summary toggle
- [ ] Node edit panel (right drawer)
- [ ] Mock API layer (/automations, /simulate)
- [ ] Workflow sandbox / run panel
- [ ] Graph validation
- [ ] Export / Import JSON (bonus)
- [ ] Undo / Redo (bonus)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Graph | @xyflow/react v12 (React Flow) |
| State | Zustand |
| Styling | Tailwind CSS 3 |
| Mock API | Local JSON + async fetch wrappers |
| Optional | Supabase MCP (available for persistence or auth if scope expands) |

---

## Setup

```bash
git clone <repo-url>
cd hr-workflow-designer
npm install
npm run dev
```

Open: `http://localhost:5173`

---

## Folder Structure

```
src/
  api/           # Mock API fetch wrappers
  components/
    canvas/      # ReactFlow canvas wrapper
    nodes/       # Custom node components
    forms/       # Node edit forms
    sidebar/     # Toolbox + draggable items
    sandbox/     # Run workflow panel
    ui/          # Shared UI primitives
  hooks/         # Custom React hooks
  store/         # Zustand stores
  types/         # TypeScript interfaces
  utils/         # Validation + serialization helpers
  pages/         # Top-level page components
```

---

## Screenshots

> Add screenshots here after first working build.

---

## UI Design Reference

The Tredence PDF includes a reference UI (CodeAuto / n8n style) with:
- Left sidebar navigation with node toolbox
- Center canvas with grid background and connected nodes
- Right panel for node details and performance metrics

This app follows the same 3-column layout adapted for the HR workflow context.

---

## Design Decisions

- React Flow chosen for mature graph API and custom node support
- Zustand over Redux for minimal boilerplate with good TS support
- Mock API kept in `src/api/` as plain async functions returning typed data
- Dynamic forms in Automated Step node driven by API response shape
- Validation runs on demand (before simulate) and on edge connect

---

## What I Would Add With More Time

- Backend integration (Node.js + Express)
- User auth layer
- Workflow templates library
- Real email/PDF action simulation
- Drag-reorder of steps in execution log
- Dark mode

---

## Author

Built for Tredence Full Stack Engineering Internship Assessment.
