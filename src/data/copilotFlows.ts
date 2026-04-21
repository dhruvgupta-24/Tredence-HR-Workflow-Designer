import type { Edge, Node } from '@xyflow/react'
import { TEMPLATES } from './templates'

// Use a flexible node type to avoid strict NodeData union constraints.
// WorkflowNode (Node<NodeData>) is satisfied at runtime — all fields are optional in practice.
type FlexNode = Node<Record<string, unknown>>

// WorkflowNode is Node<NodeData>; we cast FlexNode[] to WorkflowNode[] when loading.
type WorkflowNode = FlexNode


export interface CopilotFlow {
  id: string
  name: string
  description: string
  keywords: string[]
  nodes: WorkflowNode[]
  edges: Edge[]
}

// ── Helper to build edges ──────────────────────────────────────────────────
function seq(ids: string[]): Edge[] {
  return ids.slice(0, -1).map((src, i) => ({
    id: `${src}-${ids[i + 1]}`,
    source: src,
    target: ids[i + 1]!,
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
  }))
}

// ── Performance Review ─────────────────────────────────────────────────────
const perfNodes: WorkflowNode[] = [
  { id: 'pr-1', type: 'start',     position: { x: 80,  y: 200 }, data: { title: 'Review Cycle Start', triggerType: 'scheduled' } },
  { id: 'pr-2', type: 'task',      position: { x: 300, y: 200 }, data: { title: 'Set OKRs & KPIs',         assignee: 'HR Team' } },
  { id: 'pr-3', type: 'automated', position: { x: 520, y: 200 }, data: { title: 'Send Self-Assessment Form', action: 'send_email' } },
  { id: 'pr-4', type: 'task',      position: { x: 740, y: 200 }, data: { title: 'Manager Evaluation',       assignee: 'Manager' } },
  { id: 'pr-5', type: 'approval',  position: { x: 960, y: 200 }, data: { title: 'HR Sign-off',              approver: 'HRBP' } },
  { id: 'pr-6', type: 'automated', position: { x: 1180,y: 200 }, data: { title: 'Update Compensation Band', action: 'update_hris' } },
  { id: 'pr-7', type: 'end',       position: { x: 1400,y: 200 }, data: { title: 'Review Complete' } },
]

// ── Hiring / Recruitment ───────────────────────────────────────────────────
const hireNodes: WorkflowNode[] = [
  { id: 'hr-1', type: 'start',     position: { x: 80,  y: 200 }, data: { title: 'Hiring Initiated', triggerType: 'manual' } },
  { id: 'hr-2', type: 'automated', position: { x: 300, y: 200 }, data: { title: 'Post Job Opening',       action: 'create_ticket' } },
  { id: 'hr-3', type: 'task',      position: { x: 520, y: 200 }, data: { title: 'Screen Applicants',       assignee: 'HR Team' } },
  { id: 'hr-4', type: 'approval',  position: { x: 740, y: 200 }, data: { title: 'Technical Interview',     approver: 'Manager' } },
  { id: 'hr-5', type: 'automated', position: { x: 960, y: 200 }, data: { title: 'Send Offer Letter',       action: 'send_email' } },
  { id: 'hr-6', type: 'end',       position: { x: 1180,y: 200 }, data: { title: 'Candidate Onboarded' } },
]

// ── Promotion / Transfer ───────────────────────────────────────────────────
const promoNodes: WorkflowNode[] = [
  { id: 'pm-1', type: 'start',     position: { x: 80,  y: 200 }, data: { title: 'Promotion Request', triggerType: 'manual' } },
  { id: 'pm-2', type: 'task',      position: { x: 300, y: 200 }, data: { title: 'Manager Nomination',    assignee: 'Manager' } },
  { id: 'pm-3', type: 'approval',  position: { x: 520, y: 200 }, data: { title: 'Committee Review',      approver: 'Director' } },
  { id: 'pm-4', type: 'automated', position: { x: 740, y: 200 }, data: { title: 'Update HRIS Role',      action: 'update_hris' } },
  { id: 'pm-5', type: 'automated', position: { x: 960, y: 200 }, data: { title: 'Announce on Slack',     action: 'slack_notify' } },
  { id: 'pm-6', type: 'end',       position: { x: 1180,y: 200 }, data: { title: 'Promotion Confirmed' } },
]

// ── Training & Development ─────────────────────────────────────────────────
const trainNodes: WorkflowNode[] = [
  { id: 'tr-1', type: 'start',     position: { x: 80,  y: 200 }, data: { title: 'Training Request', triggerType: 'manual' } },
  { id: 'tr-2', type: 'task',      position: { x: 300, y: 200 }, data: { title: 'Identify Learning Need',       assignee: 'Manager' } },
  { id: 'tr-3', type: 'automated', position: { x: 520, y: 200 }, data: { title: 'Enroll in LMS Course',         action: 'create_ticket' } },
  { id: 'tr-4', type: 'task',      position: { x: 740, y: 200 }, data: { title: 'Complete Training Program',    assignee: 'Employee' } },
  { id: 'tr-5', type: 'automated', position: { x: 960, y: 200 }, data: { title: 'Issue Completion Certificate', action: 'generate_report' } },
  { id: 'tr-6', type: 'automated', position: { x: 1180,y: 200 }, data: { title: 'Update Learning Record',       action: 'update_hris' } },
  { id: 'tr-7', type: 'end',       position: { x: 1400,y: 200 }, data: { title: 'Training Complete' } },
]

