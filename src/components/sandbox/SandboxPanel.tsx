import { useSimulate } from '../../hooks/useSimulate'
import { useWorkflowStore } from '../../store'
import { Button } from '../ui'
import { ExecutionLog } from './ExecutionLog'

const STEPS_GUIDE = [
  'Drag node types onto the canvas',
  'Connect nodes by pulling from handles',
  'Click Run Workflow to simulate',
]

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
      <div className="px-4 pt-5 pb-4 border-b border-gray-800/80 flex-shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Simulation Sandbox
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
              <span className="w-3 h-3 border border-white/60 border-t-white rounded-full animate-spin" />
              Simulating…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Run Workflow
            </span>
          )}
        </Button>

        {hasResults && (
          <button
            type="button"
            onClick={clearResults}
            className="w-full mt-2 py-1 text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
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
            <p className="text-[10px] font-semibold uppercase tracking-widest text-red-500 mb-2">
              Validation Errors
            </p>
            {validationErrors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-red-300 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2.5"
              >
                <span className="flex-shrink-0 mt-0.5 text-red-400 font-bold">!</span>
                <span className="leading-relaxed">{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* Execution log */}
        {hasLog && <ExecutionLog steps={simulationLog} />}

        {/* Polished empty state */}
        {!hasResults && !isSimulating && (
          <div className="h-full flex flex-col items-center justify-center py-8">
            {/* Icon */}
            <div className="w-11 h-11 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4 shadow-inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10,8 16,12 10,16" fill="#4b5563" stroke="none"/>
              </svg>
            </div>

            <p className="text-[13px] font-semibold text-gray-500 mb-1">
              Ready to simulate
            </p>
            <p className="text-[11px] text-gray-700 mb-5 text-center leading-relaxed">
              Build or load a workflow, then run it to see animated step-by-step execution.
            </p>

            {/* Guide steps */}
            <div className="space-y-2.5 w-full max-w-[200px]">
              {STEPS_GUIDE.map((step, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-gray-800 border border-gray-700/60 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-mono text-gray-500">{i + 1}</span>
                  </div>
                  <span className="text-[11px] text-gray-600 leading-tight">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simulating state */}
        {isSimulating && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium text-gray-400">Executing workflow…</p>
              <p className="text-[10px] text-gray-600 mt-1">Watch nodes highlight on canvas</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
