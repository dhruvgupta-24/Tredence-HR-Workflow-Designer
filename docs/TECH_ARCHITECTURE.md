# Technical Architecture
## HR Workflow Designer

---

## Stack Versions

| Package | Version |
|---|---|
| react | ^18.2 |
| react-dom | ^18.2 |
| typescript | ^5.2 |
| vite | ^5.0 |
| @xyflow/react | ^12.x (React Flow v12) |
| zustand | ^4.4 |
| tailwindcss | ^3.4 |
| clsx | ^2.0 |
| nanoid | ^5.x |

## Optional Tooling

**Supabase MCP** is connected and available as an optional tool.
- Use only if persistence, auth, or storage creates clear, concrete value.
- Current scope is frontend-first with localStorage and mock APIs.
- Do not add Supabase complexity unless a phase explicitly calls for it.
- Potential future use: persist workflows per user, share workflow URLs, export history.

---

## Folder Structure (Full)

```
hr-workflow-designer/
  public/
  src/
    api/
      automations.ts        # GET /automations mock
      simulate.ts           # POST /simulate mock
      index.ts              # re-exports
    components/
      canvas/
        WorkflowCanvas.tsx  # ReactFlow wrapper, onDrop, onConnect
        CanvasControls.tsx  # Zoom + reset buttons
        index.ts
      nodes/
        StartNode.tsx
        TaskNode.tsx
        ApprovalNode.tsx
        AutomatedNode.tsx
        EndNode.tsx
        nodeTypes.ts        # nodeTypes map for ReactFlow
        index.ts
      forms/
        StartNodeForm.tsx
        TaskNodeForm.tsx
        ApprovalNodeForm.tsx
        AutomatedNodeForm.tsx
        EndNodeForm.tsx
        KeyValueEditor.tsx  # Reusable key-value pair editor
        FormField.tsx       # Reusable labeled input
        index.ts
      sidebar/
        Sidebar.tsx         # Left panel container
        NodeToolbox.tsx     # Draggable node type list
        DraggableNode.tsx   # Single draggable item
        index.ts
      sandbox/
        SandboxPanel.tsx    # Bottom/right panel with run + log
        ExecutionLog.tsx    # Step-by-step results
        index.ts
      ui/
        Button.tsx
        Input.tsx
        Select.tsx
        Toggle.tsx
        Drawer.tsx          # Right-side edit panel wrapper
        Badge.tsx
        index.ts
    hooks/
      useDragDrop.ts        # onDrop, onDragOver handlers
      useValidation.ts      # Graph validation logic
      useSimulate.ts        # Calls /simulate, handles loading/error
      useAutomations.ts     # Fetches /automations on mount
      useUndoRedo.ts        # Undo/redo stack (bonus)
    store/
      workflowStore.ts      # Main Zustand store
      index.ts
    types/
      nodes.ts              # NodeData variants per node type
      workflow.ts           # WorkflowState, SimulationStep
      api.ts                # AutomationAction type
      index.ts
    utils/
      validation.ts         # Pure validation functions
      serialization.ts      # Graph to JSON and back
      nodeDefaults.ts       # Default data per node type
      idGenerator.ts        # nanoid wrapper
    pages/
      WorkflowBuilderPage.tsx
    App.tsx
    main.tsx
    index.css
  tailwind.config.ts
  tsconfig.json
  vite.config.ts
  package.json
  README.md
```

---

## Layout Structure

```
+------------------+----------------------------------+------------------+
|   Left Nav       |   Canvas (React Flow)            |  Right Panel     |
|   (220px)        |   Drag-drop area                 |  (320px)         |
|                  |   Pan / zoom                     |                  |
|   Node Toolbox   |   Nodes + Edges                  |  Edit Drawer     |
|   Draggable      |   Background grid                |  (when selected) |
|   node types     |                                  |                  |
|                  |                                  |  Sandbox Panel   |
|                  |                                  |  (Run Workflow)  |
+------------------+----------------------------------+------------------+
```

UI reference from Tredence PDF shows:
- Dark/neutral left sidebar with nav sections (General, Automation, Resources)
- Clean white/light canvas with grid background
- Right panel for details/performance metrics
- Adapt: left sidebar = node toolbox, right panel = edit form + sandbox

## Component Responsibilities

### WorkflowCanvas.tsx
- Wraps `<ReactFlow>` with `nodeTypes`, `nodes`, `edges` from store
- Handles `onNodesChange`, `onEdgesChange` via React Flow helpers
- Handles `onDrop` (creates node at drop position)
- Handles `onConnect` (creates edge, checks for duplicate)
- Handles `onNodeClick` (sets selectedNodeId in store)
- Passes `onNodesDelete`, `onEdgesDelete` to store

### NodeToolbox.tsx
- Renders list of node types with icons and labels
- Each item has `draggable`, `onDragStart` sets `dataTransfer` type

### Node Components (StartNode, TaskNode, etc.)
- Use `NodeProps<T>` generic from React Flow
- Display summary of key data fields
- Handle (connection points) on appropriate sides
- Visual badge showing node type
- Selected state border highlight

### Forms (StartNodeForm, etc.)
- Pure controlled React forms
- All fields use `useWorkflowStore.updateNodeData`
- No internal local state (source of truth = store)
- Validated fields show inline error text

### SandboxPanel.tsx
- Run button triggers `useSimulate` hook
- Disable button while simulating
- Show spinner during simulate
- Render `<ExecutionLog>` with results

### Drawer.tsx
- Right-side sliding panel
- Renders correct form based on `selectedNode.type`
- Close button sets `selectedNodeId = null`

---

## React Flow Configuration

```typescript
const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
}

// Default edge options
const defaultEdgeOptions = {
  animated: true,
  style: { strokeWidth: 2, stroke: '#6366f1' },
}

// Snap to grid
const snapGrid: [number, number] = [16, 16]
```

---

## TypeScript Node Data Types

```typescript
// Base
interface BaseNodeData {
  title: string
}

// Start
interface StartNodeData extends BaseNodeData {
  metadata: { key: string; value: string }[]
}

// Task
interface TaskNodeData extends BaseNodeData {
  description: string
  assignee: string
  dueDate: string
  customFields: { key: string; value: string }[]
}

// Approval
interface ApprovalNodeData extends BaseNodeData {
  approverRole: 'Manager' | 'HRBP' | 'Director' | 'CEO'
  autoApproveThreshold: number
}

// Automated
interface AutomatedNodeData extends BaseNodeData {
  actionId: string
  actionParams: Record<string, string>
}

// End
interface EndNodeData extends BaseNodeData {
  endMessage: string
  showSummary: boolean
}

type NodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData

type WorkflowNode = Node<NodeData>
```

---

## Key Implementation Notes

1. **Drop handler**: Use `reactFlowInstance.screenToFlowPosition()` to convert drop coordinates
2. **Edge validation**: Prevent connecting two incompatible node types if needed
3. **Form reactivity**: Always read from store, never duplicate into local state
4. **Automation params**: `useAutomations` fetches once, stored in Zustand. AutomatedNodeForm reads from store.
5. **Simulate serialization**: Strip React Flow internal fields, send only `{ id, type, data, position }` per node
6. **ID generation**: Use `crypto.randomUUID()` or `nanoid` for all new node IDs
