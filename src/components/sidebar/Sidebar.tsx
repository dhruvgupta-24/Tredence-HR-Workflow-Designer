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
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName)
  const resetWorkflow = useWorkflowStore((s) => s.resetWorkflow)
  const saveSnapshot = useWorkflowStore((s) => s.saveSnapshot)
  const triggerFitView = useWorkflowStore((s) => s.triggerFitView)

  const loadTemplate = (template: WorkflowTemplate) => {
    saveSnapshot()
    setNodes(template.nodes as WorkflowNode[])
    setEdges(template.edges as Edge[])
    setWorkflowName(template.name)
    triggerFitView()
  }

  return (
    <div className="h-full flex flex-col bg-th-bg-1 border-r border-th-border">

      {/* Logo / Brand */}
      <div className="px-5 py-[17px] border-b border-th-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 shrink-0 flex items-center justify-center">
            <img
              src="/flowhr-navbar.png"
              alt="FlowHR"
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]"
            />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <p className="text-[22px] font-bold text-th-text-1 leading-none tracking-tight truncate">
              FlowHR
            </p>
            <p className="text-[11.5px] text-th-accent font-semibold mt-0.5 whitespace-nowrap">
              Workflow Designer
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* Node toolbox */}
        <div className="px-4 pt-5 pb-4 border-b border-th-border-subtle">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-th-text-3 mb-3">
            Node Types
          </p>
          <NodeToolbox />
        </div>

        {/* Templates */}
        <div className="px-4 pt-5 pb-4">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-th-text-3 mb-3">
            Templates
          </p>
          <div className="space-y-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => loadTemplate(t)}
                className="
                  w-full text-left px-3 py-2.5 rounded-xl
                  bg-th-bg-2 border border-th-border-subtle
                  hover:border-th-accent/40 hover:bg-th-bg-3
                  transition-all duration-150 group
                "
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-base leading-none mt-px flex-shrink-0">{t.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-th-text-1 group-hover:text-th-accent transition-colors leading-snug">
                      {t.name}
                    </p>
                    <p className="text-[10px] text-th-text-3 mt-0.5 leading-tight">
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
      <div className="px-4 py-4 border-t border-th-border flex-shrink-0">
        {nodes.length > 0 && (
          <div className="flex items-center justify-between text-[10px] text-th-text-3 font-mono mb-2.5">
            <span>{nodes.length} nodes</span>
            <span>{edges.length} edges</span>
          </div>
        )}
        <button
          type="button"
          onClick={resetWorkflow}
          className="
            w-full px-3 py-2 text-[11px] font-medium rounded-xl
            text-th-text-3 hover:text-rose-400
            border border-th-border-subtle hover:border-rose-500/30
            hover:bg-rose-500/5
            transition-all duration-150
          "
        >
          Reset Canvas
        </button>
        <p className="text-center text-[9px] text-th-text-4 font-mono mt-2.5">
          Tredence Assessment · v1.0
        </p>
      </div>
    </div>
  )
}