// ── Payroll & Expense ──────────────────────────────────────────────────────
const payNodes: WorkflowNode[] = [
  { id: 'py-1', type: 'start',     position: { x: 80,  y: 200 }, data: { title: 'Payroll Cycle Start', triggerType: 'scheduled' } },
  { id: 'py-2', type: 'task',      position: { x: 300, y: 200 }, data: { title: 'Submit Tax Declarations',    assignee: 'Employee' } },
  { id: 'py-3', type: 'automated', position: { x: 520, y: 200 }, data: { title: 'Process Payroll',            action: 'update_hris' } },
  { id: 'py-4', type: 'approval',  position: { x: 740, y: 200 }, data: { title: 'Finance Director Approval',  approver: 'Director' } },
  { id: 'py-5', type: 'automated', position: { x: 960, y: 200 }, data: { title: 'Initiate Bank Transfer',     action: 'update_hris' } },
  { id: 'py-6', type: 'end',       position: { x: 1180,y: 200 }, data: { title: 'Salaries Disbursed' } },
]

// ── All Copilot flows with keyword matching ────────────────────────────────
export const COPILOT_FLOWS: CopilotFlow[] = [
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: '7-step new hire flow with IT & HR parallel tracks',
    keywords: ['onboard', 'new hire', 'joining', 'induction', 'welcome', 'new employee', 'start'],
    nodes: TEMPLATES[0]!.nodes as WorkflowNode[],
    edges: TEMPLATES[0]!.edges as Edge[],
  },
  {
    id: 'leave',
    name: 'Leave Approval',
    description: 'Leave request with manager sign-off and HRIS update',
    keywords: ['leave', 'vacation', 'pto', 'time off', 'holiday', 'medical', 'sick', 'absent'],
    nodes: TEMPLATES[1]!.nodes as WorkflowNode[],
    edges: TEMPLATES[1]!.edges as Edge[],
  },
  {
    id: 'exit',
    name: 'Exit Process',
    description: 'Offboarding with equipment return and final settlement',
    keywords: ['exit', 'offboard', 'resign', 'termination', 'farewell', 'departure', 'leaving'],
    nodes: TEMPLATES[2]!.nodes as WorkflowNode[],
    edges: TEMPLATES[2]!.edges as Edge[],
  },
  {
    id: 'performance',
    name: 'Performance Review',
    description: '360° appraisal cycle with OKR setting and compensation update',
    keywords: ['performance', 'review', 'appraisal', 'feedback', '360', 'kpi', 'goals', 'evaluation', 'okr'],
    nodes: perfNodes,
    edges: seq(['pr-1','pr-2','pr-3','pr-4','pr-5','pr-6','pr-7']),
  },
  {
    id: 'hiring',
    name: 'Candidate Hiring',
    description: 'End-to-end recruitment from job posting to offer letter',
    keywords: ['hiring', 'recruit', 'interview', 'candidate', 'job', 'applicant', 'talent', 'vacancy'],
    nodes: hireNodes,
    edges: seq(['hr-1','hr-2','hr-3','hr-4','hr-5','hr-6']),
  },
  {
    id: 'promotion',
    name: 'Promotion & Transfer',
    description: 'Career progression with committee approval and Slack notify',
    keywords: ['promotion', 'transfer', 'role change', 'increment', 'raise', 'career', 'level up', 'band'],
    nodes: promoNodes,
    edges: seq(['pm-1','pm-2','pm-3','pm-4','pm-5','pm-6']),
  },
  {
    id: 'training',
    name: 'Training & Development',
    description: 'LMS enrollment to certificate issuance and record update',
    keywords: ['training', 'learning', 'development', 'certification', 'course', 'skill', 'l&d', 'upskill'],
    nodes: trainNodes,
    edges: seq(['tr-1','tr-2','tr-3','tr-4','tr-5','tr-6','tr-7']),
  },
  {
    id: 'payroll',
    name: 'Payroll & Compensation',
    description: 'Monthly payroll cycle with finance approval and bank transfer',
    keywords: ['payroll', 'salary', 'compensation', 'benefits', 'reimbursement', 'expense', 'pay', 'wage'],
    nodes: payNodes,
    edges: seq(['py-1','py-2','py-3','py-4','py-5','py-6']),
  },
]

// ── Match prompt to best flow ──────────────────────────────────────────────
export function matchCopilotFlow(prompt: string): CopilotFlow | null {
  const lower = prompt.toLowerCase()
  let best: CopilotFlow | null = null
  let bestScore = 0

  for (const flow of COPILOT_FLOWS) {
    const score = flow.keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw.toLowerCase()) ? 1 : 0),
      0,
    )
    if (score > bestScore) { bestScore = score; best = flow }
  }
  return best
}
