# AI Execution Plan
## HR Workflow Designer

> Sequential prompt checklist. Send one prompt at a time. Do not skip. Do not combine phases.
> Read docs/AGENT_RULES.md and docs/PROJECT_PROGRESS.md before every session.

---

## Version Note

Stack lock: `@xyflow/react ^12.x` (React Flow v12). README previously said v11 - v12 is correct. Fix any stale references.

---

## Supabase MCP - Tooling Note

**Status:** Connected and available. Do not use unless a prompt explicitly requires it or the benefit is clear and concrete.

Current scope is frontend-first:
- Workflow state: Zustand + localStorage (no backend needed)
- APIs: mock async functions in src/api/ (no network calls)
- Auth: none (single-user tool per PRD)

Supabase MCP MAY be useful for:
- Phase 9 (autosave): if localStorage proves insufficient, use Supabase as a drop-in persistence layer
- Future enhancements listed in README "What I Would Add" section
- Demo purposes: storing and sharing workflows by URL via a Supabase row

Do NOT add Supabase to any prompt unless the agent explicitly evaluates localStorage as insufficient first.

---

## How to Use This File

1. Find your current prompt number in docs/PROJECT_PROGRESS.md.
2. Copy the full prompt block below exactly as written.
3. Paste into a new or existing agent chat.
4. Wait for agent to complete and commit before sending the next prompt.
5. After completion, update docs/PROJECT_PROGRESS.md with the prompt number and commit hash.

Fresh chat checkpoints are marked with: `[FRESH CHAT RECOMMENDED]`
Stop points after risky work are marked with: `[STOP - VERIFY BEFORE CONTINUING]`

---

## Phase 0 - Project Scaffold

### Prompt 01 - Vite Init + Dependencies

```
Read docs/AGENT_RULES.md and docs/PROJECT_PROGRESS.md first.

Task: Initialize the project.

1. Check if a package.json already exists in the project root. If yes, skip scaffold and only install missing deps.
2. If no package.json: run `npm create vite@latest . -- --template react-ts` in the project root (non-interactive, accept defaults).
3. Install all dependencies in one command:
   npm install @xyflow/react zustand clsx nanoid
4. Install dev dependencies:
   npm install -D tailwindcss postcss autoprefixer
5. Run: npx tailwindcss init -p
6. Configure tailwind.config.ts:
   - content: ["./index.html", "./src/**/*.{ts,tsx}"]
   - No custom theme needed yet
7. Replace src/index.css with Tailwind directives:
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
8. Import index.css in main.tsx.
9. Replace App.tsx with a minimal component that renders: <div className="text-white bg-gray-900 h-screen flex items-center justify-center"><h1>HR Workflow Designer</h1></div>
10. Run `npm run dev` - confirm it starts without errors.
11. Run `npm run build` - confirm it builds without errors.
12. Commit: "chore: initial project scaffold with vite react ts tailwind"
13. Update docs/PROJECT_PROGRESS.md: set current phase to P0, prompt 01 complete.

Tell me only steps that require manual action.
```

**Gate:** `npm run dev` renders text. `npm run build` exits 0. No TS errors.

---

### Prompt 02 - Folder Structure + Type Stubs

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 0 Prompt 01 is complete.

Task: Create the full folder structure with stub files.

Create every file listed below. Each file should only contain a comment stub and an empty export - do not implement logic yet.

src/
  api/
    automations.ts       -- export stub
    simulate.ts          -- export stub
    index.ts             -- re-export from automations and simulate
  components/
    canvas/
      WorkflowCanvas.tsx -- export stub component
      CanvasControls.tsx -- export stub component
      index.ts           -- re-export
    nodes/
      StartNode.tsx      -- export stub component
      TaskNode.tsx       -- export stub component
      ApprovalNode.tsx   -- export stub component
      AutomatedNode.tsx  -- export stub component
      EndNode.tsx        -- export stub component
      nodeTypes.ts       -- export empty nodeTypes object
      index.ts           -- re-export
    forms/
      StartNodeForm.tsx  -- export stub component
      TaskNodeForm.tsx   -- export stub component
      ApprovalNodeForm.tsx
      AutomatedNodeForm.tsx
      EndNodeForm.tsx
      KeyValueEditor.tsx
      FormField.tsx
      index.ts
    sidebar/
      Sidebar.tsx
      NodeToolbox.tsx
      DraggableNode.tsx
      index.ts
    sandbox/
      SandboxPanel.tsx
      ExecutionLog.tsx
      index.ts
    ui/
      Button.tsx
      Input.tsx
      Select.tsx
      Toggle.tsx
      Drawer.tsx
      Badge.tsx
      index.ts
  hooks/
    useDragDrop.ts
    useValidation.ts
    useSimulate.ts
    useAutomations.ts
    useUndoRedo.ts
  store/
    workflowStore.ts
    index.ts
  types/
    nodes.ts
    workflow.ts
    api.ts
    index.ts
  utils/
    validation.ts
    serialization.ts
    nodeDefaults.ts
    idGenerator.ts
  pages/
    WorkflowBuilderPage.tsx

Fill src/types/nodes.ts with all TypeScript interfaces from TECH_ARCHITECTURE.md (BaseNodeData, StartNodeData, TaskNodeData, ApprovalNodeData, AutomatedNodeData, EndNodeData, NodeData union, WorkflowNode).

Fill src/types/workflow.ts with WorkflowState interface and SimulationStep interface from docs/SYSTEM_DESIGN.md.

Fill src/types/api.ts with AutomationAction interface: { id: string; label: string; params: string[] }

Fill src/types/index.ts to re-export everything.

Fill src/utils/idGenerator.ts: export function generateId(): string using crypto.randomUUID().

Run: npx tsc --noEmit
Fix any type errors before committing.

Commit: "chore: full folder structure and type definitions"
Update docs/PROJECT_PROGRESS.md: prompt 02 complete.

