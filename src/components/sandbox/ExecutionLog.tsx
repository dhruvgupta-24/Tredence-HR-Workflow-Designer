import type { SimulationStep } from '../../types'

const typeColorMap: Record<string, string> = {
  start: 'bg-green-500',
  task: 'bg-blue-500',
  approval: 'bg-orange-500',
  automated: 'bg-purple-500',
  end: 'bg-red-500',
}

interface Props {
  steps: SimulationStep[]
}

export function ExecutionLog({ steps }: Props) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div key={step.step} className="flex items-start gap-3">
          {/* Step number */}
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mt-0.5">
            <span className="text-xs font-mono text-gray-400 leading-none">{step.step}</span>
          </div>

          {/* Type dot */}
          <div
            className={[
              'flex-shrink-0 w-2 h-2 rounded-full mt-1.5',
              typeColorMap[step.nodeType] ?? 'bg-gray-500',
            ].join(' ')}
          />

          {/* Label */}
          <p className="text-xs text-gray-300 leading-relaxed">{step.label}</p>
        </div>
      ))}

      {/* Success footer */}
      <div className="flex items-center gap-2 pt-3 mt-1 border-t border-gray-800">
        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
        <p className="text-xs text-green-400 font-medium">
          Simulation completed - {steps.length} step{steps.length !== 1 ? 's' : ''} executed
        </p>
      </div>
    </div>
  )
}
