import type { Edge } from '@xyflow/react'
import type { WorkflowNode } from '../types'

export function validateWorkflow(nodes: WorkflowNode[], edges: Edge[]): string[] {
  const errors: string[] = []

  if (nodes.length === 0) {
    errors.push('Workflow must have at least one node')
    return errors
  }

  const startNodes = nodes.filter((n) => n.type === 'start')
  const endNodes = nodes.filter((n) => n.type === 'end')

  if (startNodes.length === 0) errors.push('Workflow must have a Start node')
  if (startNodes.length > 1) errors.push('Workflow can only have one Start node')
  if (endNodes.length === 0) errors.push('Workflow must have an End node')

  const sourceIds = new Set(edges.map((e) => e.source))
  const targetIds = new Set(edges.map((e) => e.target))

  for (const node of nodes) {
    const hasOutgoing = sourceIds.has(node.id)
    const hasIncoming = targetIds.has(node.id)
    const label = String(node.data.title || node.type)

    if (node.type === 'start') {
      if (!hasOutgoing) errors.push(`Start node "${label}" has no outgoing connection`)
    } else if (node.type === 'end') {
      if (!hasIncoming) errors.push(`End node "${label}" has no incoming connection`)
    } else {
      if (!hasIncoming && !hasOutgoing) {
        errors.push(`Node "${label}" is not connected`)
      } else if (!hasIncoming) {
        errors.push(`Node "${label}" has no incoming connection`)
      } else if (!hasOutgoing) {
        errors.push(`Node "${label}" has no outgoing connection`)
      }
    }
  }

  // Cycle detection via DFS
  if (startNodes.length === 1) {
    const adj: Record<string, string[]> = {}
    for (const n of nodes) adj[n.id] = []
    for (const e of edges) {
      if (adj[e.source]) adj[e.source].push(e.target)
    }

    const visited = new Set<string>()
    const recStack = new Set<string>()
    let cycleFound = false

    const dfs = (id: string): void => {
      visited.add(id)
      recStack.add(id)
      for (const neighbor of adj[id] ?? []) {
        if (recStack.has(neighbor)) {
          cycleFound = true
          return
        }
        if (!visited.has(neighbor)) dfs(neighbor)
        if (cycleFound) return
      }
      recStack.delete(id)
    }

    dfs(startNodes[0]!.id)
    if (cycleFound) errors.push('Workflow contains a cycle')
  }

  return errors
}
