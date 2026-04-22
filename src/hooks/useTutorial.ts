import { useEffect, useState } from 'react'
import { useWorkflowStore } from '../store'
import { getDemoTarget, getCanvasRect, nodeCenter } from '../utils/demoPositions'

// ── Tutorial step animation types ─────────────────────────────────────────────
export type StepAnimType = 'drag' | 'connect' | 'click'

export interface TutorialStep {
  num:       number
  title:     string
  hint:      string
  icon:      string
  animType:  StepAnimType
  fromTarget: string        // data-demo-target of source element
  toTarget:  string | null  // data-demo-target of destination (null = canvas coord below)
  toRF?: { x: number; y: number } // RF canvas position to point at when toTarget is null
}

// ── Tutorial definitions ───────────────────────────────────────────────────────
// BASIC WORKFLOW: Start -> Task -> Connect -> End -> Connect -> Edit -> Run (7 steps + success)
const BASIC_STEPS: TutorialStep[] = [
  {
    num: 1, icon: '▶',
    title: 'Add a Start Node',
    hint: 'Drag the Start Node from the left panel onto the canvas to begin your workflow.',
    animType: 'drag', fromTarget: 'node-start', toTarget: null, toRF: { x: 350, y: 120 },
  },
  {
    num: 2, icon: '☐',
    title: 'Add a Task Node',
    hint: 'Drag a Task node below the Start node to represent a step someone must complete.',
    animType: 'drag', fromTarget: 'node-task', toTarget: null, toRF: { x: 350, y: 300 },
  },
  {
    num: 3, icon: '→',
    title: 'Connect Start to Task',
    hint: 'Drag a connection from the bottom handle of Start to the top handle of Task.',
    animType: 'connect', fromTarget: 'node-start', toTarget: 'node-task', toRF: { x: 350, y: 300 },
  },
  {
    num: 4, icon: '■',
    title: 'Add an End Node',
    hint: 'Drag an End node below the Task to mark where the workflow completes.',
    animType: 'drag', fromTarget: 'node-end', toTarget: null, toRF: { x: 350, y: 480 },
  },
  {
    num: 5, icon: '→',
    title: 'Connect Task to End',
    hint: 'Drag a connection from the Task node down to the End node.',
    animType: 'connect', fromTarget: 'node-task', toTarget: 'node-end', toRF: { x: 350, y: 480 },
  },
  {
    num: 6, icon: '✎',
    title: 'Edit details',
    hint: 'Click the Task Node to select it, then rename the task to "Review Documents".',
    animType: 'click', fromTarget: 'node-task', toTarget: null, toRF: { x: 350, y: 300 },
  },
  {
    num: 7, icon: '⚡',
    title: 'Run simulation',
    hint: 'Click the "Run Workflow" button in the sandbox to simulate your process.',
    animType: 'click', fromTarget: 'run-workflow', toTarget: null, toRF: { x: 350, y: 300 },
  },
]

// LEAVE APPROVAL: Start → Task → Approval → End (7 steps)
const LEAVE_STEPS: TutorialStep[] = [
  {
    num: 1, icon: '▶',
    title: 'Add a Start node',
    hint: 'Drag the Start Node onto the canvas. This represents the employee submitting a leave request.',
    animType: 'drag', fromTarget: 'node-start', toTarget: null, toRF: { x: 350, y: 80 },
  },
  {
    num: 2, icon: '☐',
    title: 'Add a Task node - HR Review',
    hint: 'Drag a Task node to the canvas. This will represent the HR team reviewing the request.',
    animType: 'drag', fromTarget: 'node-task', toTarget: null, toRF: { x: 350, y: 260 },
  },
  {
    num: 3, icon: '⬡',
    title: 'Add an Approval gate',
    hint: 'Drag an Approval Gate for the manager to approve or reject the leave.',
    animType: 'drag', fromTarget: 'node-approval', toTarget: null, toRF: { x: 350, y: 440 },
  },
  {
    num: 4, icon: '■',
    title: 'Add an End node',
    hint: 'Drag an End node to close the workflow once all approvals are done.',
    animType: 'drag', fromTarget: 'node-end', toTarget: null, toRF: { x: 350, y: 620 },
  },
  {
    num: 5, icon: '→',
    title: 'Connect the chain',
    hint: 'Connect Start to Task to Approval to End by dragging between their handles.',
    animType: 'connect', fromTarget: 'node-start', toTarget: 'node-task', toRF: { x: 350, y: 260 },
  },
  {
    num: 6, icon: '✎',
    title: 'Customize approval settings',
    hint: 'Click the Approval node and set the approver role - for example "Line Manager".',
    animType: 'click', fromTarget: 'node-approval', toTarget: null, toRF: { x: 350, y: 440 },
  },
  {
    num: 7, icon: '⚡',
    title: 'Run the simulation',
    hint: 'Click Run Workflow to see the leave approval flow execute end to end.',
    animType: 'click', fromTarget: 'run-workflow', toTarget: null, toRF: { x: 350, y: 440 },
  },
]

