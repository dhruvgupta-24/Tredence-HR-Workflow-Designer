import type { WorkflowNode } from '../types'
import type { Edge } from '@xyflow/react'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  icon: string
  nodes: WorkflowNode[]
  edges: Edge[]
}

// Helpers - typed per node kind
const startNode = (
  id: string,
  pos: { x: number; y: number },
  title: string,
  metadata: { key: string; value: string }[] = [],
): WorkflowNode => ({
  id,
  type: 'start',
  position: pos,
  data: { title, metadata } as WorkflowNode['data'],
})

const taskNode = (
  id: string,
  pos: { x: number; y: number },
  title: string,
  assignee: string,
  description = '',
): WorkflowNode => ({
  id,
  type: 'task',
  position: pos,
  data: { title, assignee, dueDate: '', description, customFields: [] } as WorkflowNode['data'],
})

const approvalNode = (
  id: string,
  pos: { x: number; y: number },
  title: string,
  approverRole: 'Manager' | 'HRBP' | 'Director' | 'CEO',
  autoApproveThreshold = 0,
): WorkflowNode => ({
  id,
  type: 'approval',
  position: pos,
  data: { title, approverRole, autoApproveThreshold } as WorkflowNode['data'],
})

const automatedNode = (
  id: string,
  pos: { x: number; y: number },
  title: string,
  actionId: string,
  actionParams: Record<string, string> = {},
): WorkflowNode => ({
  id,
  type: 'automated',
  position: pos,
  data: { title, actionId, actionParams } as WorkflowNode['data'],
})

const endNode = (
  id: string,
  pos: { x: number; y: number },
  title: string,
  endMessage: string,
  showSummary = true,
): WorkflowNode => ({
  id,
  type: 'end',
  position: pos,
  data: { title, endMessage, showSummary } as WorkflowNode['data'],
})

const edge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
  animated: true,
  style: { strokeWidth: 2, stroke: '#6366f1' },
})

// ─── Template 1: Employee Onboarding ─────────────────────────
const onboardingNodes: WorkflowNode[] = [
  startNode('ob-1', { x: 300, y: 50 }, 'Onboarding Started', [
    { key: 'Employee ID', value: '' },
    { key: 'Department', value: '' },
  ]),
  taskNode('ob-2', { x: 300, y: 230 }, 'Complete Paperwork', 'HR Team',
    'Employee submits joining forms, ID proofs, and bank details'),
  approvalNode('ob-3', { x: 300, y: 410 }, 'Manager Sign-off', 'Manager'),
  automatedNode('ob-4', { x: 80, y: 590 }, 'Create HRIS Account', 'create_ticket', {
    title: 'New HRIS Account', priority: 'High', assignee: 'IT Admin',
  }),
  taskNode('ob-5', { x: 520, y: 590 }, 'IT Equipment Setup', 'IT Team',
    'Provision laptop, VPN access, and required software licenses'),
  automatedNode('ob-6', { x: 300, y: 770 }, 'Send Welcome Email', 'send_email', {
    to: 'employee@company.com', subject: 'Welcome to the team!', template: 'welcome',
  }),
  endNode('ob-7', { x: 300, y: 950 }, 'Onboarding Complete',
    'Employee is fully onboarded and ready to contribute. Welcome aboard! 🎉'),
]

const onboardingEdges: Edge[] = [
  edge('ob-e1', 'ob-1', 'ob-2'),
  edge('ob-e2', 'ob-2', 'ob-3'),
  edge('ob-e3', 'ob-3', 'ob-4'),
  edge('ob-e4', 'ob-3', 'ob-5'),
  edge('ob-e5', 'ob-4', 'ob-6'),
  edge('ob-e6', 'ob-5', 'ob-6'),
  edge('ob-e7', 'ob-6', 'ob-7'),
]

