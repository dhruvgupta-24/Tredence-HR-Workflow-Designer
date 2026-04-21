interface Props {
  isActive: boolean
  isDone: boolean
  step: number       // 0-indexed
  totalSteps: number
  stepTitle: string
  stepHint: string
  stepIcon: string
  onCancel: () => void
  onBuildOwn: () => void
  onTryCopilot: () => void
}

export function TutorialOverlay({
  isActive, isDone,
  step, totalSteps, stepTitle, stepHint, stepIcon,
  onCancel, onBuildOwn, onTryCopilot,
}: Props) {
  if (!isActive) return null

  // Progress bar width
  const progress = isDone ? 100 : Math.round(((step) / totalSteps) * 100)

  if (isDone) {
    return (
      <div className="fixed bottom-24 right-6 z-[200] w-80 tutorial-card">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">You're ready!</h3>
          <p className="text-gray-400 text-sm mb-6">You've learned the core FlowHR workflow.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onTryCopilot}
              className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-semibold transition-colors"
            >
              ✦ Try Copilot
            </button>
            <button
              type="button"
              onClick={onBuildOwn}
              className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Build Freely
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-24 right-6 z-[200] w-80 tutorial-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm text-indigo-400 flex-shrink-0">
            {stepIcon}
          </span>
          <div>
            <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
              Step {step + 1} of {totalSteps}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-400 transition-colors text-lg leading-none"
          title="Exit tutorial"
        >
          ×
        </button>
      </div>

      {/* Step content */}
      <h3 className="text-[15px] font-bold text-white mb-2">{stepTitle}</h3>
      <p className="text-sm text-gray-400 leading-relaxed mb-4">{stepHint}</p>

      {/* Progress */}
      <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-700 mt-1.5">
        Waiting for you to complete this step...
      </p>
    </div>
  )
}
