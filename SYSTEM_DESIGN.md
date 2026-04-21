# System Design
## HR Workflow Designer

---

## Architecture Overview

```
+------------------+       +-------------------+       +------------------+
|   Sidebar        |       |   Canvas           |       |  Edit Panel      |
|   (Toolbox)      +------->   (React Flow)     <-------+  (Right Drawer)  |
|   Draggable      |       |   Nodes + Edges    |       |  Dynamic Form    |
|   Node Types     |       |   Pan/Zoom         |       |  Save to Store   |
+------------------+       +-------------------+       +------------------+
                                    |
                                    v
                           +------------------+
                           |   Zustand Store  |
                           |   nodes[]        |
                           |   edges[]        |
                           |   selectedNode   |
                           +------------------+
                                    |
                                    v
                           +------------------+
                           |   Sandbox Panel  |
                           |   POST /simulate |
                           |   Execution Log  |
                           +------------------+
```

---

## Data Flow

1. User drags node type from sidebar onto canvas
2. `onDrop` handler creates new node with default data, adds to Zustand store
3. User clicks node to select it
4. Right panel opens, renders form based on `node.type`
5. User edits form fields, changes flow into `useWorkflowStore.updateNodeData()`
6. User draws edge between nodes, stored in `edges[]`
7. User clicks Run Workflow
8. Validation runs over `nodes + edges`
9. If valid, POST /simulate called with serialized graph
10. Execution log rendered in sandbox panel

---

## Mock API Design

### GET /automations

Returns available automated actions.

```json
[
  { "id": "send_email", "label": "Send Email", "params": ["to", "subject"] },
  { "id": "generate_doc", "label": "Generate Document", "params": ["template", "recipient"] },
  { "id": "notify_slack", "label": "Notify Slack", "params": ["channel", "message"] },
  { "id": "update_hris", "label": "Update HRIS Record", "params": ["employee_id", "field", "value"] }
]
```

### POST /simulate

Input: `{ nodes: Node[], edges: Edge[] }`

Output:

```json
{
  "success": true,
  "steps": [
    { "step": 1, "label": "Workflow started", "nodeType": "start" },
    { "step": 2, "label": "Task: Upload Documents assigned to Employee", "nodeType": "task" },
    { "step": 3, "label": "Approval requested from Manager", "nodeType": "approval" },
    { "step": 4, "label": "Email sent to hr@company.com", "nodeType": "automated" },
    { "step": 5, "label": "Workflow completed: Onboarding Complete", "nodeType": "end" }
  ]
}
```

---

## Validation Rules

| Rule | Error Message |
|---|---|
| No start node | "Workflow must have a Start node" |
| No end node | "Workflow must have an End node" |
| Orphan node | "Node '{title}' is not connected" |
| Start node has incoming edge | "Start node cannot have incoming connections" |
| End node has outgoing edge | "End node cannot have outgoing connections" |
| Cycle detected | "Workflow contains a cycle" |

---

## State Shape (Zustand)

```typescript
interface WorkflowState {
  nodes: WorkflowNode[]
  edges: Edge[]
  selectedNodeId: string | null
  validationErrors: string[]
  simulationLog: SimulationStep[]
  isSimulating: boolean

  // Actions
  addNode: (node: WorkflowNode) => void
  updateNodeData: (id: string, data: Partial<NodeData>) => void
  removeNode: (id: string) => void
  addEdge: (edge: Edge) => void
  removeEdge: (id: string) => void
  setSelectedNode: (id: string | null) => void
  setNodes: (nodes: WorkflowNode[]) => void
  setEdges: (edges: Edge[]) => void
  setValidationErrors: (errors: string[]) => void
  setSimulationLog: (log: SimulationStep[]) => void
  setIsSimulating: (v: boolean) => void
  resetWorkflow: () => void
}
```
