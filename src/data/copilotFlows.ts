import type { WorkflowNode } from '../types'
import type { Edge } from '@xyflow/react'
import { TEMPLATES } from './templates'

export interface CopilotFlow {
  id: string
  name: string
  description: string
  keywords: string[]
  nodes: WorkflowNode[]
  edges: Edge[]
}

// ── Typed node helpers (mirror templates.ts exactly) ──────────────────────

const startNode = (
  id: string,
  pos: { x: number; y: number },
  title: string,
  metadata: { key: string; value: string }[] = [],
): WorkflowNode => ({
  id, type: 'start', position: pos,
  data: { title, metadata } as WorkflowNode['data'],
})

const taskNode = (
  id: string,
  pos: { x: number; y: number },
  title: string,
  assignee: string,
  description = '',
): WorkflowNode => ({
  id, type: 'task', position: pos,
  data: { title, assignee, dueDate: '', description, customFields: [] } as WorkflowNode['data'],
})

const approvalNode = (
  id: string,
  pos: { x: number; y: number },
  title: string,
  approverRole: 'Manager' | 'HRBP' | 'Director' | 'CEO',
  autoApproveThreshold = 0,
): WorkflowNode => ({
  id, type: 'approval', position: pos,
  data: { title, approverRole, autoApproveThreshold } as WorkflowNode['data'],
})

const automatedNode = (
  id: string,
  pos: { x: number; y: number },
  title: string,
  actionId: string,
  actionParams: Record<string, string> = {},
): WorkflowNode => ({
  id, type: 'automated', position: pos,
  data: { title, actionId, actionParams } as WorkflowNode['data'],
})

const endNode = (
  id: string,
  pos: { x: number; y: number },
  title: string,
  endMessage = '',
  showSummary = true,
): WorkflowNode => ({
  id, type: 'end', position: pos,
  data: { title, endMessage, showSummary } as WorkflowNode['data'],
})

const edge = (id: string, source: string, target: string): Edge => ({
  id, source, target, animated: true,
  style: { strokeWidth: 2, stroke: '#6366f1' },
})

// ── Performance Review ─────────────────────────────────────────────────────
const perfNodes: WorkflowNode[] = [
  startNode('pr-1', { x: 80,   y: 200 }, 'Review Cycle Start', [{ key: 'Quarter', value: '' }]),
  taskNode ('pr-2', { x: 300,  y: 200 }, 'Set OKRs & KPIs',         'HR Team',  'Define goals and success metrics for the review cycle'),
  automatedNode('pr-3', { x: 520, y: 200 }, 'Send Self-Assessment Form', 'send_email',   { template: 'self_assessment' }),
  taskNode ('pr-4', { x: 740,  y: 200 }, 'Manager Evaluation',      'Manager',  'Score employee performance against agreed KPIs'),
  approvalNode('pr-5', { x: 960, y: 200 }, 'HR Sign-off',            'HRBP'),
  automatedNode('pr-6', { x: 1180,y: 200 }, 'Update Compensation Band','update_hris', { field: 'compensation_band', value: 'auto' }),
  endNode  ('pr-7', { x: 1400, y: 200 }, 'Review Complete', 'Performance cycle closed and compensation updated. ✓'),
]
const perfEdges = [
  edge('pr-e1','pr-1','pr-2'), edge('pr-e2','pr-2','pr-3'),
  edge('pr-e3','pr-3','pr-4'), edge('pr-e4','pr-4','pr-5'),
  edge('pr-e5','pr-5','pr-6'), edge('pr-e6','pr-6','pr-7'),
]

