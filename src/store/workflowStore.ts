// Stub - implemented in Phase 1 (Prompt 03)
import { create } from 'zustand'
import type { WorkflowState } from '../types'
import type { Edge } from '@xyflow/react'

export const useWorkflowStore = create<WorkflowState>()((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  validationErrors: [],
  simulationLog: [],
  isSimulating: false,
  automations: [],

  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  updateNodeData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),
  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    })),
  addEdge: (edge: Edge) =>
    set((s) => {
      const exists = s.edges.some(
        (e) => e.source === edge.source && e.target === edge.target
      )
      return exists ? {} : { edges: [...s.edges, edge] }
    }),
  removeEdge: (id) => set((s) => ({ edges: s.edges.filter((e) => e.id !== id) })),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  setSimulationLog: (log) => set({ simulationLog: log }),
  setIsSimulating: (v) => set({ isSimulating: v }),
  setAutomations: (automations) => set({ automations }),
  resetWorkflow: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      validationErrors: [],
      simulationLog: [],
    }),
}))
