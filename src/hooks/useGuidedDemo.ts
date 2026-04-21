import { useState, useCallback, useRef } from 'react'
import { useWorkflowStore } from '../store'
import { useAutoArrange } from './useAutoArrange'
import { TEMPLATES } from '../data/templates'
import { toast } from '../store/toastStore'
import { simulateWorkflow } from '../api/simulate'
import type { WorkflowNode } from '../types'
import type { Edge } from '@xyflow/react'

interface DemoCallbacks {
  onOpenCopilot: () => void
  onCloseCopilot: () => void
}

// Leave Approval is a clean 6-node linear chain - guaranteed valid, no branching complexity.
const DEMO_TEMPLATE = TEMPLATES[1]!

export function useGuidedDemo({ onOpenCopilot, onCloseCopilot }: DemoCallbacks) {
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
      // 0 - Announce
      toast.info('Demo starting...')
      await wait(500)
      if (cancelRef.current) return

      // 1 - Load Leave Approval (a clean, linear 6-node workflow)
      setNodes(DEMO_TEMPLATE.nodes as WorkflowNode[])
      setEdges(DEMO_TEMPLATE.edges as Edge[])
      setSimulationLog([])
      setValidationErrors([])
      clearCompletedNodes()
      setHighlightedNodeId(null)
      toast.success('Loaded: Leave Approval')
      await wait(300)
      if (cancelRef.current) return

      // 2 - Fit View smoothly
      triggerFitView()
      await wait(700)
      if (cancelRef.current) return

      // 3 - Auto-arrange for perfect visual layout
      autoArrange()
      await wait(900)
      if (cancelRef.current) return

      // 4 - Run simulation directly against the template nodes/edges
      //     (bypass store read to avoid any stale state race)
      const result = await simulateWorkflow(
        DEMO_TEMPLATE.nodes as WorkflowNode[],
        DEMO_TEMPLATE.edges as Edge[],
      )

      if (!result.success || !result.steps?.length) {
        toast.error('Demo simulation could not run')
        return
      }

      // 5 - Animated step-by-step playback
      setIsSimulating(true)
      let prevId: string | null = null

      for (const step of result.steps) {
        if (cancelRef.current) break
        if (prevId) addCompletedNode(prevId)
        setHighlightedNodeId(step.nodeId)
        prevId = step.nodeId
        await wait(700)
      }

      if (prevId) addCompletedNode(prevId)
      setHighlightedNodeId(null)
      setIsSimulating(false)
      toast.success('Simulation complete - 6 steps executed')
      await wait(900)
      if (cancelRef.current) return

      // 6 - Flash AI Copilot
      onOpenCopilot()
      await wait(1800)
      onCloseCopilot()
      await wait(400)

      // 7 - Wrap up
      toast.success('FlowHR Demo complete - ready to build your own workflow')
    } catch (err) {
      console.error('[Demo] unexpected error:', err)
      toast.error('Demo encountered an error')
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
    onOpenCopilot, onCloseCopilot,
  ])

  const cancelDemo = useCallback(() => { cancelRef.current = true }, [])

  return { runDemo, cancelDemo, isDemoRunning }
}
