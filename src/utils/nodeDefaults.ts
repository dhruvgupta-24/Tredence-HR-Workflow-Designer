import type { NodeData } from '../types'

// Returns default data for each node type.
// Throws if an unknown type is passed.
export function getDefaultData(type: string): NodeData {
  switch (type) {
    case 'start':
      return { title: 'Start', metadata: [] }
    case 'task':
      return {
        title: 'New Task',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      }
    case 'approval':
      return {
        title: 'Approval Gate',
        approverRole: 'Manager',
        autoApproveThreshold: 0,
      }
    case 'automated':
      return {
        title: 'Automated Step',
        actionId: '',
        actionParams: {},
      }
    case 'end':
      return {
        title: 'End',
        endMessage: 'Workflow complete',
        showSummary: false,
      }
    default:
      throw new Error(`Unknown node type: ${type}`)
  }
}
