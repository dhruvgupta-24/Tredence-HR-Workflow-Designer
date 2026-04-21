import type { Node, Edge } from '@xyflow/react'
import type { NodeData } from './nodes'
import type { AutomationAction } from './api'

// A workflow node is a React Flow Node with our NodeData type
export type WorkflowNode = Node<NodeData>

// Snapshot used for undo/redo history
export interface WorkflowSnapshot {
  nodes: WorkflowNode[]
  edges: Edge[]
}

// One step in a simulation execution log
export interface SimulationStep {
  step: number
  label: string
  nodeType: string
  nodeId: string        // which node is executing at this step
}

// Result returned by POST /simulate
export interface SimulationResult {
  success: boolean
  steps?: SimulationStep[]
  error?: string
}

// Full Zustand store shape
export interface WorkflowState {
  nodes: WorkflowNode[]
  edges: Edge[]
  selectedNodeId: string | null
  validationErrors: string[]
  simulationLog: SimulationStep[]
  isSimulating: boolean
  automations: AutomationAction[]
  highlightedNodeId: string | null   // animated playback highlight

  // Node actions
  addNode: (node: WorkflowNode) => void
  updateNodeData: (id: string, data: Partial<NodeData>) => void
  removeNode: (id: string) => void

  // Edge actions
  addEdge: (edge: Edge) => void
  removeEdge: (id: string) => void

  // Selection
  setSelectedNode: (id: string | null) => void

  // Batch setters (used by React Flow change handlers)
  setNodes: (nodes: WorkflowNode[]) => void
  setEdges: (edges: Edge[]) => void

  // Simulation / validation
  setValidationErrors: (errors: string[]) => void
  setSimulationLog: (log: SimulationStep[]) => void
  setIsSimulating: (v: boolean) => void
  setHighlightedNodeId: (id: string | null) => void

  // Automations
  setAutomations: (automations: AutomationAction[]) => void

  // Undo/Redo history
  past: WorkflowSnapshot[]
  future: WorkflowSnapshot[]
  saveSnapshot: () => void
  undo: () => void
  redo: () => void

  // Reset
  resetWorkflow: () => void

  // fitView trigger (incremented to signal WorkflowCanvas to call fitView)
  fitViewCounter: number
  triggerFitView: () => void
}
