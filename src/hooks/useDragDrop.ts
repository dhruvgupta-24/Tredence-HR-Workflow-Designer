import type { ReactFlowInstance } from '@xyflow/react'
import { useCallback } from 'react'
import { generateId } from '../utils/idGenerator'
import { getDefaultData } from '../utils/nodeDefaults'
import { useWorkflowStore } from '../store'
import type { WorkflowNode } from '../types'

export function onDragOver(e: React.DragEvent<HTMLDivElement>) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

export function useDropHandler(reactFlowInstance: ReactFlowInstance | null) {
  const addNode = useWorkflowStore((s) => s.addNode)

  return useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()

      const type = e.dataTransfer.getData('application/reactflow')
      if (!type || !reactFlowInstance) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })

      const newNode: WorkflowNode = {
        id: generateId(),
        type,
        position,
        data: getDefaultData(type),
      }

      addNode(newNode)
    },
    [reactFlowInstance, addNode],
  )
}
