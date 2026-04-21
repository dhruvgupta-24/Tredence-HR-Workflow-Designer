import type { NodeTypes } from '@xyflow/react'
import { StartNode } from './StartNode'
import { TaskNode } from './TaskNode'
import { ApprovalNode } from './ApprovalNode'
import { AutomatedNode } from './AutomatedNode'
import { EndNode } from './EndNode'

// Defined at module level so React Flow does not recreate this map on each render
export const nodeTypes: NodeTypes = {
  start: StartNode as NodeTypes[string],
  task: TaskNode as NodeTypes[string],
  approval: ApprovalNode as NodeTypes[string],
  automated: AutomatedNode as NodeTypes[string],
  end: EndNode as NodeTypes[string],
}