Tell me only steps that require manual action.
```

**Gate:** `npx tsc --noEmit` exits 0. All files exist.

---

## Phase 1 - Store + Defaults

### Prompt 03 - Zustand Store + Node Defaults

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 0 is complete.

Task: Build the Zustand store and node defaults.

1. Fill src/utils/nodeDefaults.ts:
   Export a function getDefaultData(type: string): NodeData that returns:
   - start: { title: 'Start', metadata: [] }
   - task: { title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] }
   - approval: { title: 'Approval Gate', approverRole: 'Manager', autoApproveThreshold: 0 }
   - automated: { title: 'Automated Step', actionId: '', actionParams: {} }
   - end: { title: 'End', endMessage: 'Workflow complete', showSummary: false }
   - default: throw new Error('Unknown node type')

2. Fill src/store/workflowStore.ts:
   Use Zustand create(). Implement the full WorkflowState interface from src/types/workflow.ts.
   
   State fields:
   - nodes: WorkflowNode[] = []
   - edges: Edge[] = [] (import Edge from @xyflow/react)
   - selectedNodeId: string | null = null
   - validationErrors: string[] = []
   - simulationLog: SimulationStep[] = []
   - isSimulating: boolean = false
   - automations: AutomationAction[] = []

   Actions:
   - addNode(node: WorkflowNode): void - appends to nodes
   - updateNodeData(id: string, data: Partial<NodeData>): void - merges data into matching node
   - removeNode(id: string): void - removes node and any connected edges
   - addEdge(edge: Edge): void - appends, no duplicates (check source+target combo)
   - removeEdge(id: string): void
   - setSelectedNode(id: string | null): void
   - setNodes(nodes: WorkflowNode[]): void
   - setEdges(edges: Edge[]): void
   - setValidationErrors(errors: string[]): void
   - setSimulationLog(log: SimulationStep[]): void
   - setIsSimulating(v: boolean): void
   - setAutomations(automations: AutomationAction[]): void
   - resetWorkflow(): void - resets nodes, edges, selectedNodeId, validationErrors, simulationLog

3. Fill src/store/index.ts: re-export useWorkflowStore.

4. Run: npx tsc --noEmit. Fix all errors.

Commit: "feat: zustand store and node defaults"
Update docs/PROJECT_PROGRESS.md: Phase 1, prompt 03 complete.

Tell me only steps that require manual action.
```

**Gate:** Zero TypeScript errors. Store exports correctly.

---

## Phase 2 - Canvas + Sidebar

### Prompt 04 - Main Layout Shell

[FRESH CHAT RECOMMENDED if context from Phase 0/1 is heavy]

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 1 is complete.

Task: Build the app layout shell and routing.

1. Build src/pages/WorkflowBuilderPage.tsx:
   - Full-height 3-column layout: left sidebar (240px fixed) + center canvas (flex-1) + right panel slot (320px fixed, hidden when no node selected)
   - Use CSS grid or flex. No inline styles. Tailwind classes only.
   - Dark theme: bg-gray-950 for sidebar/panels, bg-gray-900 for canvas background

2. Update App.tsx:
   - Import and render <WorkflowBuilderPage /> only. No router needed (SPA).

3. Build src/components/ui/Button.tsx:
   - Props: variant ('primary' | 'secondary' | 'danger' | 'ghost'), size ('sm' | 'md'), onClick, disabled, children, className
   - Primary: indigo-600 bg, white text
   - Secondary: gray-700 bg
   - Danger: red-600 bg
   - Ghost: transparent, border only
   - Use clsx for conditional classes

4. Build src/components/ui/Input.tsx:
   - Props: label?, value, onChange, placeholder?, type?, error?, disabled?
   - Renders a styled text/date/number input with optional label above and error text below

5. Build src/components/ui/Select.tsx:
   - Props: label?, value, onChange, options: {value: string, label: string}[], error?
   - Same visual style as Input

6. Build src/components/ui/Badge.tsx:
   - Props: color ('green' | 'blue' | 'orange' | 'purple' | 'red' | 'gray'), children
   - Small pill badge with matching bg and text color

7. Build src/components/ui/Toggle.tsx:
   - Props: checked, onChange, label?
   - Custom toggle switch using Tailwind (no third-party)

8. Export all from src/components/ui/index.ts

9. Run: npx tsc --noEmit. Fix all errors.

Commit: "feat: app layout shell and UI primitives"
Update docs/PROJECT_PROGRESS.md: prompt 04 complete.

Tell me only steps that require manual action.
```

**Gate:** Layout renders. Three columns visible. No TypeScript errors.

---

### Prompt 05 - Sidebar + Draggable Node Toolbox

```
Read docs/PROJECT_PROGRESS.md first. Confirm prompt 04 is complete.

Task: Build the left sidebar and draggable node toolbox.

1. Build src/components/sidebar/DraggableNode.tsx:
   - Props: type (node type string), label, icon (emoji or SVG), color (Tailwind color key)
   - Sets dataTransfer.setData('application/reactflow', type) on dragStart
   - Sets dataTransfer.effectAllowed = 'move'
   - Styled as a card: border, rounded, icon + label side by side
   - Hover: lift effect (shadow + slight translate). Use CSS transition.
   - Do not use cursor: grab inline - use Tailwind cursor-grab class

2. Build src/components/sidebar/NodeToolbox.tsx:
   - Renders a labeled section "Node Types"
   - Renders DraggableNode for each of these 5 types:
     { type: 'start', label: 'Start', icon: '▶', color: 'green' }
     { type: 'task', label: 'Task', icon: '✓', color: 'blue' }
     { type: 'approval', label: 'Approval Gate', icon: '⬡', color: 'orange' }
     { type: 'automated', label: 'Automated Step', icon: '⚡', color: 'purple' }
     { type: 'end', label: 'End', icon: '■', color: 'red' }
   - Gap between items: gap-2

3. Build src/components/sidebar/Sidebar.tsx:
   - Renders the left column panel
   - App name / logo at top: "HR Flow" with a subtle icon
   - Section: NodeToolbox
   - Section: "Workflow" with placeholder Reset button (wired to store.resetWorkflow later)
   - Footer: version string "v1.0.0"
   - Dark bg: bg-gray-950, border-r: border-gray-800

4. Place <Sidebar /> in the left column of WorkflowBuilderPage.

5. Run: npx tsc --noEmit. Fix all errors.
6. Verify drag starts without console errors (dragging a node type from sidebar should not throw).

Commit: "feat: sidebar and draggable node toolbox"
Update docs/PROJECT_PROGRESS.md: prompt 05 complete.

Tell me only steps that require manual action.
```

**Gate:** Sidebar renders. All 5 node types visible. Drag starts without error.

---

### Prompt 06 - WorkflowCanvas + Drop + Connect

```
Read docs/PROJECT_PROGRESS.md first. Confirm prompt 05 is complete.

