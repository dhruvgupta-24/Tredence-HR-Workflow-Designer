// Base
export interface BaseNodeData {
  title: string
  [key: string]: unknown
}

// Start Node
export interface StartNodeData extends BaseNodeData {
  metadata: { key: string; value: string }[]
}

// Task Node
export interface TaskNodeData extends BaseNodeData {
  description: string
  assignee: string
  dueDate: string
  customFields: { key: string; value: string }[]
}

// Approval Node
export interface ApprovalNodeData extends BaseNodeData {
  approverRole: 'Manager' | 'HRBP' | 'Director' | 'CEO'
  autoApproveThreshold: number
}

// Automated Step Node
export interface AutomatedNodeData extends BaseNodeData {
  actionId: string
  actionParams: Record<string, string>
}

// End Node
export interface EndNodeData extends BaseNodeData {
  endMessage: string
  showSummary: boolean
}

// Union type for all node data variants
export type NodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData

