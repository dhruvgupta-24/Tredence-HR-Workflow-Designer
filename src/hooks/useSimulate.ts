import { useCallback } from 'react'
import { useWorkflowStore } from '../store'
import { validateWorkflow } from '../utils/validation'
import { simulateWorkflow } from '../api/simulate'

export function useSimulate() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const isSimulating = useWorkflowStore((s) => s.isSimulating)
  const validationErrors = useWorkflowStore((s) => s.validationErrors)
  const simulationLog = useWorkflowStore((s) => s.simulationLog)
  const setValidationErrors = useWorkflowStore((s) => s.setValidationErrors)
  const setSimulationLog = useWorkflowStore((s) => s.setSimulationLog)
  const setIsSimulating = useWorkflowStore((s) => s.setIsSimulating)

  const runSimulation = useCallback(async () => {
    const errors = validateWorkflow(nodes, edges)
    setValidationErrors(errors)
    if (errors.length > 0) return

    setIsSimulating(true)
    setSimulationLog([])

    const result = await simulateWorkflow(nodes, edges)

    if (result.success && result.steps) {
      setSimulationLog(result.steps)
    } else {
      setValidationErrors([result.error ?? 'Simulation failed'])
    }

    setIsSimulating(false)
  }, [nodes, edges, setValidationErrors, setSimulationLog, setIsSimulating])

  return { runSimulation, isSimulating, validationErrors, simulationLog }
}
