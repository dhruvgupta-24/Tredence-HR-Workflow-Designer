import { useRef } from 'react'
import { useWorkflowStore } from '../../store'
import { Button } from '../ui'
import { exportWorkflow, importWorkflow } from '../../utils/serialization'
import { useAutoArrange } from '../../hooks/useAutoArrange'
import type { WorkflowNode } from '../../types'
import type { Edge } from '@xyflow/react'

interface Props {
  onShortcutsOpen: () => void
}

export function CanvasControls({ onShortcutsOpen }: Props) {
  const undo = useWorkflowStore((s) => s.undo)
  const redo = useWorkflowStore((s) => s.redo)
  const past = useWorkflowStore((s) => s.past)
  const future = useWorkflowStore((s) => s.future)
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const setNodes = useWorkflowStore((s) => s.setNodes)
  const setEdges = useWorkflowStore((s) => s.setEdges)
  const saveSnapshot = useWorkflowStore((s) => s.saveSnapshot)
  const setValidationErrors = useWorkflowStore((s) => s.setValidationErrors)
  const triggerFitView = useWorkflowStore((s) => s.triggerFitView)
  const autoArrange = useAutoArrange()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    saveSnapshot()
    importWorkflow(
      file,
      (importedNodes: WorkflowNode[], importedEdges: Edge[]) => {
        setNodes(importedNodes)
        setEdges(importedEdges)
        triggerFitView()
      },
      (err: string) => setValidationErrors([`Import failed: ${err}`]),
    )
    e.target.value = ''
  }

  return (
    <div className="h-12 flex-shrink-0 border-b border-gray-800/80 bg-gray-950 flex items-center px-3 gap-1">
      {/* Undo */}
      <button type="button" onClick={undo} disabled={past.length === 0}
        title="Undo (Ctrl+Z)"
        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all duration-150 disabled:opacity-20 disabled:pointer-events-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6"/><path d="M3 13C5.2 7.4 10.3 4 16 4a9 9 0 0 1 6 2.5"/>
        </svg>
      </button>

      {/* Redo */}
      <button type="button" onClick={redo} disabled={future.length === 0}
        title="Redo (Ctrl+Shift+Z)"
        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all duration-150 disabled:opacity-20 disabled:pointer-events-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7v6h-6"/><path d="M21 13a9 9 0 0 0-9-9 9 9 0 0 0-7 3.5"/>
        </svg>
      </button>

      <div className="w-px h-5 bg-gray-800 mx-1" />

      {/* Auto-arrange */}
      <button type="button" onClick={autoArrange} disabled={nodes.length === 0}
        title="Auto-arrange layout"
        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all duration-150 disabled:opacity-20 disabled:pointer-events-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/>
          <rect x="9" y="16" width="6" height="5" rx="1"/>
          <path d="M5.5 8v4a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8M12 14v2"/>
        </svg>
      </button>

      <div className="flex-1" />

      {/* Stats */}
      {nodes.length > 0 && (
        <span className="text-[10px] text-gray-600 font-mono mr-2">
          {nodes.length}N · {edges.length}E
        </span>
      )}

      {/* Export */}
      <Button variant="ghost" size="sm" onClick={() => exportWorkflow(nodes, edges)}>
        Export
      </Button>

      {/* Import */}
      <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
        Import
      </Button>

      <div className="w-px h-5 bg-gray-800 mx-1" />

      {/* Shortcuts */}
      <button type="button" onClick={onShortcutsOpen}
        title="Keyboard shortcuts (?)"
        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all duration-150"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="currentColor"/>
        </svg>
      </button>

      <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" aria-label="Import workflow" />
    </div>
  )
}
