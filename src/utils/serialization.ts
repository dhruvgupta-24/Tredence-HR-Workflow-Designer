import type { Edge } from '@xyflow/react'
import type { WorkflowNode } from '../types'

const STORAGE_KEY = 'hr-workflow-v1'
const SCHEMA_VERSION = '1.0'

interface WorkflowExport {
  version: string
  exportedAt: number
  nodes: WorkflowNode[]
  edges: Edge[]
}

// --- Export ---

export function exportWorkflow(nodes: WorkflowNode[], edges: Edge[]): void {
  const payload: WorkflowExport = {
    version: SCHEMA_VERSION,
    exportedAt: Date.now(),
    nodes,
    edges,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hr-workflow-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// --- Import ---

export function importWorkflow(
  file: File,
  onSuccess: (nodes: WorkflowNode[], edges: Edge[]) => void,
  onError: (msg: string) => void,
): void {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const raw = JSON.parse(e.target?.result as string) as Partial<WorkflowExport>
      if (!Array.isArray(raw.nodes) || !Array.isArray(raw.edges)) {
        onError('Invalid workflow file: missing nodes or edges array')
        return
      }
      onSuccess(raw.nodes, raw.edges)
    } catch {
      onError('Failed to parse workflow file - ensure it is valid JSON')
    }
  }
  reader.readAsText(file)
}

// --- localStorage autosave ---

export function saveToStorage(nodes: WorkflowNode[], edges: Edge[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }))
  } catch {
    // localStorage unavailable or quota exceeded - silently fail
  }
}

export function loadFromStorage(): { nodes: WorkflowNode[]; edges: Edge[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { nodes?: WorkflowNode[]; edges?: Edge[] }
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return null
    return { nodes: parsed.nodes, edges: parsed.edges }
  } catch {
    return null
  }
}
