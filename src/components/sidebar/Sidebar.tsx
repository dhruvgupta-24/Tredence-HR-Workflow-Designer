import { useWorkflowStore } from '../../store'
import { NodeToolbox } from './NodeToolbox'
import { TEMPLATES } from '../../data/templates'
import type { WorkflowTemplate } from '../../data/templates'
import type { Edge } from '@xyflow/react'
import type { WorkflowNode } from '../../types'

export function Sidebar() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const setNodes = useWorkflowStore((s) => s.setNodes)
  const setEdges = useWorkflowStore((s) => s.setEdges)
  const resetWorkflow = useWorkflowStore((s) => s.resetWorkflow)
  const saveSnapshot = useWorkflowStore((s) => s.saveSnapshot)

  const loadTemplate = (template: WorkflowTemplate) => {
    saveSnapshot()
    setNodes(template.nodes as WorkflowNode[])
    setEdges(template.edges as Edge[])
  }

  return (
    <div className="h-full flex flex-col bg-gray-950 border-r border-gray-800/80">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-white leading-none">HR Flow</p>
            <p className="text-[10px] text-indigo-400 font-medium mt-0.5">Workflow Designer</p>
          </div>
        </div>
      </div>

      {/* Node Toolbox */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Node Types
          </p>
          <NodeToolbox />
        </div>

        {/* Templates */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Templates
          </p>
          <div className="space-y-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => loadTemplate(t)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-indigo-500/50 hover:bg-gray-800/80 transition-all duration-150 group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{t.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors leading-snug">
                      {t.name}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-0.5 leading-tight truncate">
                      {t.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800/80 space-y-2">
        {nodes.length > 0 && (
          <div className="flex items-center justify-between text-[10px] text-gray-600 font-mono mb-1">
            <span>{nodes.length} nodes</span>
            <span>{edges.length} connections</span>
          </div>
        )}
        <button
          type="button"
          onClick={resetWorkflow}
          className="w-full px-3 py-2 text-xs text-gray-500 hover:text-red-400 border border-gray-800 hover:border-red-900/60 rounded-lg transition-all duration-150 font-medium"
        >
          Reset Canvas
        </button>
        <p className="text-center text-[9px] text-gray-700 font-mono">
          Tredence Assessment · v1.0
        </p>
      </div>
    </div>
  )
}
