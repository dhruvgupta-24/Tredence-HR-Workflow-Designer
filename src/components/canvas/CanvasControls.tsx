import { useRef } from 'react'
import { useWorkflowStore } from '../../store'
import { Button } from '../ui'
import { exportWorkflow, importWorkflow } from '../../utils/serialization'
import { useAutoArrange } from '../../hooks/useAutoArrange'
import { toast } from '../../store/toastStore'
import type { WorkflowNode } from '../../types'
import type { Edge } from '@xyflow/react'

interface Props {
  onShortcutsOpen:   () => void
  onCopilotOpen:     () => void
  onCommandOpen:     () => void
  onLiveDemoRun:     () => void
  onTutorialStart:   () => void
  isLiveDemoRunning: boolean
  isTutorialActive:  boolean
}

export function CanvasControls({
  onShortcutsOpen, onCopilotOpen, onCommandOpen,
  onLiveDemoRun, onTutorialStart,
  isLiveDemoRunning, isTutorialActive,
}: Props) {
  const undo         = useWorkflowStore((s) => s.undo)
  const redo         = useWorkflowStore((s) => s.redo)
  const past         = useWorkflowStore((s) => s.past)
  const future       = useWorkflowStore((s) => s.future)
  const nodes        = useWorkflowStore((s) => s.nodes)
  const edges        = useWorkflowStore((s) => s.edges)
  const setNodes     = useWorkflowStore((s) => s.setNodes)
  const setEdges     = useWorkflowStore((s) => s.setEdges)
  const saveSnapshot = useWorkflowStore((s) => s.saveSnapshot)
  const setValidationErrors = useWorkflowStore((s) => s.setValidationErrors)
  const triggerFitView      = useWorkflowStore((s) => s.triggerFitView)
  const autoArrange  = useAutoArrange()
  const fileRef      = useRef<HTMLInputElement>(null)

  const optimize = () => {
    if (nodes.length === 0) return
    saveSnapshot()
    const connected = new Set<string>()
    edges.forEach((e) => { connected.add(e.source); connected.add(e.target) })
    nodes.filter((n) => n.type === 'start' || n.type === 'end').forEach((n) => connected.add(n.id))
    const removed = nodes.filter((n) => !connected.has(n.id))
    const seen = new Set<string>()
    const deduped = edges.filter((e) => {
      const k = `${e.source}>${e.target}`
      return seen.has(k) ? false : (seen.add(k), true)
    })
    setNodes(nodes.filter((n) => connected.has(n.id)))
    setEdges(deduped)
    setTimeout(autoArrange, 50)
    toast.success(removed.length > 0
      ? `Optimized - removed ${removed.length} isolated node${removed.length > 1 ? 's' : ''}`
      : 'Layout optimized')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    saveSnapshot()
    importWorkflow(
      file,
      (n: WorkflowNode[], ed: Edge[]) => { setNodes(n); setEdges(ed); triggerFitView(); toast.success('Workflow imported') },
      (err: string) => { setValidationErrors([`Import failed: ${err}`]); toast.error(`Import failed: ${err}`) },
    )
    e.target.value = ''
  }

  const isLocked = isLiveDemoRunning || isTutorialActive

  return (
    <div className="h-12 flex-shrink-0 border-b border-gray-800/80 bg-gray-950 flex items-center px-3 gap-1">

      {/* Primary: AI Copilot */}
      <button type="button" onClick={onCopilotOpen} disabled={isLocked} title="AI Workflow Copilot"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/15 border border-indigo-500/30 hover:bg-indigo-600/25 hover:border-indigo-500/60 transition-all duration-150 text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:pointer-events-none"
      >
        <span className="text-sm leading-none">✦</span>
        <span className="text-[11px] font-semibold">Copilot</span>
      </button>

      {/* Live Demo */}
      <button type="button" onClick={onLiveDemoRun} disabled={isLiveDemoRunning || isTutorialActive}
        title="Live product demo (auto-plays)"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-600/10 border border-violet-500/20 hover:bg-violet-600/20 hover:border-violet-500/40 transition-all duration-150 text-violet-400 hover:text-violet-300 disabled:opacity-30 disabled:pointer-events-none"
      >
        <span className="text-[11px] leading-none">{isLiveDemoRunning ? '⏳' : '▶'}</span>
        <span className="text-[11px] font-semibold">{isLiveDemoRunning ? 'Live Demo...' : 'Live Demo'}</span>
      </button>

      {/* Tutorial */}
      <button type="button" onClick={onTutorialStart} disabled={isLiveDemoRunning}
        title="Guided interactive tutorial"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none ${
          isTutorialActive
            ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-400'
            : 'bg-gray-800/40 border-gray-700/30 hover:bg-gray-800 hover:border-gray-600 text-gray-500 hover:text-gray-300'
        }`}
      >
        <span className="text-[11px] leading-none">◎</span>
        <span className="text-[11px] font-semibold">{isTutorialActive ? 'Tutorial...' : 'Tutorial'}</span>
      </button>

      <div className="w-px h-5 bg-gray-800/80 mx-1" />

      {/* Edit */}
      <button type="button" onClick={undo} disabled={past.length === 0 || isLocked} title="Undo (Ctrl+Z)"
        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all duration-150 disabled:opacity-20 disabled:pointer-events-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6"/><path d="M3 13C5.2 7.4 10.3 4 16 4a9 9 0 0 1 6 2.5"/>
        </svg>
      </button>
      <button type="button" onClick={redo} disabled={future.length === 0 || isLocked} title="Redo (Ctrl+Shift+Z)"
        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all duration-150 disabled:opacity-20 disabled:pointer-events-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7v6h-6"/><path d="M21 13a9 9 0 0 0-9-9 9 9 0 0 0-7 3.5"/>
        </svg>
      </button>

      <div className="w-px h-5 bg-gray-800/80 mx-1" />

      {/* Layout */}
      <button type="button" onClick={autoArrange} disabled={nodes.length === 0 || isLocked} title="Auto-arrange layout"
        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all duration-150 disabled:opacity-20 disabled:pointer-events-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/>
          <rect x="9" y="16" width="6" height="5" rx="1"/>
          <path d="M5.5 8v4a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8M12 14v2"/>
        </svg>
      </button>
      <button type="button" onClick={optimize} disabled={nodes.length === 0 || isLocked} title="Optimize workflow"
        className="p-2 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-150 disabled:opacity-20 disabled:pointer-events-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>

      {/* Command palette - centred search bar */}
      <div className="flex-1 flex justify-center">
        <button type="button" onClick={onCommandOpen} title="Command Palette (Ctrl+K)"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/40 hover:border-gray-600/60 hover:bg-gray-800/80 transition-all duration-150 text-gray-500 hover:text-gray-300 group"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span className="text-[12px] font-medium">Search commands...</span>
          <kbd className="ml-1 text-[9px] text-gray-600 bg-gray-900 border border-gray-800 rounded px-1.5 py-0.5 font-mono group-hover:text-gray-500 transition-colors hidden sm:inline">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right */}
      {nodes.length > 0 && (
        <span className="text-[10px] text-gray-700 font-mono tabular-nums">{nodes.length}N {edges.length}E</span>
      )}
      <div className="w-px h-5 bg-gray-800/80 mx-1" />
      <Button variant="ghost" size="sm" onClick={() => exportWorkflow(nodes, edges)}>Export</Button>
      <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>Import</Button>
      <div className="w-px h-5 bg-gray-800/80 mx-1" />
      <button type="button" onClick={onShortcutsOpen} title="Keyboard shortcuts"
        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all duration-150"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="currentColor"/>
        </svg>
      </button>

      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" aria-label="Import workflow" />
    </div>
  )
}
