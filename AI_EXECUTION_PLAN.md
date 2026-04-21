# AI Execution Plan
## HR Workflow Designer

> Sequential prompt plan for AI coding agent. Execute in order. Do not skip phases.

---

## Time Budget

Total allowed: **4-6 hours** (per Tredence case study brief).

| Phase | Target Time |
|---|---|
| 0 - Scaffold | 15 min |
| 1 - Canvas + Sidebar | 45 min |
| 2 - Node Components | 45 min |
| 3 - Node Edit Forms | 60 min |
| 4 - Mock API | 20 min |
| 5 - Sandbox | 30 min |
| 6 - Validation | 20 min |
| 7 - Bonus | 30 min (if time left) |
| 8 - Polish + README | 15 min |
| **Total** | **~4.5 hours** |

If running behind: skip Phase 7 entirely. Ship Phases 0-6 + README cleanly.

---

## Token Efficiency Rules

- One phase per chat session if context grows heavy
- Always read PROJECT_PROGRESS.md before starting a session
- Commit after every phase, not after every file
- Do not refactor until Phase 6 is done
- Prefer working code over perfect code in early phases

---

## Phase 0 - Project Scaffold

**Prompt to agent:**

```
Scaffold a new Vite + React + TypeScript project called hr-workflow-designer.
Install: @xyflow/react, zustand, tailwindcss, clsx, nanoid.
Set up Tailwind with default config.
Create the full folder structure from TECH_ARCHITECTURE.md.
Add placeholder index.ts exports in each folder.
Create a basic App.tsx that renders "HR Workflow Designer" centered on screen.
Verify npm run dev works.
Commit: "chore: initial project scaffold"
Update PROJECT_PROGRESS.md.
```

**Done when:** `npm run dev` shows text on screen with no errors.

---

## Phase 1 - Canvas + Sidebar Shell

**Prompt to agent:**

```
Build the main layout: left sidebar (240px) + center canvas + right drawer slot.
In sidebar, render NodeToolbox with 5 draggable items:
  Start, Task, Approval, Automated Step, End
Each draggable item sets dataTransfer with its node type on dragStart.

Build WorkflowCanvas.tsx:
- Wrap <ReactFlow> with empty nodeTypes map for now
- Handle onDrop: get type from dataTransfer, create node at drop position using screenToFlowPosition, add to Zustand store
- Handle onDragOver: preventDefault, set dropEffect = 'move'
- Handle onConnect: add edge to store
- Handle onNodesChange, onEdgesChange with applyNodeChanges/applyEdgesChange
- Add MiniMap, Controls, Background components from @xyflow/react

Wire Zustand store with nodes, edges, setNodes, setEdges, addNode, addEdge.

Commit: "feat: canvas and sidebar shell"
Update PROJECT_PROGRESS.md.
```

**Done when:** Can drag a node type from sidebar and it appears on canvas.

---

## Phase 2 - Node Components

**Prompt to agent:**

```
Build all 5 custom node components. Each should:
- Use NodeProps generic from @xyflow/react
- Show node type badge (colored pill)
- Show title prominently
- Show 2-3 key data fields as preview text
- Have Handle components on appropriate sides (source bottom, target top)
- Show a highlighted border when selected (use selected prop)
- Use Tailwind for styling

Node type colors:
  start: green
  task: blue
  approval: orange
  automated: purple
  end: red

Register all in nodeTypes map in nodeTypes.ts.
Pass nodeTypes to <ReactFlow>.

Default data per node type should come from nodeDefaults.ts:
  start: { title: 'Start', metadata: [] }
  task: { title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] }
  approval: { title: 'Approval', approverRole: 'Manager', autoApproveThreshold: 0 }
  automated: { title: 'Automated Step', actionId: '', actionParams: {} }
  end: { title: 'End', endMessage: 'Workflow Complete', showSummary: false }

Commit: "feat: custom node components"
Update PROJECT_PROGRESS.md.
```

**Done when:** All 5 node types render correctly on canvas with correct colors and handles.

---

## Phase 3 - Node Edit Forms + Right Panel

**Prompt to agent:**

```
Build Drawer.tsx: a right-side panel (320px wide) that slides in when selectedNodeId is set.
On node click, set selectedNodeId in store. Drawer reads selectedNode from store.
Drawer header: node title + type badge + close button.

Build one form per node type. All forms:
- Read current values from store (no local state)
- On any field change, call updateNodeData(id, { field: value })
- Use FormField.tsx for labeled inputs (label + input + optional error)

StartNodeForm: title input + KeyValueEditor for metadata pairs
TaskNodeForm: title, description (textarea), assignee, dueDate (date input), KeyValueEditor for customFields
ApprovalNodeForm: title, approverRole (select: Manager/HRBP/Director/CEO), autoApproveThreshold (number input)
AutomatedNodeForm:
  - title input
  - action dropdown (populated from useAutomations hook - reads from store)
  - when action selected, render dynamic text inputs for each param in action.params
  - store values in actionParams: { [paramKey]: value }
EndNodeForm: title, endMessage (textarea), showSummary (toggle/checkbox)

KeyValueEditor.tsx: renders list of key+value inputs, add row button, remove row button per pair.

Commit: "feat: node edit forms and drawer"
Update PROJECT_PROGRESS.md.
```

