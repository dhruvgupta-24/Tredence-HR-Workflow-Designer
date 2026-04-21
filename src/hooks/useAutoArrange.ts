import { useCallback } from 'react'
import type { Edge } from '@xyflow/react'
import { useWorkflowStore } from '../store'
import type { WorkflowNode } from '../types'

const H_GAP = 260  // px between columns
const V_GAP = 160  // px between rows

function computeLayout(nodes: WorkflowNode[], edges: Edge[]): WorkflowNode[] {
  if (nodes.length === 0) return nodes

  // Build adjacency + in-degree
  const adj: Record<string, string[]> = {}
  const inDeg: Record<string, number> = {}
  for (const n of nodes) { adj[n.id] = []; inDeg[n.id] = 0 }
  for (const e of edges) {
    adj[e.source]?.push(e.target)
    inDeg[e.target] = (inDeg[e.target] ?? 0) + 1
  }

  // Kahn's BFS — assign level = longest path from any source
  const levelMap = new Map<string, number>()
  const queue: string[] = nodes.filter((n) => (inDeg[n.id] ?? 0) === 0).map((n) => n.id)
  for (const id of queue) levelMap.set(id, 0)

  let qi = 0
  while (qi < queue.length) {
    const cur = queue[qi++]!
    const curLvl = levelMap.get(cur) ?? 0
    for (const next of adj[cur] ?? []) {
      const newLvl = curLvl + 1
      if (!levelMap.has(next)) queue.push(next)
      levelMap.set(next, Math.max(levelMap.get(next) ?? 0, newLvl))
    }
  }

  // Assign level 0 to any orphan nodes
  for (const n of nodes) {
    if (!levelMap.has(n.id)) levelMap.set(n.id, 0)
  }

  // Group nodes by level
  const byLevel = new Map<number, string[]>()
  for (const [id, level] of levelMap) {
    if (!byLevel.has(level)) byLevel.set(level, [])
    byLevel.get(level)!.push(id)
  }

  // Compute positions — centred vertically per column
  const posMap = new Map<string, { x: number; y: number }>()
  for (const [level, ids] of byLevel) {
    const totalH = (ids.length - 1) * V_GAP
    ids.forEach((id, i) => {
      posMap.set(id, {
        x: level * H_GAP + 80,
        y: i * V_GAP - totalH / 2 + 400,
      })
    })
  }

  return nodes.map((n) => {
    const pos = posMap.get(n.id)
    return pos ? { ...n, position: pos } : n
  })
}

export function useAutoArrange() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const setNodes = useWorkflowStore((s) => s.setNodes)
  const saveSnapshot = useWorkflowStore((s) => s.saveSnapshot)

  return useCallback(() => {
    if (nodes.length === 0) return
    saveSnapshot()
    setNodes(computeLayout(nodes, edges))
  }, [nodes, edges, setNodes, saveSnapshot])
}
