import { NodeToolbox } from './NodeToolbox'
import { useWorkflowStore } from '../../store'

export function Sidebar() {
  const resetWorkflow = useWorkflowStore((s) => s.resetWorkflow)
  const nodeCount = useWorkflowStore((s) => s.nodes.length)

  return (
    <aside className="h-full flex flex-col bg-gray-950 border-r border-gray-800">
      {/* Logo / App Name */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            HR
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">HR Flow</p>
            <p className="text-xs text-gray-500 mt-0.5">Workflow Designer</p>
          </div>
        </div>
      </div>

      {/* Node Toolbox */}
      <div className="flex-1 overflow-y-auto">
        <NodeToolbox />
      </div>

      {/* Workflow Stats + Reset */}
      <div className="px-3 py-3 border-t border-gray-800 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-500">Nodes on canvas</span>
          <span className="text-xs font-mono text-gray-300">{nodeCount}</span>
        </div>
        <button
          type="button"
          onClick={resetWorkflow}
          className="w-full px-3 py-2 text-xs text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-150"
        >
          Reset Canvas
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">v1.0.0</p>
      </div>
    </aside>
  )
}
