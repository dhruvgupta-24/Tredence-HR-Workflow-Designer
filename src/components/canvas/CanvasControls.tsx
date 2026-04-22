import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

// ─── Icons ───────────────────────────────────────────────────────────────────

const SparkleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.88 5.76a2 2 0 0 0 1.27 1.27L21 12l-5.76 1.88a2 2 0 0 0-1.27 1.27L12 21l-1.88-5.76a2 2 0 0 0-1.27-1.27L3 12l5.76-1.88a2 2 0 0 0 1.27-1.27z"/>
  </svg>
)

const PlayIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21"/>
  </svg>
)

const TargetIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
  </svg>
)

const UndoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6"/><path d="M3 13C5.2 7.4 10.3 4 16 4a9 9 0 0 1 6 2.5"/>
  </svg>
)

const RedoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6"/><path d="M21 13a9 9 0 0 0-9-9 9 9 0 0 0-7 3.5"/>
  </svg>
)

const ArrangeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/>
    <rect x="9" y="16" width="6" height="5" rx="1"/>
    <path d="M5.5 8v4a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8M12 14v2"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)

const ExportIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const ImportIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
)

const HelpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <circle cx="12" cy="17" r=".5" fill="currentColor"/>
  </svg>
)

const SpinnerIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)

const PencilIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

// ─── Workflow Title Editor ────────────────────────────────────────────────────

