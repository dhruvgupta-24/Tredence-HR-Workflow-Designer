import { useRef } from 'react'
import { useWorkflowStore } from '../../store'
import { Button } from '../ui'
import { exportWorkflow, importWorkflow } from '../../utils/serialization'
import type { WorkflowNode } from '../../types'
import type { Edge } from '@xyflow/react'

export function CanvasControls() {
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
      },
      (err: string) => setValidationErrors([`Import failed: ${err}`]),
    )
    e.target.value = ''
  }

  return (
    <div className="h-12 flex-shrink-0 border-b border-gray-800 bg-gray-950 flex items-center px-4 gap-1.5">
      {/* Undo */}
      <button
        type="button"
        onClick={undo}
        disabled={past.length === 0}
        title="Undo (Ctrl+Z)"
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-150 disabled:opacity-25 disabled:pointer-events-none"
        aria-label="Undo"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6" />
          <path d="M3 13C5.2 7.4 10.3 4 16 4a9 9 0 0 1 6 2.5" />
        </svg>
      </button>

      {/* Redo */}
      <button
        type="button"
        onClick={redo}
        disabled={future.length === 0}
        title="Redo (Ctrl+Shift+Z)"
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-150 disabled:opacity-25 disabled:pointer-events-none"
        aria-label="Redo"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7v6h-6" />
          <path d="M21 13a9 9 0 0 0-9-9 9 9 0 0 0-7 3.5" />
        </svg>
      </button>

      <div className="h-5 w-px bg-gray-800 mx-1.5" />

      <div className="flex-1" />

      {nodes.length > 0 && (
        <span className="text-xs text-gray-600 font-mono mr-3">
          {nodes.length} node{nodes.length !== 1 ? 's' : ''} &middot; {edges.length} edge{edges.length !== 1 ? 's' : ''}
        </span>
      )}

      <Button variant="ghost" size="sm" onClick={() => exportWorkflow(nodes, edges)}>
        Export
      </Button>

      <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
        Import
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
        aria-label="Import workflow file"
      />
    </div>
  )
}
