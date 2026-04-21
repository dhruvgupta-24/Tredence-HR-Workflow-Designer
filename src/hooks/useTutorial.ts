import { useEffect, useState } from 'react'
import { useWorkflowStore } from '../store'
import { getDemoTarget, getCanvasDropPositions } from '../utils/demoPositions'

// Valid minimum workflow: Start → Task → End
// Steps designed so completion is detectable from store signals

export interface TutorialStep {
  num: number
  title: string
  hint: string
  icon: string
  // For ghost cursor animation
  fromTarget: string   // data-demo-target of source
  toTarget: 'canvas'   // always goes to canvas area
  dropIndex: number    // which canvas drop position (0-3)
}

const STEPS: TutorialStep[] = [
  {
    num: 1,
    title: 'Drag a Start node to the canvas',
    hint: 'Grab the Start Node from the left panel and drop it onto the canvas.',
    icon: '▶',
    fromTarget: 'node-start',
    toTarget: 'canvas',
    dropIndex: 0,
  },
  {
    num: 2,
    title: 'Add a Task node',
    hint: 'Drag a Task node below your Start node.',
    icon: '☐',
    fromTarget: 'node-task',
    toTarget: 'canvas',
    dropIndex: 1,
  },
  {
    num: 3,
    title: 'Add an End node',
    hint: 'Drag an End node below your Task node to complete the flow.',
    icon: '■',
    fromTarget: 'node-end',
    toTarget: 'canvas',
    dropIndex: 2,
  },
  {
    num: 4,
    title: 'Connect Start → Task → End',
    hint: 'Drag from the bottom handle of each node to the top handle of the next.',
    icon: '→',
    fromTarget: 'node-start',
    toTarget: 'canvas',
    dropIndex: 1,
  },
  {
    num: 5,
    title: 'Open a node\'s properties',
    hint: 'Click any node on the canvas to open its properties panel.',
    icon: '✎',
    fromTarget: 'node-task',
    toTarget: 'canvas',
    dropIndex: 1,
  },
  {
    num: 6,
    title: 'Run your workflow',
    hint: 'Click the "Run Workflow" button to simulate your process!',
    icon: '⚡',
    fromTarget: 'run-workflow',
    toTarget: 'canvas',
    dropIndex: 1,
  },
]

const TOTAL = STEPS.length

// Completion detectors for each step (0-indexed)
function isStepComplete(
  stepIdx: number,
  nodeTypes: string[],
  edgeCount: number,
  selectedId: string | null,
  simLogLen: number,
): boolean {
  switch (stepIdx) {
    case 0: return nodeTypes.includes('start')
    case 1: return nodeTypes.includes('task')
    case 2: return nodeTypes.includes('end')
    case 3: return edgeCount >= 2   // needs Start→Task and Task→End
    case 4: return !!selectedId
    case 5: return simLogLen > 0
    default: return false
  }
}

export interface GhostCursorConfig {
  from: { x: number; y: number }
  to:   { x: number; y: number }
}

export function useTutorial() {
  const [isActive, setIsActive] = useState(false)
  const [step,     setStep]     = useState(0)
  const [isDone,   setIsDone]   = useState(false)
  const [ghost,    setGhost]    = useState<GhostCursorConfig | null>(null)

  const nodes          = useWorkflowStore((s) => s.nodes)
  const edges          = useWorkflowStore((s) => s.edges)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const simulationLog  = useWorkflowStore((s) => s.simulationLog)
  const resetWorkflow  = useWorkflowStore((s) => s.resetWorkflow)
  const saveSnapshot   = useWorkflowStore((s) => s.saveSnapshot)

  // Recompute ghost cursor positions whenever step changes (DOM may have changed)
  useEffect(() => {
    if (!isActive || isDone) { setGhost(null); return }
    const current = STEPS[step]
    if (!current) return

    const from = getDemoTarget(current.fromTarget)
    const drops = getCanvasDropPositions()
    const to   = drops[current.dropIndex] ?? drops[0] ?? { x: 500, y: 300 }

    if (from) {
      setGhost({ from, to })
    } else {
      setGhost(null)
    }
  }, [isActive, isDone, step])

  // Auto-advance when step condition is met
  useEffect(() => {
    if (!isActive || isDone) return
    const nodeTypes = nodes.map((n) => n.type ?? '')
    const met = isStepComplete(step, nodeTypes, edges.length, selectedNodeId, simulationLog.length)
    if (!met) return

    const id = setTimeout(() => {
      if (step < TOTAL - 1) {
        setStep((s) => s + 1)
      } else {
        setIsDone(true)
      }
    }, 700)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, selectedNodeId, simulationLog, step, isActive, isDone])

  const startTutorial = () => {
    saveSnapshot()
    resetWorkflow()
    setStep(0)
    setIsDone(false)
    setIsActive(true)
  }

  const cancelTutorial = () => {
    setIsActive(false)
    setStep(0)
    setIsDone(false)
    setGhost(null)
  }

  const current = STEPS[step]

  return {
    isActive,
    isDone,
    step,
    totalSteps: TOTAL,
    stepTitle:  current?.title ?? '',
    stepHint:   current?.hint ?? '',
    stepIcon:   current?.icon ?? '',
    spotlightTarget: current?.fromTarget ?? '',
    ghost,
    startTutorial,
    cancelTutorial,
  }
}