function WorkflowTitleEditor() {
  const workflowName   = useWorkflowStore((s) => s.workflowName)
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName)

  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(workflowName)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep draft in sync when name changes externally (template load, import, reset)
  useEffect(() => {
    if (!editing) setDraft(workflowName)
  }, [workflowName, editing])

  const commit = () => {
    const trimmed = draft.trim()
    setWorkflowName(trimmed)
    setDraft(trimmed)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(workflowName)
    setEditing(false)
  }

  const startEdit = () => {
    setDraft(workflowName)
    setEditing(true)
  }

  useEffect(() => {
    if (editing) {
      // small delay so the input is mounted before we select
      const id = setTimeout(() => {
        inputRef.current?.select()
      }, 30)
      return () => clearTimeout(id)
    }
  }, [editing])

  return (
    <div className="flex items-center justify-center flex-1 min-w-0 px-3">
      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.input
            key="input"
            ref={inputRef}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter')  { e.preventDefault(); commit() }
              if (e.key === 'Escape') { e.preventDefault(); cancel() }
            }}
            maxLength={80}
            placeholder="Untitled Workflow"
            className="
              w-full max-w-[280px] min-w-[120px] text-center
              bg-transparent outline-none
              text-[13px] font-semibold tracking-[-0.015em] leading-none
              text-th-text-1 placeholder:text-th-text-4
              border-b-2 border-th-accent/70 focus:border-th-accent
              py-0.5 transition-colors duration-150
            "
          />
        ) : (
          <motion.button
            key="display"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            onClick={startEdit}
            title="Click to rename workflow"
            className="
              group flex items-center gap-1.5 px-2.5 py-1 rounded-md
              hover:bg-th-bg-3 active:bg-th-bg-2
              transition-all duration-150 max-w-[320px] min-w-[60px]
              overflow-hidden
            "
          >
            <span className="
              text-[13px] font-semibold tracking-[-0.015em] leading-none
              text-th-text-1 truncate
            ">
              {workflowName || (
                <span className="text-th-text-4 font-normal text-[12px]">Untitled Workflow</span>
              )}
            </span>
            <span className="
              text-th-text-4 opacity-0 group-hover:opacity-100
              transition-opacity duration-150 flex-shrink-0
            ">
              <PencilIcon />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── CanvasControls ───────────────────────────────────────────────────────────

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
  const workflowName  = useWorkflowStore((s) => s.workflowName)
  const setNodes     = useWorkflowStore((s) => s.setNodes)
  const setEdges     = useWorkflowStore((s) => s.setEdges)
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName)
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
      (n: WorkflowNode[], ed: Edge[], importedName?: string) => {
        setNodes(n)
        setEdges(ed)
        setWorkflowName(importedName ?? '')
        triggerFitView()
        toast.success('Workflow imported')
      },
      (err: string) => {
        setValidationErrors([`Import failed: ${err}`])
        toast.error(`Import failed: ${err}`)
      },
    )
    e.target.value = ''
  }

  const isLocked = isLiveDemoRunning || isTutorialActive

  const ghostBtn = `
    p-2 rounded-lg text-th-text-3 hover:text-th-text-1 hover:bg-th-bg-3
    border border-transparent hover:border-th-border
    transition-all duration-150 disabled:opacity-25 disabled:pointer-events-none
  `

  return (
    <div className="h-12 flex-shrink-0 border-b border-th-border bg-th-bg-nav flex items-center px-3 gap-1 overflow-hidden">

      {/* Left actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* AI Copilot */}
        <button type="button" onClick={onCopilotOpen} disabled={isLocked}
          title="AI Workflow Copilot"
          className="
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
            bg-indigo-500/10 border border-indigo-500/25
            hover:bg-indigo-500/18 hover:border-indigo-500/50
            text-indigo-400 hover:text-indigo-300
            disabled:opacity-30 disabled:pointer-events-none
            transition-all duration-150 whitespace-nowrap
          "
        >
          <SparkleIcon />
          <span className="text-[11px] font-semibold hidden xl:inline">Copilot</span>
        </button>

        {/* Live Demo */}
        <button type="button" onClick={onLiveDemoRun}
          disabled={isLiveDemoRunning || isTutorialActive}
          title="Live product demo (auto-plays)"
          className="
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
            bg-violet-500/8 border border-violet-500/20
            hover:bg-violet-500/15 hover:border-violet-500/35
            text-violet-400 hover:text-violet-300
            disabled:opacity-30 disabled:pointer-events-none
            transition-all duration-150 whitespace-nowrap
          "
        >
          {isLiveDemoRunning ? <SpinnerIcon /> : <PlayIcon />}
          <span className="text-[11px] font-semibold hidden xl:inline">{isLiveDemoRunning ? 'Running...' : 'Live Demo'}</span>
        </button>

        {/* Tutorial */}
        <button type="button" onClick={onTutorialStart} disabled={isLiveDemoRunning}
          title="Guided interactive tutorial"
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
            border transition-all duration-150 whitespace-nowrap
            disabled:opacity-30 disabled:pointer-events-none
            ${isTutorialActive
              ? 'bg-emerald-500/12 border-emerald-500/35 text-emerald-400'
              : 'bg-th-bg-3/60 border-th-border text-th-text-3 hover:bg-th-bg-3 hover:border-th-border-strong hover:text-th-text-2'
            }
          `}
        >
          <TargetIcon />
          <span className="text-[11px] font-semibold hidden xl:inline">{isTutorialActive ? 'Tutorial...' : 'Tutorial'}</span>
        </button>

        <div className="w-px h-5 bg-th-border mx-0.5" />

        {/* Undo */}
        <button type="button" onClick={undo}
          disabled={past.length === 0 || isLocked} title="Undo (Ctrl+Z)"
          className={ghostBtn}
        >
          <UndoIcon />
        </button>
        {/* Redo */}
        <button type="button" onClick={redo}
          disabled={future.length === 0 || isLocked} title="Redo (Ctrl+Shift+Z)"
          className={ghostBtn}
        >
          <RedoIcon />
        </button>

        <div className="w-px h-5 bg-th-border mx-0.5" />

        {/* Auto Arrange */}
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
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-th-text-3 hover:text-th-text-1 hover:bg-th-bg-3 border border-transparent hover:border-th-border transition-all duration-150 disabled:opacity-20 disabled:pointer-events-none whitespace-nowrap"
        >
          <ArrangeIcon />
          <span className="text-[11px] font-medium hidden 2xl:inline">Arrange</span>
        </button>
      </div>

      {/* Center: Workflow title */}
      <WorkflowTitleEditor />

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Command palette */}
        <button type="button" onClick={onCommandOpen} title="Command Palette (Ctrl+K)"
          className="
            flex items-center gap-1.5 px-2 py-1.5 rounded-lg
            text-th-text-3 hover:text-th-text-1 hover:bg-th-bg-3
            border border-transparent hover:border-th-border
            transition-all duration-150
          "
        >
          <SearchIcon />
          <kbd className="text-[9px] text-th-text-4 bg-th-bg-1 border border-th-border rounded-[3px] px-1 py-[1px] font-mono hidden lg:inline leading-none">
            Ctrl+K
          </kbd>
        </button>

        {/* Node/edge count */}
        {nodes.length > 0 && (
          <span className="text-[10px] text-th-text-4 font-mono tabular-nums hidden lg:inline">{nodes.length}N {edges.length}E</span>
        )}
        <div className="w-px h-5 bg-th-border mx-0.5 hidden lg:block" />

        {/* Export */}
        <button type="button"
          onClick={() => exportWorkflow(nodes, edges, workflowName)}
          title="Export workflow as JSON"
          className={`${ghostBtn} flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium`}
        >
          <ExportIcon />
          <span className="hidden xl:inline">Export</span>
        </button>

        {/* Import */}
        <button type="button"
          onClick={() => fileRef.current?.click()}
          title="Import workflow from JSON"
          className={`${ghostBtn} flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium`}
        >
          <ImportIcon />
          <span className="hidden xl:inline">Import</span>
        </button>

        <div className="w-px h-5 bg-th-border mx-0.5" />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Keyboard shortcuts */}
        <button type="button" onClick={onShortcutsOpen} title="Keyboard shortcuts"
          className={ghostBtn}
        >
          <HelpIcon />
        </button>
      </div>

      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" aria-label="Import workflow" />
    </div>
  )
}
