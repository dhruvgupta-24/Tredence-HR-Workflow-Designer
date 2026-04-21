import { create } from 'zustand'
import type { WorkflowState, WorkflowSnapshot } from '../types'
import type { Edge } from '@xyflow/react'
import { loadFromStorage } from '../utils/serialization'

const MAX_HISTORY = 30

// Load persisted state synchronously before store creation (avoids effect timing issues)
const persisted = loadFromStorage()

export const useWorkflowStore = create<WorkflowState>()((set) => ({
  // --- Initial state ---
  nodes: persisted?.nodes ?? [],
  edges: persisted?.edges ?? [],
  selectedNodeId: null,
  validationErrors: [],
  simulationLog: [],
  isSimulating: false,
  automations: [],
  highlightedNodeId: null,
  completedNodeIds: [],
  past: [],
  future: [],
  fitViewCounter: 0,

  // --- Node actions ---
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  updateNodeData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    })),
  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    })),

  // --- Edge actions ---
  addEdge: (edge: Edge) =>
    set((s) => {
      const exists = s.edges.some(
        (e) => e.source === edge.source && e.target === edge.target,
      )
      return exists ? {} : { edges: [...s.edges, edge] }
    }),
  removeEdge: (id) => set((s) => ({ edges: s.edges.filter((e) => e.id !== id) })),

  // --- Selection ---
  setSelectedNode: (id) => set({ selectedNodeId: id }),

  // --- Batch setters (used by React Flow change handlers) ---
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  // --- Simulation / validation ---
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  setSimulationLog: (log) => set({ simulationLog: log }),
  setIsSimulating: (v) => set({ isSimulating: v }),
  setHighlightedNodeId: (id) => set({ highlightedNodeId: id }),
  setCompletedNodeIds: (ids) => set({ completedNodeIds: ids }),
  addCompletedNode: (id) => set((s) => ({ completedNodeIds: [...s.completedNodeIds, id] })),
  clearCompletedNodes: () => set({ completedNodeIds: [] }),

  // --- Automations ---
  setAutomations: (automations) => set({ automations }),

  // --- Undo/Redo ---
  saveSnapshot: () =>
    set((s) => ({
      past: [...s.past.slice(-(MAX_HISTORY - 1)), { nodes: s.nodes, edges: s.edges }],
      future: [],
    })),

  undo: () =>
    set((s) => {
      if (s.past.length === 0) return {}
      const previous = s.past[s.past.length - 1] as WorkflowSnapshot
      return {
        past: s.past.slice(0, -1),
        future: [
          { nodes: s.nodes, edges: s.edges },
          ...s.future.slice(0, MAX_HISTORY - 1),
        ],
        nodes: previous.nodes,
        edges: previous.edges,
        selectedNodeId: null,
      }
    }),

  redo: () =>
    set((s) => {
      if (s.future.length === 0) return {}
      const next = s.future[0] as WorkflowSnapshot
      return {
        future: s.future.slice(1),
        past: [...s.past.slice(-(MAX_HISTORY - 1)), { nodes: s.nodes, edges: s.edges }],
        nodes: next.nodes,
        edges: next.edges,
        selectedNodeId: null,
      }
    }),

  // --- Reset ---
  resetWorkflow: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      validationErrors: [],
      simulationLog: [],
      highlightedNodeId: null,
      completedNodeIds: [],
      past: [],
      future: [],
    }),

  triggerFitView: () => set((s) => ({ fitViewCounter: s.fitViewCounter + 1 })),
}));