// ── Hiring / Recruitment ───────────────────────────────────────────────────
const hireNodes: WorkflowNode[] = [
  startNode('hr-1', { x: 80,   y: 200 }, 'Hiring Initiated', [{ key: 'Role', value: '' }, { key: 'Department', value: '' }]),
  automatedNode('hr-2', { x: 300,  y: 200 }, 'Post Job Opening', 'create_ticket', { platform: 'LinkedIn, Naukri', priority: 'High' }),
  taskNode ('hr-3', { x: 520,  y: 200 }, 'Screen Applicants',    'HR Team',  'Review CVs and shortlist qualified candidates'),
  approvalNode('hr-4', { x: 740, y: 200 }, 'Technical Interview', 'Manager'),
  automatedNode('hr-5', { x: 960, y: 200 }, 'Send Offer Letter',  'send_email',   { template: 'offer_letter' }),
  endNode  ('hr-6', { x: 1180, y: 200 }, 'Candidate Onboarded', 'Hiring complete — candidate has accepted and onboarded successfully! 🎉'),
]
const hireEdges = [
  edge('hr-e1','hr-1','hr-2'), edge('hr-e2','hr-2','hr-3'),
  edge('hr-e3','hr-3','hr-4'), edge('hr-e4','hr-4','hr-5'),
  edge('hr-e5','hr-5','hr-6'),
]

// ── Promotion / Transfer ───────────────────────────────────────────────────
const promoNodes: WorkflowNode[] = [
  startNode('pm-1', { x: 80,   y: 200 }, 'Promotion Request', [{ key: 'Employee', value: '' }, { key: 'Target Band', value: '' }]),
  taskNode ('pm-2', { x: 300,  y: 200 }, 'Manager Nomination',   'Manager',  'Justify promotion with performance evidence and peer feedback'),
  approvalNode('pm-3', { x: 520, y: 200 }, 'Committee Review',   'Director'),
  automatedNode('pm-4', { x: 740, y: 200 }, 'Update HRIS Role',  'update_hris',  { field: 'job_grade', value: 'auto' }),
  automatedNode('pm-5', { x: 960, y: 200 }, 'Announce on Slack', 'slack_notify', { channel: '#announcements', template: 'promotion' }),
  endNode  ('pm-6', { x: 1180, y: 200 }, 'Promotion Confirmed', 'Role updated and team notified. Congratulations! 🚀'),
]
const promoEdges = [
  edge('pm-e1','pm-1','pm-2'), edge('pm-e2','pm-2','pm-3'),
  edge('pm-e3','pm-3','pm-4'), edge('pm-e4','pm-4','pm-5'),
  edge('pm-e5','pm-5','pm-6'),
]

// ── Training & Development ─────────────────────────────────────────────────
const trainNodes: WorkflowNode[] = [
  startNode('tr-1', { x: 80,   y: 200 }, 'Training Request', [{ key: 'Employee', value: '' }, { key: 'Course', value: '' }]),
  taskNode ('tr-2', { x: 300,  y: 200 }, 'Identify Learning Need',      'Manager',  'Map skill gap to available training programs'),
  automatedNode('tr-3', { x: 520, y: 200 }, 'Enroll in LMS Course',     'create_ticket', { platform: 'LMS', priority: 'Normal' }),
  taskNode ('tr-4', { x: 740,  y: 200 }, 'Complete Training Program',   'Employee', 'Attend sessions and complete all assessments'),
  automatedNode('tr-5', { x: 960, y: 200 }, 'Issue Completion Certificate', 'generate_report', { type: 'certificate' }),
  automatedNode('tr-6', { x: 1180,y: 200 }, 'Update Learning Record',   'update_hris', { field: 'learning_record', value: 'auto' }),
  endNode  ('tr-7', { x: 1400, y: 200 }, 'Training Complete', 'Certificate issued and learning record updated. ✓'),
]
const trainEdges = [
  edge('tr-e1','tr-1','tr-2'), edge('tr-e2','tr-2','tr-3'),
  edge('tr-e3','tr-3','tr-4'), edge('tr-e4','tr-4','tr-5'),
  edge('tr-e5','tr-5','tr-6'), edge('tr-e6','tr-6','tr-7'),
]

