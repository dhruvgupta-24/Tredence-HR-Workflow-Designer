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

const STEP_DELAY = 600

export function useGuidedDemo({ onOpenCopilot, onCloseCopilot }: DemoCallbacks) {
  const [isDemoRunning, setIsDemoRunning] = useState(false)

  const setNodes           = useWorkflowStore((s) => s.setNodes)
  const setEdges           = useWorkflowStore((s) => s.setEdges)
  const triggerFitView     = useWorkflowStore((s) => s.triggerFitView)
  const setHighlightedNodeId = useWorkflowStore((s) => s.setHighlightedNodeId)
  const addCompletedNode     = useWorkflowStore((s) => s.addCompletedNode)
  const clearCompletedNodes  = useWorkflowStore((s) => s.clearCompletedNodes)
  const setSimulationLog     = useWorkflowStore((s) => s.setSimulationLog)
  const setIsSimulating      = useWorkflowStore((s) => s.setIsSimulating)

  const autoArrange = useAutoArrange()
  const cancelRef = useRef(false)

  const runDemo = useCallback(async () => {
    if (isDemoRunning) return
    cancelRef.current = false
    setIsDemoRunning(true)

    const delay = (ms: number) =>
      new Promise<void>((r) => {
        const t = setTimeout(r, ms)
        const check = setInterval(() => {
          if (cancelRef.current) { clearTimeout(t); clearInterval(check); r() }
        }, 50)
      })

    try {
      toast.info('🎬 Demo starting — watch the full flow')
      await delay(600)

      // Step 1 — Load Employee Onboarding
      const tpl = TEMPLATES[0]!
      setNodes(tpl.nodes as WorkflowNode[])
      setEdges(tpl.edges as Edge[])
      setSimulationLog([])
      clearCompletedNodes()
      triggerFitView()
      toast.success('Loaded: Employee Onboarding')
      await delay(1400)

      if (cancelRef.current) return

      // Step 2 — Auto-arrange
      autoArrange()
      toast.info('Layout optimized')
      await delay(1400)

      if (cancelRef.current) return

      // Step 3 — Run simulation
      const snap = useWorkflowStore.getState()
      const result = await simulateWorkflow(snap.nodes, snap.edges)

      if (result.success && result.steps) {
        setIsSimulating(true)
        let prevId: string | null = null
        for (const step of result.steps) {
          if (cancelRef.current) break
          if (prevId) addCompletedNode(prevId)
          setHighlightedNodeId(step.nodeId)
          prevId = step.nodeId
          await delay(STEP_DELAY)
        }
        if (prevId) addCompletedNode(prevId)
        setHighlightedNodeId(null)
        setIsSimulating(false)
        toast.success('Simulation complete ✓')
        await delay(800)
      }

      if (cancelRef.current) return

      // Step 4 — Flash AI Copilot
      onOpenCopilot()
      await delay(1800)
      onCloseCopilot()
      toast.info('✦ Try AI Copilot — describe any HR process')
    } finally {
      setIsDemoRunning(false)
    }
  }, [isDemoRunning, autoArrange, setNodes, setEdges, triggerFitView, setHighlightedNodeId,
      addCompletedNode, clearCompletedNodes, setSimulationLog, setIsSimulating,
      onOpenCopilot, onCloseCopilot])

  const cancelDemo = useCallback(() => { cancelRef.current = true }, [])

  return { runDemo, cancelDemo, isDemoRunning }
}
