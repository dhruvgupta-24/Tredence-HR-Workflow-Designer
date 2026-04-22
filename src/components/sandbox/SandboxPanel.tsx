import { useSimulate } from '../../hooks/useSimulate'
import { useWorkflowStore } from '../../store'
import { ExecutionLog } from './ExecutionLog'

const STEPS_GUIDE = [
  'Drag node types onto the canvas',
  'Connect nodes by pulling from handles',
  'Click Run Workflow to simulate',
]

export function SandboxPanel() {
  const { runSimulation, isSimulating, validationErrors, simulationLog } = useSimulate()
  const setValidationErrors = useWorkflowStore((s) => s.setValidationErrors)
  const setSimulationLog    = useWorkflowStore((s) => s.setSimulationLog)

  const hasErrors  = validationErrors.length > 0
  const hasLog     = simulationLog.length > 0
  const hasResults = hasErrors || hasLog

  const clearResults = () => {
    setValidationErrors([])
    setSimulationLog([])
  }

  return (
    <div className="h-full flex flex-col bg-th-bg-1">

      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-th-border flex-shrink-0">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-th-text-3 mb-3">
          Simulation Sandbox
        </p>

        {/* Run Workflow button — premium primary CTA */}
        <button
          type="button"
          onClick={() => void runSimulation()}
          disabled={isSimulating}
          data-demo-target="run-workflow"
          className="
            w-full flex items-center justify-center gap-2
            px-4 py-2.5 rounded-xl
            bg-th-accent text-white font-semibold text-[12px]
            hover:opacity-90 active:scale-[0.98]
            disabled:opacity-50 disabled:pointer-events-none
            shadow-md shadow-th-accent/20
            transition-all duration-150
          "
        >
          {isSimulating ? (
            <>
              <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Simulating...
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Run Workflow
            </>
          )}
        </button>

        {hasResults && (
          <button
            type="button"
            onClick={clearResults}
            className="w-full mt-2 py-1 text-[11px] text-th-text-3 hover:text-th-text-2 transition-colors"
          >
            Clear results
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* Validation errors */}
        {hasErrors && (
          <div className="space-y-1.5 mb-4">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-rose-400 mb-2">
              Validation Errors
            </p>
            {validationErrors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-[11px] text-rose-300 bg-rose-500/8 border border-rose-500/20 rounded-xl px-3 py-2.5"
              >
                <span className="flex-shrink-0 mt-0.5 text-rose-400">✕</span>
                <span className="leading-relaxed">{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* Execution log */}
        {hasLog && <ExecutionLog steps={simulationLog} />}

        {/* Empty state */}
        {!hasResults && !isSimulating && (
          <div className="h-full flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-th-bg-2 border border-th-border flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10,8 16,12 10,16" fill="var(--text-3)" stroke="none"/>
              </svg>
            </div>

            <p className="text-[13px] font-semibold text-th-text-2 mb-1">Ready to simulate</p>
            <p className="text-[11px] text-th-text-3 mb-5 text-center leading-relaxed max-w-[200px]">
              Build or load a workflow, then run it to see step-by-step execution.
            </p>

            <div className="space-y-2.5 w-full max-w-[200px]">
              {STEPS_GUIDE.map((step, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-th-bg-2 border border-th-border flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-mono text-th-text-3">{i + 1}</span>
                  </div>
                  <span className="text-[11px] text-th-text-3 leading-tight">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simulating spinner */}
        {isSimulating && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-th-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[12px] font-medium text-th-text-2">Executing workflow...</p>
              <p className="text-[10px] text-th-text-3 mt-1">Watch nodes highlight on canvas</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