// ONBOARDING: Start → Task → Task → End (7 steps)
const ONBOARDING_STEPS: TutorialStep[] = [
  {
    num: 1, icon: '▶',
    title: 'Add a Start node',
    hint: 'The Start node triggers when a new hire\'s offer is accepted.',
    animType: 'drag', fromTarget: 'node-start', toTarget: null, toRF: { x: 350, y: 80 },
  },
  {
    num: 2, icon: '☐',
    title: 'Add: Document Collection',
    hint: 'Drag a Task node for collecting ID, bank, and education documents from the joiner.',
    animType: 'drag', fromTarget: 'node-task', toTarget: null, toRF: { x: 350, y: 260 },
  },
  {
    num: 3, icon: '☐',
    title: 'Add: IT Setup Task',
    hint: 'Add another Task for IT to provision laptop, email, and access credentials.',
    animType: 'drag', fromTarget: 'node-task', toTarget: null, toRF: { x: 350, y: 440 },
  },
  {
    num: 4, icon: '■',
    title: 'Add an End node',
    hint: 'The End node marks the joiner as fully onboarded.',
    animType: 'drag', fromTarget: 'node-end', toTarget: null, toRF: { x: 350, y: 620 },
  },
  {
    num: 5, icon: '→',
    title: 'Connect the flow',
    hint: 'Link Start through both Task nodes to the End by dragging handles in sequence.',
    animType: 'connect', fromTarget: 'node-start', toTarget: 'node-task', toRF: { x: 350, y: 260 },
  },
  {
    num: 6, icon: '✎',
    title: 'Name each step',
    hint: 'Click each Task node and give them descriptive names and assignees.',
    animType: 'click', fromTarget: 'node-task', toTarget: null, toRF: { x: 350, y: 260 },
  },
  {
    num: 7, icon: '⚡',
    title: 'Simulate onboarding',
    hint: 'Click Run Workflow to validate and simulate the entire onboarding sequence.',
    animType: 'click', fromTarget: 'run-workflow', toTarget: null, toRF: { x: 350, y: 260 },
  },
]

export type TutorialType = 'basic' | 'leave' | 'onboarding'

export const TUTORIAL_CATALOG: {
  id: TutorialType
  title: string
  description: string
  icon: string
  steps: TutorialStep[]
}[] = [
  {
    id: 'basic',
    title: 'Basic Workflow',
    description: 'Build your first Start → Task → End flow in 6 steps.',
    icon: '⬡',
    steps: BASIC_STEPS,
  },
  {
    id: 'leave',
    title: 'Leave Approval',
    description: 'Model an employee leave request with manager approval gate.',
    icon: '✓',
    steps: LEAVE_STEPS,
  },
  {
    id: 'onboarding',
    title: 'Employee Onboarding',
    description: 'Sequence document collection and IT setup for new joiners.',
    icon: '▶',
    steps: ONBOARDING_STEPS,
  },
]

// ── Completion detectors (0-indexed step) ─────────────────────────────────────
function isStepComplete(
  stepIdx: number,
  tutorialType: TutorialType,
  nodeTypes: string[],
  edgeCount: number,
  selectedId: string | null,
  simLogLen: number,
): boolean {
  if (tutorialType === 'basic') {
    switch (stepIdx) {
      case 0: return nodeTypes.includes('start')
      case 1: return nodeTypes.includes('task')
      case 2: return edgeCount >= 1
      case 3: return nodeTypes.includes('end')
      case 4: return edgeCount >= 2
      case 5: return !!selectedId
      case 6: return simLogLen > 0
    }
  }
  if (tutorialType === 'leave') {
    switch (stepIdx) {
      case 0: return nodeTypes.includes('start')
      case 1: return nodeTypes.includes('task')
      case 2: return nodeTypes.includes('approval')
      case 3: return nodeTypes.includes('end')
      case 4: return edgeCount >= 3
      case 5: return !!selectedId
      case 6: return simLogLen > 0
    }
  }
  if (tutorialType === 'onboarding') {
    switch (stepIdx) {
      case 0: return nodeTypes.includes('start')
      case 1: return nodeTypes.filter((t) => t === 'task').length >= 1
      case 2: return nodeTypes.filter((t) => t === 'task').length >= 2
      case 3: return nodeTypes.includes('end')
      case 4: return edgeCount >= 3
      case 5: return !!selectedId
      case 6: return simLogLen > 0
    }
  }
  return false
}

