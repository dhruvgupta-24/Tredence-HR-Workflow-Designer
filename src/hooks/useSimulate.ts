import { useCallback } from 'react'
import { useWorkflowStore } from '../store'
import { validateWorkflow } from '../utils/validation'
import { simulateWorkflow } from '../api/simulate'
import { toast } from '../store/toastStore'
import type { SimulationStep } from '../types'

const STEP_DELAY = 650

export function useSimulate() {
  const nodes              = useWorkflowStore((s) => s.nodes)
  const edges              = useWorkflowStore((s) => s.edges)
  const isSimulating       = useWorkflowStore((s) => s.isSimulating)
  const validationErrors   = useWorkflowStore((s) => s.validationErrors)
  const simulationLog      = useWorkflowStore((s) => s.simulationLog)
  const setValidationErrors= useWorkflowStore((s) => s.setValidationErrors)
  const setSimulationLog   = useWorkflowStore((s) => s.setSimulationLog)
  const setIsSimulating    = useWorkflowStore((s) => s.setIsSimulating)
  const setHighlightedNodeId = useWorkflowStore((s) => s.setHighlightedNodeId)
  const addCompletedNode   = useWorkflowStore((s) => s.addCompletedNode)
  const clearCompletedNodes= useWorkflowStore((s) => s.clearCompletedNodes)

  const runSimulation = useCallback(async () => {
    const errors = validateWorkflow(nodes, edges)
    setValidationErrors(errors)
    if (errors.length > 0) {
      toast.error(`Validation failed: ${errors[0]}`)
      return
    }

    setIsSimulating(true)
    setSimulationLog([])
    setHighlightedNodeId(null)
    clearCompletedNodes()

    const result = await simulateWorkflow(nodes, edges)

    if (result.success && result.steps) {
      const accumulated: SimulationStep[] = []
      let prevNodeId: string | null = null

      for (const step of result.steps) {
        // Mark previous node as completed before highlighting next
        if (prevNodeId) addCompletedNode(prevNodeId)

        accumulated.push(step)
        setSimulationLog([...accumulated])
        setHighlightedNodeId(step.nodeId)

        prevNodeId = step.nodeId
        await delay(STEP_DELAY)
      }

      // Mark last node completed, clear highlight
      if (prevNodeId) addCompletedNode(prevNodeId)
      setHighlightedNodeId(null)
      toast.success(`Simulation complete - ${result.steps.length} steps`)
    } else {
      const errMsg = result.error ?? 'Simulation failed'
      setValidationErrors([errMsg])
      toast.error(errMsg)
    }

    setIsSimulating(false)
  }, [nodes, edges, setValidationErrors, setSimulationLog, setIsSimulating,
      setHighlightedNodeId, addCompletedNode, clearCompletedNodes])

  return { runSimulation, isSimulating, validationErrors, simulationLog }
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}