**Done when:** Clicking any node opens the drawer with the correct form. Edits update the node preview live.

---

## Phase 4 - Mock API Layer

**Prompt to agent:**

```
Create mock API functions in src/api/.

automations.ts:
  export async function getAutomations(): Promise<AutomationAction[]>
  - Returns hardcoded array with 200ms artificial delay (setTimeout in Promise)
  - Include: send_email, generate_doc, notify_slack, update_hris (see SYSTEM_DESIGN.md)

simulate.ts:
  export async function simulateWorkflow(nodes, edges): Promise<SimulationResult>
  - 400ms delay
  - Walk nodes in topological order (use edge connections to determine order)
  - Generate a step label per node based on node type and data
  - Return { success: true, steps: SimulationStep[] }
  - If no start or end node: return { success: false, error: 'Invalid workflow' }

useAutomations.ts hook:
  - Fetches on mount, stores in Zustand (add automations[] to store)
  - Returns { automations, loading, error }

Commit: "feat: mock API layer"
Update PROJECT_PROGRESS.md.
```

**Done when:** AutomatedNodeForm dropdown shows actions from mock API. Console log shows simulate result.

---

## Phase 5 - Sandbox Panel + Run Workflow

**Prompt to agent:**

```
Build SandboxPanel.tsx (collapsible bottom panel or right panel below drawer):
- "Run Workflow" button
- On click: validate first, then call simulateWorkflow
- Show spinner/loading state
- On success: render ExecutionLog
- On error: show error message

ExecutionLog.tsx:
- Renders list of steps from simulation result
- Each step: step number badge + label + node type color dot
- Animate in with CSS transition (fade/slide)
- Show "Workflow completed successfully" footer if success

Wire Run button to useSimulate hook:
  - useSimulate calls useValidation first
  - If errors: set validationErrors in store, do not simulate
  - If valid: call simulateWorkflow, set simulationLog in store

Show validation errors as red banner above canvas or in sidebar panel.

Commit: "feat: sandbox panel and workflow simulation"
Update PROJECT_PROGRESS.md.
```

**Done when:** Full run flow works: validate -> simulate -> show log.

---

## Phase 6 - Validation

**Prompt to agent:**

```
Build validation.ts with pure functions:
  validateWorkflow(nodes, edges): string[]

Rules to implement (see SYSTEM_DESIGN.md for messages):
1. Must have exactly one start node
2. Must have at least one end node
3. No orphan nodes (nodes with no edges)
4. Start node has no incoming edges
5. End node has no outgoing edges
6. Cycle detection (DFS-based)

Show validation errors:
- In a red banner below the canvas toolbar
- As a tooltip badge on orphan/invalid nodes (optional, P1)

Trigger validation:
- On "Run Workflow" click (blocking)
- Optionally on edge connect/delete (non-blocking, soft warnings)

Commit: "feat: graph validation"
Update PROJECT_PROGRESS.md.
```

**Done when:** Invalid workflows show readable error messages and block simulation.

---

## Phase 7 - Bonus Features (If Time Allows)

**Prompt to agent:**

```
Add these in order of priority. Stop when time runs low.

1. Export JSON button (toolbar):
   - Serialize nodes + edges to JSON
   - Download as workflow.json

2. Import JSON button (toolbar):
   - File input, read JSON, load into store
   - Validate structure before loading

3. Undo/Redo:
   - useUndoRedo hook wrapping Zustand store
   - Ctrl+Z / Ctrl+Y keyboard shortcuts
   - Track history of [nodes, edges] snapshots

Commit per feature: "feat: export/import JSON", "feat: undo redo"
Update PROJECT_PROGRESS.md.
```

---

## Phase 8 - Polish + Submission Prep

**Prompt to agent:**

```
Final polish pass:

1. Visual polish:
   - Consistent spacing and typography
   - Empty state on canvas: centered message "Drag nodes from the left panel to get started"
   - Loading skeletons in sidebar while automations fetch
   - Node delete button visible on hover

2. README.md:
   - Mark all completed features as done
   - Add screenshot placeholders with instructions
   - Verify setup steps are accurate

3. Final checks:
   - npm run build passes with no errors
   - No console errors in dev mode
   - TypeScript compiles cleanly (no ts-ignore)

4. Git:
   - Clean commit history
   - Final commit: "chore: submission ready"

Update all docs.
```

---

## Chat Session Guide

| Phase | New Chat? |
|---|---|
| 0 | Start fresh |
| 1 | Continue or new |
| 2 | New chat if context heavy |
| 3 | New chat (forms are verbose) |
| 4 | Continue from 3 |
| 5 | Continue or new |
| 6 | Continue from 5 |
| 7 | New chat |
| 8 | New chat |

Rule: If you have completed 2+ phases in a chat and responses feel slow or truncated, start a new chat. Paste the CHAT_HANDOFF.md content as first message.
