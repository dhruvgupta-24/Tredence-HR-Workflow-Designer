// Stub - implemented in Phase 2 (Prompt 06)
import type { ReactFlowInstance } from '@xyflow/react'
import type { WorkflowNode } from '../types'

export function onDragOver(e: React.DragEvent<HTMLDivElement>) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

export function getDropHandler(_reactFlowInstance: ReactFlowInstance | null) {
  return (_e: React.DragEvent<HTMLDivElement>, _nodes: WorkflowNode[]) => {
    // Implemented in Phase 2
  }
}
