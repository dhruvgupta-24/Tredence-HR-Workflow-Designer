import type { NodeTypes } from '@xyflow/react'
import { StartNode } from './StartNode'
import { TaskNode } from './TaskNode'
import { ApprovalNode } from './ApprovalNode'
import { AutomatedNode } from './AutomatedNode'
import { EndNode } from './EndNode'

// Defined at module level - must never be recreated inside a component
// or React Flow will remount all nodes on every render.
export const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
}
