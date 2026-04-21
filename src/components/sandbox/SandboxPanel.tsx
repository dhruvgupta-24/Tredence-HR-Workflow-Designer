import { useSimulate } from '../../hooks/useSimulate'
import { useWorkflowStore } from '../../store'
import { Button } from '../ui'
import { ExecutionLog } from './ExecutionLog'

export function SandboxPanel() {
  const { runSimulation, isSimulating, validationErrors, simulationLog } = useSimulate()
  const setValidationErrors = useWorkflowStore((s) => s.setValidationErrors)
  const setSimulationLog = useWorkflowStore((s) => s.setSimulationLog)

  const hasErrors = validationErrors.length > 0
  const hasLog = simulationLog.length > 0
  const hasResults = hasErrors || hasLog

  const clearResults = () => {
    setValidationErrors([])
    setSimulationLog([])
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-800 flex-shrink-0">
        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
          Sandbox
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => void runSimulation()}
          disabled={isSimulating}
          className="w-full justify-center"
        >
          {isSimulating ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              Running...
            </span>
          ) : (
            'Run Workflow'
          )}
        </Button>

        {hasResults && (
          <button
            type="button"
            onClick={clearResults}
            className="w-full mt-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Clear results
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Validation errors */}
        {hasErrors && (
          <div className="space-y-2 mb-4">
            <p className="text-xs uppercase tracking-wide text-red-400 font-semibold mb-2">
              Validation Errors
            </p>
            {validationErrors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                <span className="flex-shrink-0 mt-px text-red-400">!</span>
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* Execution log */}
        {hasLog && <ExecutionLog steps={simulationLog} />}

        {/* Empty state */}
        {!hasResults && !isSimulating && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-2">
              <div className="text-2xl mb-2 opacity-20">▷</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Build a workflow then click Run to simulate execution
              </p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isSimulating && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-500">Simulating workflow...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
