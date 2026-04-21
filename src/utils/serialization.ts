// Stub - implemented in Phase 9 (Prompt 15)
import type { WorkflowNode } from '../types'
import type { Edge } from '@xyflow/react'

export interface SerializedWorkflow {
  version: string
  nodes: WorkflowNode[]
  edges: Edge[]
}

export function serializeWorkflow(nodes: WorkflowNode[], edges: Edge[]): SerializedWorkflow {
  return { version: '1.0', nodes, edges }
}

export function deserializeWorkflow(_raw: unknown): { nodes: WorkflowNode[]; edges: Edge[] } | null {
  return null
}
