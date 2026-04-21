<div align="center">
  <img src="public/flowhr-navbar.png" alt="FlowHR Logo" width="80" />
  <h1>FlowHR — Workflow Designer</h1>
  <p><strong>Design, simulate, and automate HR workflows visually. No code required.</strong></p>

  <p>
    <a href="https://tredence-hr-workflow-designer.vercel.app" target="_blank">
      <img alt="Live Demo" src="https://img.shields.io/badge/Live%20Demo-Open%20App-6366f1?style=for-the-badge&logo=vercel" />
    </a>
    &nbsp;
    <a href="https://github.com/dhruvgupta-24/Tredence-HR-Workflow-Designer" target="_blank">
      <img alt="GitHub" src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" />
    </a>
    &nbsp;
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-100%25-3178c6?style=for-the-badge&logo=typescript" />
    &nbsp;
    <img alt="Build" src="https://img.shields.io/badge/Build-Passing-22c55e?style=for-the-badge" />
  </p>
</div>

---

## The Problem

HR teams waste hours every week on processes that should run themselves.

Onboarding a new joiner means chasing 6 different people for approvals. Leave requests sit in inboxes. Performance reviews go missing. Offboarding creates compliance gaps.

Most workflow tools are either too technical (code-heavy) or too rigid (no customization). Teams fall back to spreadsheets, email chains, and Slack reminders.

**FlowHR changes that.** It gives HR teams a visual canvas to design their exact process, simulate it before going live, and understand it at a glance — without writing a single line of code.

---

## Key Features

### 🎨 Visual Drag-and-Drop Builder
Build multi-step workflows using an intuitive node-based canvas powered by React Flow. Drag Start, Task, Approval, Automated, and End nodes from the sidebar panel. Connect them by dragging handles between nodes. Rearrange freely with smooth animations and spring physics.

### ✦ AI Copilot — Workflow Generation
Open the Copilot with one click and describe what you need in plain English. Choose from pre-trained flows like *Employee Onboarding*, *Leave Approval*, *Performance Review*, *Exit Clearance*, and *Project Kickoff*. The Copilot generates a fully connected, validated workflow graph in seconds — complete with properly typed node data, edges, and metadata.

### ▶ Live Demo Mode
A cinematic 22-second autoplay that builds an entire workflow from scratch in front of you. A scripted cursor visits the sidebar, drags each node type to the canvas, connects them, edits a node title with a typewriter effect, and runs the simulation — all timed to look like a real person using the product. Zero interaction required.

### ◎ Guided Tutorial Mode
A 6-step interactive tutorial that teaches users how to build a valid workflow (Start → Task → End) by themselves. Each step shows a spotlight glow ring around the target UI element, a looping ghost cursor demonstrating the expected action, a clear instruction card, and a live progress bar. The system detects completion automatically by watching the Zustand store — no polling, no fake timers.

### ⚡ Simulation Engine
Click Run Workflow and watch your graph execute. The engine validates the workflow structure first (checks for Start/End nodes, connectivity, orphan detection), then walks the graph depth-first, animating each node with a glow pulse. Active nodes glow indigo; completed nodes turn green with a checkmark. The execution log updates in real time in the right panel.

### 📊 Real-Time Analytics Bar
A persistent banner at the bottom of the canvas shows live metrics: total nodes, connected edges, estimated completion time, workflow health score, and pending approvals — all computed reactively from the graph state on every change. Built entirely from client-side graph analysis.

### ⌨️ Command Palette (Ctrl+K)
A VS Code-style command palette with fuzzy search. Run Simulation, Open Copilot, Auto-arrange layout, Open Keyboard Shortcuts, and more — all accessible from the keyboard. The centered "Search commands..." bar in the toolbar makes it immediately discoverable.

### ★ Workflow Optimizer
One-click layout and graph cleanup. Removes isolated (unreachable) nodes, deduplicates parallel edges, and triggers auto-arrange using a Dagre-based hierarchical layout algorithm. Shows a toast with exactly how many nodes were removed.

### 📁 Import / Export JSON
Export your full workflow as a structured JSON file. Import any previously saved workflow back with one click — validated on load, with error toasts for malformed data. Works across sessions and makes sharing workflows trivial.

### 💾 Autosave
Workflow state is automatically persisted to `localStorage` via Zustand's persist middleware. Users return to exactly where they left off — no explicit save button needed.

