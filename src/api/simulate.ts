import type { Edge } from '@xyflow/react'
import type { WorkflowNode, SimulationResult, SimulationStep } from '../types'
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '../types'

export async function simulateWorkflow(
  nodes: WorkflowNode[],
  edges: Edge[],
): Promise<SimulationResult> {
  await new Promise((r) => setTimeout(r, 300))

  const startNode = nodes.find((n) => n.type === 'start')
  if (!startNode) return { success: false, error: 'No Start node found' }

  // Build adjacency list
  const adj: Record<string, string[]> = {}
  for (const n of nodes) adj[n.id] = []
  for (const e of edges) {
    if (adj[e.source]) adj[e.source].push(e.target)
  }

  // BFS from start node
  const visited: string[] = []
  const queue: string[] = [startNode.id]
  const seen = new Set<string>()

  while (queue.length > 0) {
    const current = queue.shift()!
    if (seen.has(current)) continue
    seen.add(current)
    visited.push(current)
    for (const neighbor of adj[current] ?? []) {
      if (!seen.has(neighbor)) queue.push(neighbor)
    }
  }

  const steps: SimulationStep[] = visited.map((id, index) => {
    const node = nodes.find((n) => n.id === id)!
    return {
      step: index + 1,
      label: buildStepLabel(node),
      nodeType: node.type ?? 'unknown',
      nodeId: id,           // now included for highlight animation
    }
  })

  return { success: true, steps }
}

function buildStepLabel(node: WorkflowNode): string {
  const { type, data } = node
  switch (type) {
    case 'start': {
      const d = data as StartNodeData
      return `Workflow started: "${d.title}"`
    }
    case 'task': {
      const d = data as TaskNodeData
      return `Task assigned: "${d.title}" → ${d.assignee || 'Unassigned'}`
    }
    case 'approval': {
      const d = data as ApprovalNodeData
      const auto = d.autoApproveThreshold > 0 ? ` (auto at ${d.autoApproveThreshold}%)` : ''
      return `Approval required: ${d.approverRole}${auto}`
    }
    case 'automated': {
      const d = data as AutomatedNodeData
      return `Automated: ${d.actionId ? `"${d.actionId}"` : d.title}`
    }
    case 'end': {
      const d = data as EndNodeData
      return `Completed: "${d.endMessage || d.title}"`
    }
    default:
      return `Processed: ${String(data.title)}`
  }
}