Task: Build the WorkflowCanvas with full drag-drop and connect wiring.

1. Build src/hooks/useDragDrop.ts:
   - Exports: onDragOver, getDropHandler(reactFlowInstance)
   - onDragOver: e.preventDefault(), e.dataTransfer.dropEffect = 'move'
   - getDropHandler returns an onDrop function that:
     - Reads type from e.dataTransfer.getData('application/reactflow')
     - Guards: if no type or !reactFlowInstance return early
     - Calls reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY })
     - Creates a new WorkflowNode: { id: generateId(), type, position, data: getDefaultData(type) }
     - Calls useWorkflowStore.getState().addNode(node)

2. Build src/components/canvas/WorkflowCanvas.tsx:
   - Import ReactFlow, Background, Controls, MiniMap, useReactFlow, applyNodeChanges, applyEdgesChange, addEdge from @xyflow/react
   - Wrap with <ReactFlowProvider> at the top level (in WorkflowBuilderPage or App)
   - Read nodes, edges, setNodes, setEdges, addEdge (store), setSelectedNode from store
   - Pass nodeTypes from nodeTypes.ts (empty object for now - nodes coming in Phase 3)
   - defaultEdgeOptions: { animated: true, style: { strokeWidth: 2, stroke: '#6366f1' } }
   - snapGrid: [16, 16]
   - Handle onNodesChange: call applyNodeChanges then setNodes
   - Handle onEdgesChange: call applyEdgesChanges then setEdges
   - Handle onConnect: call store.addEdge with the new edge
   - Handle onNodeClick: call setSelectedNode(node.id)
   - Handle onPaneClick: call setSelectedNode(null)
   - Handle onDrop and onDragOver from useDragDrop hook
   - Background: variant="dots", gap=16, color="#374151"
   - MiniMap: hidden on canvas smaller than 600px wide (use CSS)
   - Controls: position bottomRight
   - Empty state overlay: if nodes.length === 0, show centered text "Drag nodes from the left panel to get started" with a subtle icon. Fade this out when nodes are added.

3. Build src/components/canvas/CanvasControls.tsx:
   - Zoom in, zoom out, fit view buttons using useReactFlow() hook
   - Styled as a floating button group above the default Controls

4. Place <WorkflowCanvas /> in the center column of WorkflowBuilderPage.
   Wrap with <ReactFlowProvider> if not already done.

5. Run: npx tsc --noEmit. Fix all errors.
6. Test: drag a node chip from sidebar onto canvas. It should appear at drop position.
7. Test: draw an edge between two hypothetical nodes (use browser).

Commit: "feat: workflow canvas with drag-drop and connect"
Update docs/PROJECT_PROGRESS.md: prompt 06 complete.
```

**Gate:** Nodes appear on canvas on drop. Edges can be drawn. Empty state shows/hides correctly.

[STOP - VERIFY BEFORE CONTINUING]
> Manually verify: drag-drop works, edge drawing works, no console errors. Do not proceed to Phase 3 until this is confirmed.

---

## Phase 3 - Node Components

### Prompt 07 - All 5 Custom Node Components

[FRESH CHAT RECOMMENDED]

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 2 is complete.

Task: Build all 5 custom node components for React Flow.

Rules for every node component:
- Import NodeProps from @xyflow/react
- Use NodeProps generic typed to the correct NodeData interface
- Use Handle from @xyflow/react. Position: source on bottom, target on top. Exception: Start (source only), End (target only).
- Show a colored type badge (use Badge from ui/)
- Show title prominently
- Show 2-3 key preview fields as small text
- Apply a highlighted ring on selected state: use `selected` prop from NodeProps
- Width: 200px fixed via className (w-[200px])
- Dark card style: bg-gray-800, border border-gray-700, rounded-lg, shadow-md
- Selected: ring-2 ring-indigo-500
- Use Tailwind only. No inline styles.

Node type colors (for badge and ring accent):
  start: green (bg-green-500/20 text-green-400 border-green-500/50)
  task: blue (bg-blue-500/20 text-blue-400 border-blue-500/50)
  approval: orange (bg-orange-500/20 text-orange-400 border-orange-500/50)
  automated: purple (bg-purple-500/20 text-purple-400 border-purple-500/50)
  end: red (bg-red-500/20 text-red-400 border-red-500/50)

1. StartNode.tsx:
   - Badge: "Start" (green)
   - Show: data.title
   - Show: metadata count "X fields" if metadata.length > 0
   - Handle: source bottom only

2. TaskNode.tsx:
   - Badge: "Task" (blue)
   - Show: data.title
   - Show: data.assignee if set, else "Unassigned"
   - Show: data.dueDate if set, else "No due date"
   - Handle: target top, source bottom

3. ApprovalNode.tsx:
   - Badge: "Approval" (orange)
   - Show: data.title
   - Show: data.approverRole
   - Handle: target top, source bottom

4. AutomatedNode.tsx:
   - Badge: "Automated" (purple)
   - Show: data.title
   - Show: data.actionId if set, else "No action selected"
   - Handle: target top, source bottom

5. EndNode.tsx:
   - Badge: "End" (red)
   - Show: data.title
   - Show: data.endMessage (truncated to 30 chars)
   - Handle: target top only

6. Fill nodeTypes.ts:
   export const nodeTypes = { start: StartNode, task: TaskNode, approval: ApprovalNode, automated: AutomatedNode, end: EndNode }

7. Pass nodeTypes to <ReactFlow> in WorkflowCanvas.tsx.

8. Run: npx tsc --noEmit. Fix all errors.
9. Verify all 5 node types render on canvas with correct colors and handles.

Commit: "feat: all 5 custom node components"
Update docs/PROJECT_PROGRESS.md: prompt 07 complete.

Tell me only steps that require manual action.
```

**Gate:** All 5 node types render on canvas. Handles are on correct sides. Selected ring appears on click. Zero TS errors.

---

## Phase 4 - Edit Forms + Drawer

### Prompt 08 - Drawer Shell + FormField + KeyValueEditor

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 3 is complete.

Task: Build the Drawer, FormField, and KeyValueEditor.