### ⌨️ Keyboard Shortcuts
Full keyboard navigation: `Ctrl+Z` / `Ctrl+Shift+Z` for undo/redo, `Ctrl+K` for the command palette, `?` for the shortcuts modal, `Del`/`Backspace` to delete selected nodes, `Esc` to deselect. All shortcuts work globally and are non-destructive.

### 📋 Templates
Four professionally designed workflow templates ship out of the box: Employee Onboarding, Leave Approval, Performance Review, and Exit Clearance. Each template is a fully connected, validated graph ready to simulate immediately.

### ✅ Validation System
Before simulation runs, the engine validates: Has a Start node? Has an End node? Are all nodes reachable from Start? Are there orphan nodes not connected to any path? Errors surface as clear, dismissible banners — never silent failures.

### 🎨 Premium Dark UI
Built ground-up with Tailwind CSS in a dark-mode-first design system. Glassmorphism cards, indigo accent palette, smooth micro-animations on every hover and transition, custom Google Font typography, and a toolbar that looks like a real SaaS product. Passes basic a11y requirements with semantic HTML and ARIA labels.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | React 18 | Component-based UI, excellent ecosystem, concurrent mode |
| Language | TypeScript | Type safety eliminates entire classes of runtime bugs |
| Build Tool | Vite 5 | Sub-second HMR during development, optimized production bundles |
| Styling | Tailwind CSS | Utility-first, no CSS file chaos, consistent design tokens |
| Graph Engine | React Flow (@xyflow/react) | Production-grade node/edge canvas with built-in handles and zoom |
| State Management | Zustand | Minimal boilerplate, computed selectors, localStorage persist |
| Layout Algorithm | Dagre | Directed acyclic graph layout for auto-arrange |
| Icons | Heroicons (trimmed) | SVG icon set, tree-shaken to reduce bundle size |
| Fonts | Inter (Google Fonts) | Most legible UI typeface at small sizes |

---

## Architecture

### Component Structure

```
src/
├── components/
│   ├── canvas/          # WorkflowCanvas, CanvasControls, StatusBar
│   ├── sidebar/         # Sidebar, NodeToolbox, DraggableNode
│   ├── nodes/           # StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode
│   ├── forms/           # Property forms for each node type (open in Drawer)
│   ├── copilot/         # CopilotModal — AI flow generation UI
│   ├── command/         # CommandPalette — Ctrl+K modal
│   ├── demo/            # DemoOverlay, FakeCursor, TutorialOverlay
│   ├── analytics/       # AnalyticsBar — live graph metrics
│   ├── sandbox/         # SandboxPanel, ExecutionLog — simulation right panel
│   └── ui/              # Button, Drawer, Modal, Toast — reusable primitives
```

### State Management

Single Zustand store (`workflowStore.ts`) holds all application state:
- `nodes` / `edges` — React Flow graph data
- `selectedNodeId` — drives the properties Drawer
- `simulationLog` / `isSimulating` / `validationErrors` — simulation state
- `highlightedNodeId` / `completedNodes` — animation state during playback
- `past` / `future` — undo/redo stacks (snapshot history)
- `fitViewTrigger` — signals the canvas to call `fitView()`

All state is persisted to `localStorage` via Zustand's `persist` middleware. Undo/redo uses shallow snapshots of nodes+edges pushed on every meaningful change.

### Node System

Each node type is a React component registered with React Flow's `nodeTypes` map. Every node receives its data via the standard `data` prop and reads the store for highlight/completed state selectors. Node data shapes are strictly typed via TypeScript interfaces in `src/types/`.

### Simulation Engine

`simulateWorkflow(nodes, edges)` in `src/api/simulate.ts` performs:
1. Validation: find start node, find end node, BFS reachability check
2. Topological traversal: walk from Start following edges
3. Returns an ordered array of `SimulationStep` objects with `nodeId`, `step`, `label`, `duration`

The UI layer animates these steps with timed `setHighlightedNodeId` calls and accumulates `completedNodes` for the green-checkmark visual.

### Templates System

Templates live in `src/data/templates.ts` as static arrays of `nodes` + `edges`. All node data fields match the TypeScript interfaces exactly — a lesson learned after the Copilot blank-screen bug (wrong field names caused `.map()` on undefined arrays).

### Copilot Generation