// ── Payroll & Compensation ─────────────────────────────────────────────────
const payNodes: WorkflowNode[] = [
  startNode('py-1', { x: 80,   y: 200 }, 'Payroll Cycle Start', [{ key: 'Month', value: '' }, { key: 'Year', value: '' }]),
  taskNode ('py-2', { x: 300,  y: 200 }, 'Submit Tax Declarations', 'Employee', 'Declare investments, HRA claims, and other tax-saving details'),
  automatedNode('py-3', { x: 520, y: 200 }, 'Process Payroll', 'update_hris',  { field: 'payroll_run', value: 'auto' }),
  approvalNode('py-4', { x: 740, y: 200 }, 'Finance Director Approval', 'Director'),
  automatedNode('py-5', { x: 960, y: 200 }, 'Initiate Bank Transfer', 'update_hris', { field: 'bank_transfer', value: 'initiated' }),
  endNode  ('py-6', { x: 1180, y: 200 }, 'Salaries Disbursed', 'Payroll complete — salaries credited to all employee accounts. ✓'),
]
const payEdges = [
  edge('py-e1','py-1','py-2'), edge('py-e2','py-2','py-3'),
  edge('py-e3','py-3','py-4'), edge('py-e4','py-4','py-5'),
  edge('py-e5','py-5','py-6'),
]

// ── All 8 Copilot Flows ────────────────────────────────────────────────────
export const COPILOT_FLOWS: CopilotFlow[] = [
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: '7-step new hire flow with IT & HR parallel tracks',
    keywords: ['onboard', 'new hire', 'joining', 'induction', 'welcome', 'new employee'],
    nodes: TEMPLATES[0]!.nodes,
    edges: TEMPLATES[0]!.edges,
  },
  {
    id: 'leave',
    name: 'Leave Approval',
    description: 'Leave request with manager sign-off and HRIS update',
    keywords: ['leave', 'vacation', 'pto', 'time off', 'holiday', 'medical', 'sick', 'absent'],
    nodes: TEMPLATES[1]!.nodes,
    edges: TEMPLATES[1]!.edges,
  },
  {
    id: 'exit',
    name: 'Exit Process',
    description: 'Offboarding with equipment return and final settlement',
    keywords: ['exit', 'offboard', 'resign', 'termination', 'farewell', 'departure', 'leaving', 'quit'],
    nodes: TEMPLATES[2]!.nodes,
    edges: TEMPLATES[2]!.edges,
  },
  {
    id: 'performance',
    name: 'Performance Review',
    description: '360° appraisal cycle with OKR setting and compensation update',
    keywords: ['performance', 'review', 'appraisal', 'feedback', '360', 'kpi', 'goals', 'evaluation', 'okr', 'appraise'],
    nodes: perfNodes,
    edges: perfEdges,
  },
  {
    id: 'hiring',
    name: 'Candidate Hiring',
    description: 'End-to-end recruitment from job posting to offer letter',
    keywords: ['hiring', 'recruit', 'interview', 'candidate', 'job', 'applicant', 'talent', 'vacancy', 'hire'],
    nodes: hireNodes,
    edges: hireEdges,
  },
  {
    id: 'promotion',
    name: 'Promotion & Transfer',
    description: 'Career progression with committee approval and Slack notify',
    keywords: ['promotion', 'transfer', 'role change', 'increment', 'raise', 'career', 'level up', 'band', 'promote'],
    nodes: promoNodes,
    edges: promoEdges,
  },
  {
    id: 'training',
    name: 'Training & Development',
    description: 'LMS enrollment to certificate issuance and record update',
    keywords: ['training', 'learning', 'development', 'certification', 'course', 'skill', 'upskill', 'lms'],
    nodes: trainNodes,
    edges: trainEdges,
  },
  {
    id: 'payroll',
    name: 'Payroll & Compensation',
    description: 'Monthly payroll cycle with finance approval and bank transfer',
    keywords: ['payroll', 'salary', 'compensation', 'benefits', 'reimbursement', 'expense', 'pay', 'wage'],
    nodes: payNodes,
    edges: payEdges,
  },
]

// ── Keyword-match the best flow for a prompt ───────────────────────────────
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