1. Build src/components/ui/Drawer.tsx:
   - Props: isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode
   - Renders as a fixed right panel: w-[320px] h-full, bg-gray-900, border-l border-gray-800
   - Slides in from right: use CSS transform translate-x-full / translate-x-0 with transition-transform duration-200
   - Header: title text + close button (X icon, button)
   - Scrollable body: overflow-y-auto
   - When isOpen is false: translate-x-full (hidden off-screen but mounted)

2. Build src/components/forms/FormField.tsx:
   - Props: label: string, error?: string, required?: boolean, children: React.ReactNode
   - Renders: label above + children + error text below
   - Error text: text-red-400 text-xs
   - Label: text-gray-400 text-xs uppercase tracking-wide

3. Build src/components/forms/KeyValueEditor.tsx:
   - Props: pairs: {key: string, value: string}[], onChange: (pairs: {key: string, value: string}[]) => void
   - Renders a list of rows, each row: key input + value input + remove button
   - Add Row button at the bottom
   - On key/value change: call onChange with updated array (immutable update)
   - On remove: filter out the row at that index
   - On add: append { key: '', value: '' }
   - Inputs use same styling as Input.tsx via className

4. Wire the Drawer into WorkflowBuilderPage:
   - Read selectedNodeId from store
   - Find selectedNode = nodes.find(n => n.id === selectedNodeId)
   - Pass isOpen={!!selectedNode} onClose={() => setSelectedNode(null)} to Drawer
   - Pass title as selectedNode.data.title or the node type label

5. Run: npx tsc --noEmit. Fix all errors.
6. Test: click a node on canvas, drawer slides in. Click X, drawer slides out.

Commit: "feat: drawer shell, FormField, KeyValueEditor"
Update docs/PROJECT_PROGRESS.md: prompt 08 complete.

Tell me only steps that require manual action.
```

**Gate:** Drawer opens/closes. Slide animation is smooth. KeyValueEditor adds/removes rows.

---

### Prompt 09 - Node Edit Forms (Start + Task + Approval)

```
Read docs/PROJECT_PROGRESS.md first. Confirm prompt 08 is complete.

Task: Build StartNodeForm, TaskNodeForm, ApprovalNodeForm.

Rules for all forms:
- Read current values directly from store: useWorkflowStore(s => s.nodes.find(...))
- On field change: call updateNodeData(nodeId, { field: newValue }) immediately
- No local state for field values. Source of truth is the store.
- Use FormField.tsx wrapper around each input.
- Import Input, Select from ui/

1. StartNodeForm.tsx:
   Props: nodeId: string
   Fields:
   - title: Input (text)
   - metadata: KeyValueEditor (pairs from data.metadata, onChange calls updateNodeData(id, { metadata: newPairs }))

2. TaskNodeForm.tsx:
   Props: nodeId: string
   Fields:
   - title: Input (text)
   - description: <textarea> styled like Input, rows=3
   - assignee: Input (text, placeholder "e.g. HR Manager")
   - dueDate: Input (type="date")
   - customFields: KeyValueEditor

3. ApprovalNodeForm.tsx:
   Props: nodeId: string
   Fields:
   - title: Input (text)
   - approverRole: Select with options: Manager, HRBP, Director, CEO
   - autoApproveThreshold: Input (type="number", min=0, max=100, placeholder="0 = manual only")
   - Add a helper text below threshold: "Set to 0 to always require manual approval"

4. In Drawer.tsx or WorkflowBuilderPage, render the correct form based on selectedNode.type:
   - 'start': <StartNodeForm nodeId={selectedNode.id} />
   - 'task': <TaskNodeForm nodeId={selectedNode.id} />
   - 'approval': <ApprovalNodeForm nodeId={selectedNode.id} />
   - Others: placeholder text "Form coming soon"

5. Run: npx tsc --noEmit. Fix all errors.
6. Test: edit the title in the form. The node preview on canvas should update live.

Commit: "feat: Start, Task, Approval node edit forms"
Update docs/PROJECT_PROGRESS.md: prompt 09 complete.
```

**Gate:** Editing form fields updates the node preview on canvas in real time. Zero TS errors.

[STOP - VERIFY BEFORE CONTINUING]
> Confirm live update works for all three forms before proceeding.

---

### Prompt 10 - Node Edit Forms (Automated + End) + Drawer Finalization

```
Read docs/PROJECT_PROGRESS.md first. Confirm prompt 09 is complete.

Task: Build AutomatedNodeForm, EndNodeForm, and finalize the Drawer.

1. Build src/hooks/useAutomations.ts:
   - On mount: call getAutomations() from src/api/automations.ts
   - Store result in useWorkflowStore via setAutomations()
   - Return { automations, loading, error }
   - Memoize: only fetch once (use useEffect with [] dependency)