`src/data/copilotFlows.ts` holds pre-written workflow graphs for each supported flow type. When a user selects a flow, `generate()` in `src/api/copilot.ts` copies the matching graph into the store via `setNodes` / `setEdges`, then triggers `fitView`. A simulated "thinking" delay adds realism to the Copilot chat experience.

---

## Project Structure

```
Tredence-HR-Workflow-Designer/
├── public/
│   └── flowhr-navbar.png        # App logo
├── src/
│   ├── api/                     # simulate.ts, copilot.ts, automations.ts
│   ├── components/              # All UI components (see Architecture above)
│   ├── data/                    # templates.ts, copilotFlows.ts
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAutosave.ts
│   │   ├── useAutoArrange.ts
│   │   ├── useSimulate.ts
│   │   ├── useAutomations.ts
│   │   ├── useUndoRedo.ts
│   │   ├── useLiveDemo.ts       # Live Demo script engine
│   │   └── useTutorial.ts       # Tutorial step state machine
│   ├── pages/
│   │   └── WorkflowBuilderPage.tsx
│   ├── store/
│   │   ├── workflowStore.ts     # Main Zustand store
│   │   └── toastStore.ts        # Toast notification store
│   ├── types/                   # TypeScript interfaces for nodes, edges, etc.
│   ├── utils/
│   │   ├── serialization.ts     # JSON import/export
│   │   ├── graphUtils.ts        # Graph traversal helpers
│   │   └── demoPositions.ts     # getBoundingClientRect-based DOM position queries
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                # Global styles, animations, Tailwind directives
├── docs/                        # Internal planning docs (gitignored from public view)
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Run Locally

```bash
git clone https://github.com/dhruvgupta-24/Tredence-HR-Workflow-Designer.git
cd Tredence-HR-Workflow-Designer
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output goes to `dist/`. The bundle is ~411KB JS (130KB gzipped) and ~56KB CSS (10KB gzipped).

### Type Check

```bash
npx tsc --noEmit
```

---

## Why This Stands Out

Most student projects are either CRUD apps or tutorials followed from YouTube.

FlowHR is a **product** — it has a real user problem, a real UI design system, production-grade state management with undo/redo, a simulation engine with graph validation, and not one but two showcase experiences (Live Demo + Tutorial) built specifically for the recruiter context.

**Product thinking:** The feature set mirrors real HR workflow tools (Kissflow, Process Street) but reimagined as a visual-first, browser-native tool.

**UX polish:** Every interaction has a hover state. Every async operation has a loading state. Errors are never silent. The toolbar looks like a Linear or Vercel product, not a student project.

**Technical depth:** Zustand store architecture, TypeScript strict mode throughout, Dagre graph layout, BFS graph validation, undo/redo snapshot history, DOM-based responsive cursor positioning — these are real engineering decisions with real tradeoffs.

**Recruiter-facing:** The Live Demo sells the product in 22 seconds without requiring any interaction. The Tutorial onboards someone unfamiliar with graphs in under 2 minutes.

---

## Future Scope

| Feature | Description |
|---|---|
| Backend persistence | Supabase/PostgreSQL to save workflows per user |
| Real-time collaboration | CRDT-based multi-user editing (Liveblocks or Yjs) |
| Live AI integration | Replace copilot stubs with GPT-4 / Claude API calls |
| Analytics history | Track simulation runs, approval rates, bottleneck heatmaps |
| Role-based access | HR admin vs. employee view of workflows |
| Webhook triggers | Real automation: send emails, Slack messages, Jira tickets |
| Mobile view | Read-only workflow viewer for mobile approvers |
| Versioning | Git-style workflow version history with diff viewer |

---

## Screenshots

> *Screenshots coming soon — run the app locally or visit the Live Demo link above.*

| View | Description |
|---|---|
| Canvas Builder | Drag-and-drop node editor with sidebar and analytics bar |
| AI Copilot | Chat-style workflow generation modal |
| Live Demo Mode | Cinematic 22-second autoplay with scripted cursor |
| Tutorial Mode | 6-step guided tutorial with spotlight and ghost cursor |
| Simulation Playback | Step-by-step node glow animation with execution log |

---

## License

MIT — free to use, fork, and build upon.

---

<div align="center">
  <p>Built with focus and coffee. Made for the Tredence hackathon.</p>
  <p>
    <a href="https://tredence-hr-workflow-designer.vercel.app">Live Demo</a> ·
    <a href="https://github.com/dhruvgupta-24/Tredence-HR-Workflow-Designer">GitHub</a>
  </p>
</div>