// ─── Template 2: Leave Approval ──────────────────────────────
const leaveNodes: WorkflowNode[] = [
  startNode('la-1', { x: 300, y: 50 }, 'Leave Request Submitted', [
    { key: 'Employee', value: '' },
    { key: 'Leave Type', value: '' },
    { key: 'Duration (days)', value: '' },
  ]),
  taskNode('la-2', { x: 300, y: 230 }, 'Fill Leave Form', 'Employee',
    'Complete the leave application with dates and reason'),
  approvalNode('la-3', { x: 300, y: 410 }, 'Manager Approval', 'Manager', 80),
  automatedNode('la-4', { x: 300, y: 590 }, 'Update HRIS Leave Balance', 'update_hris', {
    field: 'leave_balance', value: 'auto',
  }),
  automatedNode('la-5', { x: 300, y: 770 }, 'Notify Team via Slack', 'slack_notify', {
    channel: '#team-updates', message: 'Team member on leave - please plan accordingly.',
  }),
  endNode('la-6', { x: 300, y: 950 }, 'Leave Approved',
    'Leave request approved and recorded. Enjoy your time off! ✈️'),
]

const leaveEdges: Edge[] = [
  edge('la-e1', 'la-1', 'la-2'),
  edge('la-e2', 'la-2', 'la-3'),
  edge('la-e3', 'la-3', 'la-4'),
  edge('la-e4', 'la-4', 'la-5'),
  edge('la-e5', 'la-5', 'la-6'),
]

// ─── Template 3: Exit / Offboarding Process ──────────────────
const exitNodes: WorkflowNode[] = [
  startNode('ex-1', { x: 300, y: 50 }, 'Resignation Received', [
    { key: 'Employee', value: '' },
    { key: 'Last Working Day', value: '' },
  ]),
  taskNode('ex-2', { x: 80, y: 230 }, 'Conduct Exit Interview', 'HR Team',
    'Document reasons for leaving and gather improvement feedback'),
  taskNode('ex-3', { x: 520, y: 230 }, 'Return IT Equipment', 'IT Team',
    'Collect laptop, access cards, and company devices'),
  automatedNode('ex-4', { x: 300, y: 410 }, 'Revoke System Access', 'update_hris', {
    field: 'system_access', value: 'revoked',
  }),
  approvalNode('ex-5', { x: 300, y: 590 }, 'Final Settlement Approval', 'Director'),
  automatedNode('ex-6', { x: 300, y: 770 }, 'Send Farewell Email', 'send_email', {
    to: 'employee@company.com', subject: 'Wishing you all the best!', template: 'farewell',
  }),
  endNode('ex-7', { x: 300, y: 950 }, 'Offboarding Complete',
    'Employee has been fully offboarded. Wishing them the best in their next chapter! 👋'),
]

const exitEdges: Edge[] = [
  edge('ex-e1', 'ex-1', 'ex-2'),
  edge('ex-e2', 'ex-1', 'ex-3'),
  edge('ex-e3', 'ex-2', 'ex-4'),
  edge('ex-e4', 'ex-3', 'ex-4'),
  edge('ex-e5', 'ex-4', 'ex-5'),
  edge('ex-e6', 'ex-5', 'ex-6'),
  edge('ex-e7', 'ex-6', 'ex-7'),
]

// ─── Exported TEMPLATES array ────────────────────────────────
export const TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: '7-step new hire onboarding with parallel IT setup',
    icon: '👤',
    nodes: onboardingNodes,
    edges: onboardingEdges,
  },
  {
    id: 'leave',
    name: 'Leave Approval',
    description: 'Manager sign-off with auto HRIS update and Slack notify',
    icon: '🏖',
    nodes: leaveNodes,
    edges: leaveEdges,
  },
  {
    id: 'exit',
    name: 'Exit Process',
    description: 'Full offboarding with parallel tracks and final settlement',
    icon: '👋',
    nodes: exitNodes,
    edges: exitEdges,
  },
]
