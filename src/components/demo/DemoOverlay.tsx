type DemoPhase = 'idle' | 'intro' | 'running' | 'success'

interface Props {
  phase: DemoPhase
  stepLabel: string
  stepNumber: number
  totalSteps: number
  onTryCopilot: () => void
  onBuildOwn: () => void
}

export function DemoOverlay({
  phase, stepLabel, stepNumber, totalSteps, onTryCopilot, onBuildOwn,
}: Props) {
  if (phase === 'idle') return null

  return (
    <div className="absolute inset-0 z-[90] pointer-events-none">

      {/* Intro card */}
      {phase === 'intro' && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-auto demo-intro-bg"
        >
          <div className="text-center demo-intro-card">
            <div
              className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-3xl text-indigo-400">✦</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">FlowHR Product Tour</h2>
            <p className="text-gray-400 text-lg font-light">
              Building modern HR workflows in seconds
            </p>
          </div>
        </div>
      )}

      {/* Step caption - floats at top-center during simulation */}
      {phase === 'running' && stepLabel && (
        <div className="absolute top-5 left-0 right-0 flex justify-center pointer-events-none">
          <div className="demo-caption flex items-center gap-2.5 px-4 py-2.5 bg-gray-900/96 border border-indigo-500/30 rounded-full shadow-2xl shadow-indigo-950/60">
            <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 animate-pulse" />
            <span className="text-sm font-semibold text-white whitespace-nowrap">
              {stepNumber > 0 ? `Step ${stepNumber}` : 'Starting'} - {stepLabel}
            </span>
            {totalSteps > 0 && (
              <span className="text-[11px] text-gray-500 font-mono ml-1">
                {stepNumber}/{totalSteps}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Success card */}
      {phase === 'success' && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-auto demo-success-bg"
        >
          <div className="text-center demo-success-card max-w-sm px-8 py-10 bg-gray-900/95 border border-gray-700/60 rounded-2xl shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Workflow completed successfully
            </h2>
            <p className="text-gray-500 text-sm mb-8">Built with FlowHR</p>
            <div className="flex items-center gap-3 justify-center">
              <button
                type="button"
                onClick={onTryCopilot}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-sm transition-colors duration-150"
              >
                ✦ Try Copilot
              </button>
              <button
                type="button"
                onClick={onBuildOwn}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700/80 rounded-xl text-white font-medium text-sm transition-colors duration-150"
              >
                Build Your Own
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export type { DemoPhase }