// ── Ghost cursor position for each step ───────────────────────────────────────
export interface GhostCursorConfig {
  from: { x: number; y: number }
  to:   { x: number; y: number }
  animType: StepAnimType
}

function computeGhostConfig(step: TutorialStep): GhostCursorConfig | null {
  const from = getDemoTarget(step.fromTarget)
  if (!from) return null

  let to: { x: number; y: number } | null = null

  if (step.toTarget) {
    // Target is another DOM element (e.g. another node button)
    to = getDemoTarget(step.toTarget)
  }

  if (!to && step.toRF) {
    // Target is a canvas position - convert RF to screen
    const cr = getCanvasRect()
    if (cr) {
      // Use a reasonable zoom approximation for tutorial (we don't reset viewport)
      to = nodeCenter(step.toRF.x, step.toRF.y, 0.82, cr)
    }
  }

  if (!to) return null
  return { from, to, animType: step.animType }
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useTutorial() {
  const [isActive,      setIsActive]      = useState(false)
  const [isDone,        setIsDone]        = useState(false)
  const [step,          setStep]          = useState(0)
  const [tutorialType,  setTutorialType]  = useState<TutorialType>('basic')
  const [ghost,         setGhost]         = useState<GhostCursorConfig | null>(null)
  const [showPicker,    setShowPicker]    = useState(false)

  const nodes          = useWorkflowStore((s) => s.nodes)
  const edges          = useWorkflowStore((s) => s.edges)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const simulationLog  = useWorkflowStore((s) => s.simulationLog)
  const resetWorkflow  = useWorkflowStore((s) => s.resetWorkflow)
  const saveSnapshot   = useWorkflowStore((s) => s.saveSnapshot)

  const currentCatalog = TUTORIAL_CATALOG.find((c) => c.id === tutorialType)!
  const STEPS          = currentCatalog.steps
  const TOTAL          = STEPS.length
  const current        = STEPS[step]

  // Recompute ghost config when step changes
  useEffect(() => {
    if (!isActive || isDone || !current) { setGhost(null); return }
    const config = computeGhostConfig(current)
    setGhost(config)
  }, [isActive, isDone, step, current])

  // Auto-advance on step completion
  useEffect(() => {
    if (!isActive || isDone) return
    const nodeTypes = nodes.map((n) => n.type ?? '')
    const met = isStepComplete(step, tutorialType, nodeTypes, edges.length, selectedNodeId, simulationLog.length)
    if (!met) return
    const id = setTimeout(() => {
      if (step < TOTAL - 1) setStep((s) => s + 1)
      else setIsDone(true)
    }, 700)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, selectedNodeId, simulationLog, step, isActive, isDone, tutorialType, TOTAL])

  const openPicker = () => setShowPicker(true)

  const startTutorial = (type: TutorialType) => {
    setTutorialType(type)
    setShowPicker(false)
    saveSnapshot()
    resetWorkflow()
    setStep(0)
    setIsDone(false)
    setIsActive(true)
  }

  const cancelTutorial = () => {
    setIsActive(false)
    setShowPicker(false)
    setStep(0)
    setIsDone(false)
    setGhost(null)
  }

  /** Manually advance to the next step (skips action requirement). */
  const nextStep = () => {
    if (isDone) return
    if (step < TOTAL - 1) setStep((s) => s + 1)
    else setIsDone(true)
  }

  /** Go back to the previous step. */
  const prevStep = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  return {
    isActive,
    isDone,
    showPicker,
    step,
    totalSteps:      TOTAL,
    stepTitle:       current?.title ?? '',
    stepHint:        current?.hint  ?? '',
    stepIcon:        current?.icon  ?? '',
    spotlightTarget: current?.fromTarget ?? '',
    ghost,
    tutorialType,
    openPicker,
    startTutorial,
    cancelTutorial,
    nextStep,
    prevStep,
  }
}
