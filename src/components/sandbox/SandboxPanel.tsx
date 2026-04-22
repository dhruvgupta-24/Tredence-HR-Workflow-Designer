import { motion } from 'framer-motion'
import { useSimulate } from '../../hooks/useSimulate'
import { useWorkflowStore } from '../../store'
import { ExecutionLog } from './ExecutionLog'

const STEPS_GUIDE = [
  { label: 'Drag nodes to canvas', detail: 'From the left sidebar' },
  { label: 'Connect nodes',        detail: 'Pull from node handles' },
  { label: 'Run the simulation',   detail: 'Click the button above' },
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

        {/* Run Workflow CTA */}
        <motion.button
          type="button"
          onClick={() => void runSimulation()}
          disabled={isSimulating}
          data-demo-target="run-workflow"
          whileHover={isSimulating ? {} : { scale: 1.01, transition: { type: 'spring', stiffness: 500, damping: 30 } }}
          whileTap={isSimulating ? {} : { scale: 0.98 }}
          className="
            w-full flex items-center justify-center gap-2
            px-4 py-2.5 rounded-xl
            bg-th-accent text-white font-semibold text-[12px]
            border border-black/10
            shadow-[0_2px_8px_rgba(0,0,0,0.1)]
            hover:shadow-[0_4px_20px_rgba(99,102,241,0.35)]
            disabled:opacity-50 disabled:pointer-events-none
            transition-shadow duration-200
          "
        >
          {isSimulating ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
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
        </motion.button>

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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 text-rose-400">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
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
            <div className="w-14 h-14 rounded-2xl bg-th-bg-2 border border-th-border flex items-center justify-center mb-4 shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-th-text-3"
              >
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" className="opacity-60"/>
              </svg>
            </div>

            <p className="text-[13px] font-semibold text-th-text-2 mb-1">Ready to simulate</p>
            <p className="text-[11px] text-th-text-3 mb-6 text-center leading-relaxed max-w-[200px]">
              Build or load a workflow, then run it to see step-by-step execution.
            </p>

            <div className="space-y-3 w-full max-w-[220px]">
              {STEPS_GUIDE.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-th-bg-2 border border-th-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold font-mono text-th-text-3">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-th-text-2 leading-tight">{step.label}</p>
                    <p className="text-[10px] text-th-text-3 mt-0.5 leading-tight">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simulating state */}
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
