<div align="center">

<img src="public/flowhr-navbar.png" alt="FlowHR Logo" width="72" />

# FlowHR

**Visual HR Workflow Designer**

Build, simulate, and iterate on HR workflows in seconds - no code required.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Flow](https://img.shields.io/badge/React_Flow-12-ff0072?style=flat-square)](https://reactflow.dev/)

</div>

---

## What Is FlowHR?

FlowHR is a production-quality HR workflow automation designer built as a Tredence engineering assessment. It lets HR teams visually design, validate, and simulate processes - from onboarding to payroll - with zero backend dependency.

> Designed to demonstrate enterprise-grade frontend architecture, state management, and UX craftsmanship.

---

## Live Demo

To experience the full product in 15 seconds, clone the repo, run `npm run dev`, then click **Demo** in the toolbar.

---

## Screenshots

> Load any of the 3 built-in templates or generate a workflow using the AI Copilot to see the canvas in action.

---

## Core Features

### Visual Workflow Builder
Drag-and-drop canvas powered by React Flow v12. Five node types: Start, Task, Approval Gate, Automated Step, and End. Connect nodes with smart handles. Snap-to-grid layout. Pan and zoom.

### AI Workflow Copilot
Type any HR process in plain English and FlowHR generates a complete, valid workflow instantly. Supports 8 pre-built workflow patterns: onboarding, leave, exit, performance review, hiring, promotion, training, and payroll. Animated generation experience with staged feedback.

### Guided Demo Mode
One-click cinematic product showcase. Loads the Leave Approval workflow, auto-arranges the layout, plays back the full animated simulation, and opens the AI Copilot - all in under 15 seconds. Ideal for evaluator demos.

### Simulation Playback
Step-by-step animated execution of any workflow. Active nodes glow with a pulsing indigo ring. Completed edges turn green. The simulation log builds progressively in the side panel. Toast notifications confirm completion.

### Smart Analytics Bar
Real-time workflow metrics at the bottom of the canvas: node count, automation percentage, estimated duration in days, task and approval breakdown, and bottleneck detection with amber warnings for long approval chains.

### Workflow Optimizer
One-click cleanup: removes isolated (unconnected) nodes, deduplicates redundant edges, and re-arranges the layout. Reports exactly what was changed via toast notification.

### Ctrl+K Command Palette
VS Code-style command palette with fuzzy search across all actions, templates, and views. Full keyboard navigation with arrow keys and Enter. Grouped commands with descriptions and shortcuts.

### Keyboard Shortcuts
Full keyboard support: Ctrl+Z undo, Ctrl+Shift+Z redo, Ctrl+K palette, ? for shortcut help, Del to remove nodes, Esc to dismiss. All wired with a clean global listener architecture.

### Import and Export
Export any workflow as a clean JSON file. Import previously saved workflows with full validation and error recovery. Autosave to localStorage on every change.

### Custom Node Properties
Every node type has a dedicated properties panel (drawer). Configure assignees, approver roles, automation actions, due dates, metadata fields, and more. All changes reflect instantly on the canvas.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build Tool | Vite 5 |
| Canvas | React Flow v12 (XYFlow) |
| State | Zustand (no Redux boilerplate) |
| Styling | Tailwind CSS v3 |
| Persistence | localStorage (autosave) |
| Linting | ESLint + TypeScript strict mode |

---

## Architecture Highlights

**Zero Backend Required.** All state is managed client-side via Zustand with localStorage persistence. The simulation engine runs on a BFS traversal of the workflow graph entirely in the browser.

**Typed Node Data System.** Each node type (Start, Task, Approval, Automated, End) has a strongly-typed data interface. The render components, forms, and simulation engine all share the same type contract - no implicit any.

**Reactive State Architecture.** The Zustand store drives the entire UI: canvas nodes, edge styles, simulation highlight, completed node tracking, validation errors, and undo/redo history. Components subscribe only to the slices they need.

**Simulation Engine.** `src/api/simulate.ts` runs a BFS traversal from the Start node, building an ordered execution log. The `useSimulate` hook animates through this log step-by-step with 700ms intervals, marking nodes as highlighted then completed.

**Undo/Redo.** Full snapshot-based history (30 snapshots max). Every destructive operation (node drag, delete, edge connect, template load, import) saves a snapshot first. Ctrl+Z and Ctrl+Shift+Z restore them cleanly.

**AI Copilot Architecture.** A keyword-weighted matching engine maps natural language prompts to one of 8 validated workflow templates. The copilot never calls an external API - generation is instantaneous with a staged animation to show intent.

---

## Why This Stands Out

- **Enterprise-grade type safety** - strict TypeScript throughout, zero `any` in production paths
- **Immediate interactivity** - loads with a complete sample workflow and analytics populated on first render
- **Intelligent defaults** - every workflow template validates and simulates correctly out of the box
- **Premium UX details** - cinematic page load animation, edge pulse during simulation, completed-edge green coloring, toast feedback on every action
- **Production build ready** - Vite outputs an optimized bundle under 400KB gzipped

---

## Local Setup

```bash
# Clone
git clone https://github.com/your-username/flowhr.git
cd flowhr

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Production Build

```bash
# Type-check + bundle
npm run build

# Preview production build locally
npm run preview
```

Build output goes to `dist/`. The bundle is fully static and can be deployed to any CDN (Vercel, Netlify, GitHub Pages).

---

## Project Structure

```
src/
  api/          Simulation engine and automation actions
  components/
    analytics/  Live workflow metrics bar
    canvas/     React Flow canvas, toolbar, status bar
    command/    Ctrl+K command palette
    copilot/    AI Workflow Copilot modal
    forms/      Node property editors
    nodes/      Custom node render components
    sandbox/    Simulation control panel
    sidebar/    Node toolbox and template library
    ui/         Shared UI primitives (Button, Modal, Toast, etc.)
  data/         Workflow templates and copilot flow definitions
  hooks/        useSimulate, useAutoArrange, useGuidedDemo, etc.
  pages/        WorkflowBuilderPage (main shell)
  store/        Zustand workflow store and toast store
  types/        Shared TypeScript types (nodes, workflow state)
  utils/        Serialization, validation, layout helpers
```

---

<div align="center">

Built for the Tredence Engineering Assessment

</div>
