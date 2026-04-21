import { useCallback } from 'react'
import { useWorkflowStore } from '../store'
import { validateWorkflow } from '../utils/validation'
import { simulateWorkflow } from '../api/simulate'
import type { SimulationStep } from '../types'

export function useSimulate() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const isSimulating = useWorkflowStore((s) => s.isSimulating)
  const validationErrors = useWorkflowStore((s) => s.validationErrors)
  const simulationLog = useWorkflowStore((s) => s.simulationLog)
  const setValidationErrors = useWorkflowStore((s) => s.setValidationErrors)
  const setSimulationLog = useWorkflowStore((s) => s.setSimulationLog)
  const setIsSimulating = useWorkflowStore((s) => s.setIsSimulating)
  const setHighlightedNodeId = useWorkflowStore((s) => s.setHighlightedNodeId)

  const runSimulation = useCallback(async () => {
    const errors = validateWorkflow(nodes, edges)
    setValidationErrors(errors)
    if (errors.length > 0) return

    setIsSimulating(true)
    setSimulationLog([])
    setHighlightedNodeId(null)

    const result = await simulateWorkflow(nodes, edges)

    if (result.success && result.steps) {
      const accumulated: SimulationStep[] = []

      for (const step of result.steps) {
        accumulated.push(step)
        setSimulationLog([...accumulated])       // progressive reveal
        setHighlightedNodeId(step.nodeId)        // highlight on canvas
        await new Promise((r) => setTimeout(r, 650))
      }

      setHighlightedNodeId(null)                 // clear after done
    } else {
      setValidationErrors([result.error ?? 'Simulation failed'])
    }

    setIsSimulating(false)
  }, [nodes, edges, setValidationErrors, setSimulationLog, setIsSimulating, setHighlightedNodeId])

  return { runSimulation, isSimulating, validationErrors, simulationLog }
}
