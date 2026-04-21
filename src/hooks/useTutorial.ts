import { useEffect, useRef, useState } from 'react'
import { useWorkflowStore } from '../store'

// Tutorial steps - detected via store observation
const STEPS = [
  {
    num: 1,
    title: 'Add a Start node',
    hint: 'Drag the Start node from the left sidebar onto the canvas.',
    icon: '▶',
    check: (nodeTypes: string[]) => nodeTypes.includes('start'),
  },
  {
    num: 2,
    title: 'Add a Task node',
    hint: 'Drag a Task node below the Start node.',
    icon: '☐',
    check: (nodeTypes: string[]) => nodeTypes.includes('task'),
  },
  {
    num: 3,
    title: 'Connect the nodes',
    hint: 'Drag from the handle at the bottom of Start to the top of Task.',
    icon: '→',
    check: (_: string[], edgeCount: number) => edgeCount > 0,
  },
  {
    num: 4,
    title: 'Open node properties',
    hint: 'Click on any node to open its properties in the right-side panel.',
    icon: '✎',
    check: (_: string[], __: number, selectedId: string | null) => !!selectedId,
  },
  {
    num: 5,
    title: 'Run the workflow',
    hint: 'Click "Run Workflow" in the right panel to simulate your process.',
    icon: '⚡',
    check: (_: string[], __: number, ___: string | null, simLog: unknown[]) => simLog.length > 0,
  },
]

const TOTAL = STEPS.length

export function useTutorial() {
  const [isActive, setIsActive]   = useState(false)
  const [step, setStep]           = useState(0)   // 0-indexed
  const [isDone, setIsDone]       = useState(false)
  const prevCheckedRef            = useRef(false)

  const nodes          = useWorkflowStore((s) => s.nodes)
  const edges          = useWorkflowStore((s) => s.edges)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const simulationLog  = useWorkflowStore((s) => s.simulationLog)
  const resetWorkflow  = useWorkflowStore((s) => s.resetWorkflow)
  const saveSnapshot   = useWorkflowStore((s) => s.saveSnapshot)

  const startTutorial = () => {
    saveSnapshot()
    resetWorkflow()
    setStep(0)
    setIsDone(false)
    setIsActive(true)
    prevCheckedRef.current = false
  }

  const cancelTutorial = () => {
    setIsActive(false)
    setStep(0)
    setIsDone(false)
  }

  const nextStep = () => {
    if (step < TOTAL - 1) {
      setStep((s) => s + 1)
    } else {
      setIsDone(true)
    }
  }

  // Auto-advance when step condition is met
  useEffect(() => {
    if (!isActive || isDone) return
    const current = STEPS[step]
    if (!current) return

    const nodeTypes  = nodes.map((n) => n.type ?? '')
    const edgeCount  = edges.length
    const simLogLen  = simulationLog.length

    const met = current.check(nodeTypes, edgeCount, selectedNodeId, Array(simLogLen))
    if (met) {
      // Small delay so user sees the action complete before advancing
      const id = setTimeout(nextStep, 600)
      return () => clearTimeout(id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, selectedNodeId, simulationLog, step, isActive, isDone])

  const currentStep = STEPS[step]

  return {
    isActive,
    isDone,
    step,      // 0-indexed
    totalSteps: TOTAL,
    stepTitle: currentStep?.title ?? '',
    stepHint:  currentStep?.hint ?? '',
    stepIcon:  currentStep?.icon ?? '',
    startTutorial,
    cancelTutorial,
  }
}
