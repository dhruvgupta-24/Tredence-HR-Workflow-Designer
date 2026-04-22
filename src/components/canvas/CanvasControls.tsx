import { useRef } from 'react'
import { useWorkflowStore } from '../../store'
import { ThemeToggle } from '../ui/ThemeToggle'
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

  // Shared button style base
  const ghostBtn = `
    p-2 rounded-lg text-th-text-3 hover:text-th-text-1 hover:bg-th-bg-3
    border border-transparent hover:border-th-border
    transition-all duration-150 disabled:opacity-25 disabled:pointer-events-none
  `

  return (
    <div className="
      h-12 flex-shrink-0 border-b border-th-border
      bg-th-bg-nav flex items-center px-3 gap-1
    ">

      {/* ── Primary: AI Copilot ────────────────────────────────── */}
      <button type="button" onClick={onCopilotOpen} disabled={isLocked}
        title="AI Workflow Copilot"
        className="
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
          bg-indigo-500/10 border border-indigo-500/25
          hover:bg-indigo-500/18 hover:border-indigo-500/50
          text-indigo-400 hover:text-indigo-300
          disabled:opacity-30 disabled:pointer-events-none
          transition-all duration-150
        "
      >
        <span className="text-sm leading-none">✦</span>
        <span className="text-[11px] font-semibold">Copilot</span>
      </button>

      {/* ── Live Demo ─────────────────────────────────────────── */}
      <button type="button" onClick={onLiveDemoRun}
        disabled={isLiveDemoRunning || isTutorialActive}
        title="Live product demo (auto-plays)"
        className="
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
          bg-violet-500/8 border border-violet-500/20
          hover:bg-violet-500/15 hover:border-violet-500/35
          text-violet-400 hover:text-violet-300
          disabled:opacity-30 disabled:pointer-events-none
          transition-all duration-150
        "
      >
        <span className="text-[11px] leading-none">{isLiveDemoRunning ? '⏳' : '▶'}</span>
        <span className="text-[11px] font-semibold">{isLiveDemoRunning ? 'Live Demo...' : 'Live Demo'}</span>
      </button>

      {/* ── Tutorial ──────────────────────────────────────────── */}
      <button type="button" onClick={onTutorialStart} disabled={isLiveDemoRunning}
        title="Guided interactive tutorial"
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
          border transition-all duration-150
          disabled:opacity-30 disabled:pointer-events-none
          ${isTutorialActive
            ? 'bg-emerald-500/12 border-emerald-500/35 text-emerald-400'
            : 'bg-th-bg-3/60 border-th-border text-th-text-3 hover:bg-th-bg-3 hover:border-th-border-strong hover:text-th-text-2'
          }
        `}
      >
        <span className="text-[11px] leading-none">◎</span>
        <span className="text-[11px] font-semibold">{isTutorialActive ? 'Tutorial...' : 'Tutorial'}</span>
      </button>

      <div className="w-px h-5 bg-th-border mx-1" />

      {/* ── Undo / Redo ───────────────────────────────────────── */}
      <button type="button" onClick={undo}
        disabled={past.length === 0 || isLocked} title="Undo (Ctrl+Z)"
        className={ghostBtn}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6"/><path d="M3 13C5.2 7.4 10.3 4 16 4a9 9 0 0 1 6 2.5"/>
        </svg>
      </button>
      <button type="button" onClick={redo}
        disabled={future.length === 0 || isLocked} title="Redo (Ctrl+Shift+Z)"
        className={ghostBtn}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7v6h-6"/><path d="M21 13a9 9 0 0 0-9-9 9 9 0 0 0-7 3.5"/>
        </svg>
      </button>

      <div className="w-px h-5 bg-th-border mx-1" />

      {/* ── Auto Arrange (merges arrange + optimize) ────────── */}
      <button type="button"
        onClick={() => {
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
            ? `Arranged - removed ${removed.length} isolated node${removed.length > 1 ? 's' : ''}`
            : 'Layout arranged')
        }}
        disabled={nodes.length === 0 || isLocked}
        title="Auto Arrange layout"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-th-text-3 hover:text-th-text-1 hover:bg-th-bg-3 border border-transparent hover:border-th-border transition-all duration-150 disabled:opacity-20 disabled:pointer-events-none`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/>
          <rect x="9" y="16" width="6" height="5" rx="1"/>
          <path d="M5.5 8v4a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8M12 14v2"/>
        </svg>
        <span className="text-[11px] font-medium">Auto Arrange</span>
      </button>

      {/* ── Command palette — centred search bar ────────────── */}
      <div className="flex-1 flex justify-center">
        <button type="button" onClick={onCommandOpen} title="Command Palette (Ctrl+K)"
          className="
            flex items-center gap-2 px-3 py-1.5 rounded-lg
            bg-th-bg-2 border border-th-border
            hover:border-th-border-strong hover:bg-th-bg-3
            text-th-text-3 hover:text-th-text-2
            transition-all duration-150 group
          "
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span className="text-[11.5px] font-medium">Search commands...</span>
          <kbd className="ml-1 text-[9px] text-th-text-4 bg-th-bg-1 border border-th-border rounded px-1.5 py-0.5 font-mono group-hover:text-th-text-3 transition-colors hidden sm:inline">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* ── Right group ───────────────────────────────────────── */}
      {nodes.length > 0 && (
        <span className="text-[10px] text-th-text-4 font-mono tabular-nums">{nodes.length}N {edges.length}E</span>
      )}
      <div className="w-px h-5 bg-th-border mx-1" />

      <button type="button"
        onClick={() => exportWorkflow(nodes, edges)}
        title="Export workflow as JSON"
        className={`${ghostBtn} px-2.5 py-1.5 text-[11px] font-medium`}
      >
        Export
      </button>
      <button type="button"
        onClick={() => fileRef.current?.click()}
        title="Import workflow from JSON"
        className={`${ghostBtn} px-2.5 py-1.5 text-[11px] font-medium`}
      >
        Import
      </button>

      <div className="w-px h-5 bg-th-border mx-1" />

      {/* ── Theme Toggle ────────────────────────────────────── */}
      <ThemeToggle />

      {/* ── Keyboard shortcuts ─────────────────────────────── */}
      <button type="button" onClick={onShortcutsOpen} title="Keyboard shortcuts"
        className={ghostBtn}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <circle cx="12" cy="17" r=".5" fill="currentColor"/>
        </svg>
      </button>

      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" aria-label="Import workflow" />
    </div>
  )
}
