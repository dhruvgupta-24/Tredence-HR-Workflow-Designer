# FlowHR

> A premium visual drag-and-drop HR workflow automation builder built for the Tredence Engineering Assessment.

---

## Overview

FlowHR lets HR teams build, configure, and simulate multi-step HR processes using an intuitive node-based canvas. Workflows are built visually, edited via property panels, and tested through an animated step-by-step simulation engine — all in the browser with zero backend dependency.

---

## Live Features

### 🎨 Visual Canvas
- Drag-and-drop workflow builder powered by React Flow v12
- 5 node types: **Start**, **Task**, **Approval Gate**, **Automated Step**, **End**
- Snap-to-grid alignment, animated edges, zoom/pan
- Node-colored minimap for orientation

### ⚡ 3 One-Click Templates
| Template | Nodes | Description |
|---|---|---|
| 👤 Employee Onboarding | 7 | New hire flow with parallel IT and HR tracks |
| 🏖 Leave Approval | 6 | Manager sign-off with HRIS update and Slack notify |
| 👋 Exit Process | 7 | Offboarding with parallel equipment return and settlement |

### 🎬 Animated Simulation
- Click **Run Workflow** to execute a step-by-step BFS simulation
- Each step **highlights the corresponding node** on canvas with a colored glow ring
- Execution log reveals progressively in the sandbox panel
- Validation catches missing nodes, disconnected graphs, and cycles before running

### 🛠 Node Properties
- Click any node to open a type-specific property drawer
- Fields update live on the canvas as you type
- **Task**: Assignee, due date, description, custom fields
- **Approval**: Approver role (Manager/HRBP/Director/CEO), auto-approve threshold
- **Automated**: Action dropdown (send_email, create_ticket, slack_notify, update_hris, generate_report) with dynamic parameter editor

### ↩ Undo / Redo
- 30-step snapshot history
- Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts
- Undo: drag, connect, delete, drop, template load

### 📦 Export / Import
- Export workflows as timestamped `.json` files
- Import from JSON with graph validation
- Canvas auto-fits on import

### 💾 Auto-save
- Workflow autosaves to `localStorage` on every change (debounced 500ms)
- Restored automatically on next visit

### 🔡 Auto-arrange Layout
- Topological BFS layout algorithm (Kahn's)
- Assigns levels and centres nodes vertically per column
- Undoable

### ⌨ Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Delete` / `Backspace` | Delete selected node |
| `Escape` | Deselect / close drawer |
| `?` | Open shortcuts panel |

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast HMR, modern toolchain |
| Language | TypeScript (strict) | Type safety across all layers |
| Canvas | @xyflow/react v12 | Best-in-class flow diagram library |
| State | Zustand | Minimal, performant, no boilerplate |
| Styling | Tailwind CSS v3 + Inter font | Consistent design system |
| Persistence | localStorage | Zero infrastructure dependency |
| Validation | Custom graph engine | BFS + cycle detection |
| Simulation | BFS traversal engine | Correct traversal order, extensible |

---

## Project Structure

```
src/
├── api/           # simulate.ts, automations.ts
├── components/
│   ├── canvas/    # WorkflowCanvas, CanvasControls
│   ├── forms/     # StartNodeForm … EndNodeForm
│   ├── nodes/     # StartNode … EndNode (+ nodeTypes map)
│   ├── sandbox/   # SandboxPanel, ExecutionLog
│   ├── sidebar/   # Sidebar, NodeToolbox, DraggableNode
│   └── ui/        # Button, Input, Select, Badge, Toggle, Drawer, Modal
├── data/          # templates.ts (3 HR workflow templates)
├── hooks/         # useAutomations, useAutosave, useAutoArrange,
│                  # useDragDrop, useSimulate, useUndoRedo
├── pages/         # WorkflowBuilderPage.tsx
├── store/         # workflowStore.ts (Zustand)
├── types/         # workflow.ts, nodes.ts, api.ts
└── utils/         # validation.ts, serialization.ts, idGenerator.ts,
                   # nodeDefaults.ts
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Open http://localhost:5173

# Type check
npx tsc --noEmit

# Production build
npm run build
```

---

## Standout Design Decisions

1. **Zustand `fitViewCounter` pattern** — Canvas fitView is triggered reactively from outside the React Flow provider context without prop drilling.

2. **Snapshot-based undo/redo** — Every mutating action (drag, drop, connect, delete, template load, import) saves a full snapshot. O(1) undo, configurable history depth (30 steps).

3. **Animated simulation via progressive log reveal** — Instead of dumping all steps, each step reveals with a 650ms gap and highlights the corresponding node — making execution feel real.

4. **Kahn's topological BFS for auto-arrange** — Correctly handles DAGs including branches and merges (not just linear chains).

5. **Efficient Zustand selectors for node highlighting** — Each node component uses `s.highlightedNodeId === id` as selector. Only 2 nodes re-render per simulation step (old → new), not all nodes.

---

## Documentation

- [`docs/PROJECT_PROGRESS.md`](docs/PROJECT_PROGRESS.md) — Phase-by-phase progress log
- [`docs/AI_EXECUTION_PLAN.md`](docs/AI_EXECUTION_PLAN.md) — Original phased execution plan
- [`docs/AGENT_RULES.md`](docs/AGENT_RULES.md) — Development execution rules

---

*Built by Dhruv Gupta · Tredence Engineering Assessment · April 2026*