2. Fill src/api/automations.ts:
   export async function getAutomations(): Promise<AutomationAction[]>
   - Returns hardcoded array with 200ms artificial delay (setTimeout wrapped in Promise)
   - Data: [
       { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
       { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
       { id: 'notify_slack', label: 'Notify Slack', params: ['channel', 'message'] },
       { id: 'update_hris', label: 'Update HRIS Record', params: ['employee_id', 'field', 'value'] }
     ]

3. Call useAutomations() at the top of WorkflowBuilderPage so it fetches on app load.

4. AutomatedNodeForm.tsx:
   Props: nodeId: string
   - title: Input (text)
   - action: Select populated from store.automations. onChange sets actionId in node data and resets actionParams to {}
   - When actionId is set: render a dynamic text Input for each param in the selected action.params array
     - Label: param name (e.g. "to", "subject")
     - Value: data.actionParams[paramKey] || ''
     - onChange: updateNodeData(id, { actionParams: { ...existing, [paramKey]: newVal } })
   - While automations are loading: show a "Loading actions..." skeleton row

5. EndNodeForm.tsx:
   Props: nodeId: string
   - title: Input (text)
   - endMessage: <textarea> rows=3
   - showSummary: Toggle component with label "Show workflow summary on completion"

6. Update Drawer to render the correct form for all 5 node types.

7. Run: npx tsc --noEmit. Fix all errors.
8. Test: select AutomatedNode, choose an action, verify param inputs appear.
9. Test: select EndNode, toggle showSummary, verify node preview updates.

Commit: "feat: Automated and End node forms, drawer complete"
Update docs/PROJECT_PROGRESS.md: prompt 10 complete.
```

**Gate:** All 5 forms work live. Dynamic param fields render correctly. Zero TS errors.

---

## Phase 5 - Mock API

### Prompt 11 - Mock Simulate API + Topological Walk

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 4 is complete.

Task: Build the mock simulate API.

1. Fill src/api/simulate.ts:
   export async function simulateWorkflow(nodes: WorkflowNode[], edges: Edge[]): Promise<SimulationResult>

   Logic:
   - If no node with type 'start': return { success: false, error: 'Workflow must have a Start node' }
   - If no node with type 'end': return { success: false, error: 'Workflow must have an End node' }
   - Walk nodes in topological order:
     - Build adjacency list from edges (source -> target)
     - BFS or topological sort starting from the start node
   - For each visited node, generate a step label:
     - start: "Workflow started: {data.title}"
     - task: "Task assigned: {data.title} to {data.assignee || 'Unassigned'}"
     - approval: "Approval requested from {data.approverRole}"
     - automated: "Action executed: {selected action label or data.actionId}"
     - end: "Workflow completed: {data.endMessage}"
   - Return { success: true, steps: SimulationStep[] } after 400ms delay

2. Add SimulationResult type to src/types/workflow.ts:
   interface SimulationResult {
     success: boolean
     steps?: SimulationStep[]
     error?: string
   }

3. Fill src/api/index.ts: re-export getAutomations and simulateWorkflow.

4. Run: npx tsc --noEmit. Fix all errors.

Commit: "feat: mock simulate API with topological walk"
Update docs/PROJECT_PROGRESS.md: Phase 5, prompt 11 complete.

Tell me only steps that require manual action.
```

**Gate:** Zero TS errors. simulateWorkflow returns correct steps for a valid 5-node graph.

---

## Phase 6 - Sandbox + Simulation UI

### Prompt 12 - Sandbox Panel + Execution Log

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 5 is complete.

Task: Build the sandbox panel and execution log UI.

1. Build src/hooks/useSimulate.ts:
   - Reads nodes and edges from store
   - Calls validateWorkflow first and sets validationErrors in store
   - If validation passes: calls simulateWorkflow, sets simulationLog and isSimulating in store
   - Returns: { runSimulation, isSimulating, validationErrors, simulationLog }

2. Build src/components/sandbox/ExecutionLog.tsx:
   - Props: steps: SimulationStep[], success: boolean
   - Each step: step number circle + label text + node type color dot
   - Node type dot colors match Phase 3 color scheme
   - Animate each step in: CSS animation fade-in-up (use @keyframes in index.css or Tailwind animate)
   - Show "Workflow completed successfully" footer if success
   - Show "Simulation failed" header if !success

3. Build src/components/sandbox/SandboxPanel.tsx:
   - Read isSimulating, simulationLog, validationErrors from store
   - "Run Workflow" Button (primary, full width)
   - On click: call runSimulation from useSimulate
   - Disable button while isSimulating
   - Show a spinner SVG or CSS spinner while simulating
   - Show validationErrors as a red error list if present (one error per line, red dot prefix)
   - Show <ExecutionLog> when simulationLog.length > 0
   - "Clear" button to reset simulationLog and validationErrors

4. Mount SandboxPanel:
   - Place below the Drawer in the right panel column of WorkflowBuilderPage
   - Always visible (not conditional on selectedNode)
   - Right column structure: [Drawer (top, conditional)] [SandboxPanel (bottom, always)]

5. Run: npx tsc --noEmit. Fix all errors.
6. Test full run flow: build a 3-node graph (start -> task -> end), click Run, see execution log.

Commit: "feat: sandbox panel and simulation execution log"
Update docs/PROJECT_PROGRESS.md: Phase 6, prompt 12 complete.

Tell me only steps that require manual action.
```

**Gate:** Run flow works end-to-end. Execution log renders. Spinner shows during simulate. Errors show correctly.

[STOP - VERIFY BEFORE CONTINUING]
> Manually test the full simulate flow before proceeding to validation.

---

## Phase 7 - Validation

### Prompt 13 - Graph Validation Engine

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 6 is complete.

Task: Build the graph validation engine.

1. Fill src/utils/validation.ts:
   export function validateWorkflow(nodes: WorkflowNode[], edges: Edge[]): string[]

   Implement ALL rules from docs/SYSTEM_DESIGN.md:
   - "Workflow must have a Start node" (no node with type 'start')
   - "Workflow must have an End node" (no node with type 'end')
   - "Node '{data.title}' is not connected" (node has no edges as source or target)
   - "Start node cannot have incoming connections"
   - "End node cannot have outgoing connections"
   - Cycle detection: DFS from start node. If a visited node is encountered again: "Workflow contains a cycle"

   Return all errors found (not just first).

2. Fill src/hooks/useValidation.ts:
   export function useValidation(): { validate: () => string[] }
   - Reads nodes and edges from store
   - Returns validate function that calls validateWorkflow and returns errors

3. Update useSimulate.ts to use useValidation internally (already planned in Prompt 12 - finalize if not done).

4. In SandboxPanel, show each validation error as:
   - A red bordered item with a warning icon prefix
   - Errors clear when Run is clicked again

5. Run: npx tsc --noEmit. Fix all errors.
6. Test each validation rule manually:
   - Empty canvas -> click Run -> see "must have Start node"
   - Add Start only -> see "must have End node"
   - Add Start + End with no edge -> see orphan error
   - Draw a cycle -> see cycle error

Commit: "feat: graph validation engine with all 6 rules"
Update docs/PROJECT_PROGRESS.md: Phase 7, prompt 13 complete.

Tell me only steps that require manual action.
```

**Gate:** All 6 validation rules fire correctly. Invalid graphs block simulation. Errors are readable.

---

## Phase 8 - Undo/Redo + Keyboard Shortcuts

### Prompt 14 - Undo/Redo + Keyboard Shortcuts

[FRESH CHAT RECOMMENDED]

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 7 is complete.

Task: Add undo/redo and keyboard shortcuts.

1. Build src/hooks/useUndoRedo.ts:
   - Maintain a history stack of { nodes: WorkflowNode[], edges: Edge[] } snapshots
   - Max history depth: 50 snapshots
   - undo(): pop from history, apply to store
   - redo(): push forward
   - Push a snapshot to history whenever nodes or edges change (use useEffect watching store.nodes and store.edges)
   - Export: { undo, redo, canUndo, canRedo }

2. Add keyboard shortcut handler in WorkflowBuilderPage:
   - Use useEffect with keydown event listener on document
   - Ctrl+Z or Cmd+Z: call undo() if canUndo
   - Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z: call redo() if canRedo
   - Ctrl+A or Cmd+A: prevent default (avoid browser select all)
   - Delete or Backspace: if selectedNodeId is set, call removeNode(selectedNodeId) and setSelectedNode(null)
   - Escape: call setSelectedNode(null) to close drawer

3. Add undo/redo buttons to the canvas toolbar (CanvasControls.tsx or a new Toolbar.tsx):
   - Undo button: disabled when !canUndo
   - Redo button: disabled when !canRedo
   - Tooltip on hover showing "Ctrl+Z" / "Ctrl+Y"

4. Add Delete node button inside the Drawer header (right of the close button):
   - Trash icon button
   - On click: removeNode(selectedNodeId) + setSelectedNode(null)

5. Run: npx tsc --noEmit. Fix all errors.
6. Test: add nodes, undo, redo. Confirm state restores correctly.
7. Test: press Delete with node selected. Confirm node removed.

Commit: "feat: undo redo and keyboard shortcuts"
Update docs/PROJECT_PROGRESS.md: Phase 8, prompt 14 complete.

Tell me only steps that require manual action.
```

**Gate:** Ctrl+Z/Y work. Delete key removes selected node. Undo/redo buttons reflect correct disabled state.

---

## Phase 9 - Export / Import / Autosave

### Prompt 15 - Export + Import + localStorage Autosave

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 8 is complete.

Task: Add export, import, and localStorage autosave.

1. Fill src/utils/serialization.ts:
   - serializeWorkflow(nodes, edges): SerializedWorkflow
     Strip React Flow internal fields. Keep only: id, type, position, data per node.
     Return { version: '1.0', nodes: CleanNode[], edges: CleanEdge[] }
   - deserializeWorkflow(raw: unknown): { nodes: WorkflowNode[], edges: Edge[] } | null
     Validate structure. Return null if invalid.

2. Export button in toolbar:
   - Call serializeWorkflow(nodes, edges)
   - JSON.stringify with 2-space indent
   - Trigger file download as 'workflow.json' via Blob + URL.createObjectURL
   - Button label: "Export JSON"

3. Import button in toolbar:
   - Hidden <input type="file" accept=".json"> triggered by a styled button
   - On file select: read file, JSON.parse, call deserializeWorkflow
   - If valid: call setNodes + setEdges in store
   - If invalid: show an alert or inline error: "Invalid workflow file"

4. localStorage autosave:
   - In workflowStore.ts: add a Zustand middleware or useEffect in WorkflowBuilderPage
   - On every nodes or edges change: debounce 500ms, then save serializeWorkflow result to localStorage key 'hr-workflow-designer-autosave'
   - On app load (WorkflowBuilderPage mount): check localStorage for saved workflow, if found call deserializeWorkflow and load into store
   - Show a toast or subtle badge: "Autosaved" when save completes (use a local state toast, not a library)

5. Add Export + Import buttons to CanvasControls / toolbar area.

6. Run: npx tsc --noEmit. Fix all errors.
7. Test: build workflow, export JSON, refresh page (autosave should restore it), import the JSON file.

Commit: "feat: export import JSON and localStorage autosave"
Update docs/PROJECT_PROGRESS.md: Phase 9, prompt 15 complete.

Tell me only steps that require manual action.
```

**Gate:** Export downloads valid JSON. Import loads it back. Refresh restores from autosave. Zero TS errors.

---

## Phase 10 - Visual Polish

### Prompt 16 - Node Hover Actions + Empty States + Typography

[FRESH CHAT RECOMMENDED]

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 9 is complete.

Task: First visual polish pass - node interactions and empty states.

1. Node hover actions:
   - On hover over any node on canvas: show a small delete icon button in the top-right corner of the node
   - Use CSS group-hover via Tailwind (add group to node wrapper, opacity-0 group-hover:opacity-100 on button)
   - Delete button calls removeNode(node.id) from store on click
   - Do NOT propagate the click to onNodeClick

2. Sidebar loading skeleton:
   - While automations are loading: show 2 gray pulsing skeleton rows in the right panel where the action select would be
   - Use Tailwind animate-pulse

3. Canvas toolbar:
   - Build a clean top bar above the canvas: Export | Import | Undo | Redo | Fit View | [node count badge]
   - Subtle bg-gray-900 bar, border-b border-gray-800
   - Node count: "X nodes, Y edges" small gray text on the right

4. Typography and spacing audit:
   - Sidebar: consistent text-sm throughout, clear section dividers
   - Drawer: consistent padding (p-4), clear section headers
   - All form labels: consistent text-xs text-gray-400 uppercase tracking-wider
   - All inputs: consistent h-9 py-2 px-3 rounded-md bg-gray-800 border-gray-700 text-white

5. Add a "Reset Workflow" button to the sidebar:
   - On click: confirm with window.confirm("Reset workflow? This cannot be undone.") then call resetWorkflow() and clear localStorage autosave key

6. Run: npx tsc --noEmit. Fix all errors.
7. Verify: hover deletes appear on all 5 node types. Empty state shows on fresh canvas.

Commit: "style: node hover actions, empty states, typography polish"
Update docs/PROJECT_PROGRESS.md: prompt 16 complete.
```

**Gate:** Hover delete works on all 5 nodes. Toolbar counts are accurate. Spacing is consistent.

---

### Prompt 17 - Theme Finalization + Responsive Check + Animations

```
Read docs/PROJECT_PROGRESS.md first. Confirm prompt 16 is complete.

Task: Final theme pass, animations, and responsive check.

1. Color system audit (enforce across all components):
   - Background levels: bg-gray-950 (deepest) > bg-gray-900 > bg-gray-800 (inputs) > bg-gray-700 (borders/dividers)
   - Text levels: text-white (headings) > text-gray-300 (body) > text-gray-400 (labels/helpers) > text-gray-500 (placeholders)
   - Accent: indigo-500 / indigo-600 for primary actions and selected states
   - Danger: red-500
   - Success: green-500

2. Add micro-animations:
   - Drawer slide: already done - verify it is 200ms ease-out, not linear
   - ExecutionLog steps: stagger each step with animation-delay (0ms, 50ms, 100ms...) using CSS animation or Tailwind
   - Button hover: subtle scale-[1.02] transform with transition-transform duration-150
   - DraggableNode lift: translate-y-[-2px] shadow-lg on hover

3. Responsive check (desktop only per PRD, but ensure minimum 1280px works clean):
   - At 1280px: sidebar 240px, canvas fills space, right panel 320px
   - At 1440px: same proportions, canvas just gets wider
   - Ensure no horizontal overflow. Verify with browser devtools.

4. Node components final pass:
   - Ensure all 5 nodes have identical padding (p-3) and font sizes
   - Preview fields: text-xs text-gray-400
   - Title: text-sm font-medium text-white
   - Ensure Handle hover shows a green glow ring (use React Flow's connectionHandleStyle or a custom class)

5. Run: npx tsc --noEmit. Fix all errors.
6. Set viewport to 1280px in browser. Confirm no overflow.

Commit: "style: theme finalization, micro-animations, responsive check"
Update docs/PROJECT_PROGRESS.md: prompt 17 complete.
```

**Gate:** App looks premium at 1280px and 1440px. All animations smooth. No overflow.

---

## Phase 11 - Code Quality

### Prompt 18 - TypeScript Zero-Error Audit + Lint

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 10 is complete.

Task: Full code quality pass. No new features.

1. Run: npx tsc --noEmit
   - Fix EVERY TypeScript error. No ts-ignore allowed unless absolutely unavoidable (must add a comment explaining why).
   - Pay special attention to:
     - NodeProps generic types matching correct NodeData interface
     - Store action parameter types
     - Event handler types (React.DragEvent, React.ChangeEvent, etc.)
     - API return types

2. Install ESLint if not already configured (check for .eslintrc or eslint.config.js):
   - If not configured: the Vite template may already have it. Check package.json for eslint.
   - Run: npm run lint
   - Fix all lint errors and warnings.
   - Rules to enforce manually if ESLint is not set up:
     - No unused variables
     - No console.log statements (search entire src/ with grep)
     - No 'any' types without comment

3. Search for all 'any' types in src/:
   - grep -r ": any" src/
   - Replace each with proper type or document why it is necessary

4. Search for all console.log in src/:
   - grep -r "console.log" src/
   - Remove every one

5. Search for em dashes in all files:
   - grep -r "\u2014" src/
   - Remove or replace any found

6. Verify: npx tsc --noEmit exits 0. npm run lint exits 0 (or with 0 errors).

Commit: "chore: typescript zero-error audit and lint pass"
Update docs/PROJECT_PROGRESS.md: Phase 11, prompt 18 complete.
```

**Gate:** `npx tsc --noEmit` exits 0. `npm run lint` exits 0. Zero console.log in src/. Zero em dashes.

[STOP - VERIFY BEFORE CONTINUING]
> Do not proceed until both TypeScript and lint are fully clean.

---

## Phase 12 - Performance

### Prompt 19 - React Flow Render Optimization

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 11 is complete.

Task: Prevent unnecessary re-renders and optimize drag-drop performance.

1. Memoize all custom node components:
   - Wrap each of the 5 node components in React.memo()
   - Confirm with React DevTools Profiler that resizing one node does not re-render all others (manual step if DevTools available)

2. Memoize nodeTypes map:
   - Move nodeTypes declaration outside of any component so it is not recreated on render
   - Confirm it is already at module level in nodeTypes.ts (it should be)

3. Memoize store selectors:
   - In any component that reads from the store, use fine-grained selectors:
     - Instead of: const store = useWorkflowStore()
     - Use: const nodes = useWorkflowStore(s => s.nodes)
   - Audit WorkflowCanvas, SandboxPanel, Drawer, all form components

4. Debounce autosave:
   - Confirm the autosave in Phase 9 is debounced 500ms. If not, add debounce now.

5. Memoize useAutomations result:
   - Confirm getAutomations() is only fetched once regardless of re-renders (already enforced by [] dep array - verify).

6. Check for React Flow specific pitfalls:
   - defaultEdgeOptions must be defined outside the component (module level constant)
   - snapGrid must be defined outside the component
   - Confirm both are already at module level in WorkflowCanvas.tsx

7. Run: npm run build
   Confirm build exits 0 with no warnings about module size over 500kb.
   If bundle is large: check if any large library is imported unnecessarily.

Commit: "perf: memoize node components and optimize store selectors"
Update docs/PROJECT_PROGRESS.md: Phase 12, prompt 19 complete.
```

**Gate:** `npm run build` exits 0. No large bundle warnings. Node components are memoized.

---

## Phase 13 - Mock Data

### Prompt 20 - Mock Workflow Seed Data

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 12 is complete.

Task: Add a sample/demo workflow that loads on first visit.

1. Create src/utils/mockWorkflow.ts:
   - Export a constant MOCK_ONBOARDING_WORKFLOW: { nodes: WorkflowNode[], edges: Edge[] }
   - Build a complete 5-node onboarding workflow:
     Node 1 (start): title='Employee Onboarding Start', metadata=[{key:'department', value:'Engineering'}, {key:'start_date', value:'2026-05-01'}]
     Node 2 (task): title='Upload Documents', assignee='Employee', dueDate='2026-05-03', description='Upload ID, tax forms, offer letter'
     Node 3 (approval): title='Manager Approval', approverRole='Manager', autoApproveThreshold=0
     Node 4 (automated): title='Send Welcome Email', actionId='send_email', actionParams={to:'employee@company.com', subject:'Welcome aboard!', body:'Your onboarding is approved.'}
     Node 5 (end): title='Onboarding Complete', endMessage='Employee is fully onboarded', showSummary=true
   - Set positions so nodes cascade top-to-bottom at x=400 with y: 50, 200, 350, 500, 650
   - Wire edges: 1->2, 2->3, 3->4, 4->5

2. In WorkflowBuilderPage:
   - On app load: if localStorage has no saved workflow AND nodes is empty, load MOCK_ONBOARDING_WORKFLOW into the store
   - After loading: call fitView() on the React Flow instance with a 200ms delay (use setTimeout + useReactFlow)

3. Add a "Load Demo" button to the sidebar footer:
   - On click: confirm "Load demo workflow? Current work will be cleared." then load MOCK_ONBOARDING_WORKFLOW

4. Run: npx tsc --noEmit. Fix all errors.
5. Test: on fresh page load, demo workflow appears. Run simulation produces 5 steps.

Commit: "feat: mock onboarding workflow seed data and load demo button"
Update docs/PROJECT_PROGRESS.md: Phase 13, prompt 20 complete.
```

**Gate:** Demo workflow loads on first visit. All 5 nodes connected. Simulation returns 5 steps.

---

## Phase 14 - README + Docs

### Prompt 21 - Recruiter-Ready README

[FRESH CHAT RECOMMENDED]

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 13 is complete.

Task: Write the final recruiter-ready README.md.

Rewrite README.md completely. It must include:

1. Project title + one-sentence description
2. Status badge: "Submission Ready" in bold
3. "What's Built" section - full feature checklist (P0 and P1 items from PRD.md) - mark all complete items as [x]
4. Tech stack table (from TECH_ARCHITECTURE.md)
5. Setup section: exact commands to clone, install, run
6. Folder structure (abbreviated - top-level only)
7. Screenshots section: add this note: "MANUAL STEP REQUIRED: Take a screenshot of the app and add it here as screenshots/app-preview.png"
8. Design Decisions section: 4-5 bullet points explaining real decisions made (React Flow for graph, Zustand for minimal boilerplate, no router needed, mock API as async functions, validation is pure function for testability)
9. Key Features section: 8-10 bullets of the best features (visual, interactive, functional)
10. What I Would Add With More Time: 4-6 realistic bullets (backend, auth, templates, real email/PDF, mobile)
11. Author section: "Built for Tredence Full Stack Engineering Internship Assessment."

Rules:
- No em dashes
- No placeholder text left in the file
- Use clean markdown only (no HTML)
- Keep it tight - recruiter reads it in 2 minutes

Also update TECH_ARCHITECTURE.md line that says "React Flow v11" to "React Flow v12 (@xyflow/react)".

Commit: "docs: recruiter-ready README and architecture doc update"
Update docs/PROJECT_PROGRESS.md: Phase 14, prompt 21 complete.

MANUAL STEP REQUIRED:
  Action: Take a screenshot of the running app and save as screenshots/app-preview.png in the project root.
  Reason: AI cannot capture a browser screenshot of a live running app.
  Resume: Tell agent: "Screenshot added. Continue with Prompt 22."
```

**Gate:** README is complete, accurate, and contains no placeholder text. No em dashes.

---

## Phase 15 - Production Build + Submission

### Prompt 22 - Final Quality Gate + Production Build

```
Read docs/PROJECT_PROGRESS.md first. Confirm Phase 14 is complete.

Task: Final quality gate and production build.

1. Full TypeScript check:
   npx tsc --noEmit
   Zero errors required.

2. Lint check:
   npm run lint
   Zero errors required.

3. Search and remove:
   - grep -r "console.log" src/ -- must be empty
   - grep -r "TODO" src/ -- if any exist, resolve or remove them
   - grep -r "FIXME" src/ -- same
   - grep -r "placeholder" src/ -- check for any stale placeholder text in UI

4. Functional smoke test (do each manually in browser):
   - Load app -> demo workflow appears
   - Drag a new Task node onto canvas -> it appears
   - Click node -> drawer opens with correct form
   - Edit title -> node updates live on canvas
   - Run Workflow -> execution log shows 5+ steps
   - Export JSON -> file downloads
   - Refresh page -> autosave restores workflow
   - Ctrl+Z -> last action undoes
   - Delete key with node selected -> node removed
   - Import the exported JSON -> workflow loads correctly
   - Clear canvas -> empty state message appears

5. Production build:
   npm run build
   Must exit 0. No warnings about missing assets or large bundles.

6. Verify dist/ folder is listed in .gitignore (do NOT commit dist/).

7. Final commit:
   git add .
   git commit -m "chore: submission ready"

8. Update docs/PROJECT_PROGRESS.md: all phases complete, final commit hash recorded.
9. Update CHAT_HANDOFF.md: mark project as COMPLETE.

Commit: "chore: submission ready"

MANUAL STEP REQUIRED:
  Action: Push to GitHub and verify the repo is public or shared with the recruiter.
  Reason: AI cannot push to GitHub without credentials.
  Resume: Project is submission-ready. No further prompts needed.
```

**Gate:** All smoke tests pass. `npm run build` exits 0. Final commit on main.

---

## Prompt Reference Index

| Prompt | Phase | Description |
|---|---|---|
| 01 | P0 | Vite init + dependencies + Tailwind |
| 02 | P0 | Folder structure + all type definitions |
| 03 | P1 | Zustand store + node defaults |
| 04 | P2 | App layout shell + UI primitives |
| 05 | P2 | Sidebar + draggable node toolbox |
| 06 | P2 | WorkflowCanvas + drag-drop + connect |
| 07 | P3 | All 5 custom node components |
| 08 | P4 | Drawer shell + FormField + KeyValueEditor |
| 09 | P4 | Start + Task + Approval forms |
| 10 | P4 | Automated + End forms + drawer finalization |
| 11 | P5 | Mock simulate API + topological walk |
| 12 | P6 | Sandbox panel + execution log UI |
| 13 | P7 | Graph validation engine |
| 14 | P8 | Undo/redo + keyboard shortcuts |
| 15 | P9 | Export + import + localStorage autosave |
| 16 | P10 | Node hover actions + empty states + typography |
| 17 | P10 | Theme finalization + animations + responsive |
| 18 | P11 | TypeScript zero-error audit + lint |
| 19 | P12 | React Flow render optimization |
| 20 | P13 | Mock workflow seed data |
| 21 | P14 | Recruiter-ready README |
| 22 | P15 | Final quality gate + production build |

---

## Fresh Chat Checkpoints

| After Prompt | Start Fresh? |
|---|---|
| 06 | Yes - context gets heavy after canvas wiring |
| 07 | Optional - if context is still light, continue |
| 10 | Yes - forms are verbose |
| 14 | Yes - new phase, new context |
| 21 | Yes - docs phase, clean context preferred |

Rule: If agent responses feel slow, truncated, or start repeating itself, start a new chat. Paste docs/CHAT_HANDOFF.md as first message.

---

## Stop Points

| After Prompt | Why Stop |
|---|---|
| 06 | Verify drag-drop before building nodes on top of it |
| 09 | Verify live form updates before going further |
| 12 | Verify full simulate flow before adding validation |
| 18 | Zero TypeScript errors required before optimization |
| 22 | Final - check everything before pushing |
