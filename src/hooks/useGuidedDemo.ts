import { useState, useCallback, useRef } from 'react'
import { useWorkflowStore } from '../store'
import { useAutoArrange } from './useAutoArrange'
import { TEMPLATES } from '../data/templates'
import { toast } from '../store/toastStore'
import { simulateWorkflow } from '../api/simulate'
import type { WorkflowNode } from '../types'
import type { Edge } from '@xyflow/react'
import type { DemoPhase } from '../components/demo/DemoOverlay'

// Leave Approval: clean 6-node linear chain, zero branching, guaranteed to simulate correctly.
const DEMO_TEMPLATE = TEMPLATES[1]!

interface DemoCallbacks {
  onOpenCopilot: () => void
  onCloseCopilot: () => void
  onPhaseChange: (phase: DemoPhase) => void
  onStepLabel: (label: string, num: number, total: number) => void
}

export function useGuidedDemo({
  onOpenCopilot, onCloseCopilot, onPhaseChange, onStepLabel,
}: DemoCallbacks) {
  const [isDemoRunning, setIsDemoRunning] = useState(false)

  const setNodes             = useWorkflowStore((s) => s.setNodes)
  const setEdges             = useWorkflowStore((s) => s.setEdges)
  const triggerFitView       = useWorkflowStore((s) => s.triggerFitView)
  const setHighlightedNodeId = useWorkflowStore((s) => s.setHighlightedNodeId)
  const addCompletedNode     = useWorkflowStore((s) => s.addCompletedNode)
  const clearCompletedNodes  = useWorkflowStore((s) => s.clearCompletedNodes)
  const setSimulationLog     = useWorkflowStore((s) => s.setSimulationLog)
  const setIsSimulating      = useWorkflowStore((s) => s.setIsSimulating)
  const setValidationErrors  = useWorkflowStore((s) => s.setValidationErrors)

  const autoArrange = useAutoArrange()
  const cancelRef   = useRef(false)

  const runDemo = useCallback(async () => {
    if (isDemoRunning) return
    cancelRef.current = false
    setIsDemoRunning(true)

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(resolve, ms)
        const poll = setInterval(() => {
          if (cancelRef.current) { clearTimeout(id); clearInterval(poll); resolve() }
        }, 40)
      })

    try {
      // Phase 1: Intro card (2.6s - matches CSS animation duration)
      onPhaseChange('intro')
      setNodes(DEMO_TEMPLATE.nodes as WorkflowNode[])
      setEdges(DEMO_TEMPLATE.edges as Edge[])
      setSimulationLog([])
      setValidationErrors([])
      clearCompletedNodes()
      setHighlightedNodeId(null)

      await wait(2600) // Let intro animation complete (in 0.4s, hold 1.8s, out 0.4s)
      if (cancelRef.current) return

      // Phase 2: Running - start captions
      onPhaseChange('running')
      onStepLabel('Loading workflow...', 0, 0)
      triggerFitView()
      await wait(600)
      if (cancelRef.current) return

      autoArrange()
      onStepLabel('Arranging layout...', 0, 0)
      await wait(900)
      if (cancelRef.current) return

      // Phase 3: Simulate step by step
      const result = await simulateWorkflow(
        DEMO_TEMPLATE.nodes as WorkflowNode[],
        DEMO_TEMPLATE.edges as Edge[],
      )

      if (!result.success || !result.steps?.length) {
        toast.error('Demo simulation could not run')
        onPhaseChange('idle')
        return
      }

      setIsSimulating(true)
      let prevId: string | null = null
      const total = result.steps.length

      for (const step of result.steps) {
        if (cancelRef.current) break
        if (prevId) addCompletedNode(prevId)
        setHighlightedNodeId(step.nodeId)
        onStepLabel(step.label, step.step, total)
        await wait(800)
      }

      if (prevId ?? result.steps[result.steps.length - 1]?.nodeId) {
        addCompletedNode(result.steps[result.steps.length - 1]!.nodeId)
      }
      setHighlightedNodeId(null)
      setIsSimulating(false)
      await wait(400)
      if (cancelRef.current) return

      // Phase 4: Show success card
      onPhaseChange('success')

      // Auto-dismiss success after 8s if no button clicked
      await wait(8000)
      if (!cancelRef.current) {
        onPhaseChange('idle')
      }
    } catch (err) {
      console.error('[Demo] error:', err)
      toast.error('Demo encountered an error - please try again')
      onPhaseChange('idle')
    } finally {
      setIsDemoRunning(false)
      setIsSimulating(false)
      setHighlightedNodeId(null)
    }
  }, [
    isDemoRunning, autoArrange,
    setNodes, setEdges, triggerFitView,
    setHighlightedNodeId, addCompletedNode, clearCompletedNodes,
    setSimulationLog, setIsSimulating, setValidationErrors,
    onOpenCopilot, onCloseCopilot, onPhaseChange, onStepLabel,
  ])

  const cancelDemo = useCallback(() => {
    cancelRef.current = true
    onPhaseChange('idle')
  }, [onPhaseChange])

  return { runDemo, cancelDemo, isDemoRunning }
}
