import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWorkflowStore } from '../../store'
import { useAutoArrange } from '../../hooks/useAutoArrange'
import { exportWorkflow } from '../../utils/serialization'
import { TEMPLATES } from '../../data/templates'
import type { WorkflowNode } from '../../types'
import type { Edge } from '@xyflow/react'
import { toast } from '../../store/toastStore'

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  group: string
  action: () => void
  keywords?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onRunSimulation: () => void
  onOpenCopilot: () => void
  onOpenShortcuts: () => void
}

// SVG icon set for commands
const RunIcon     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
const ArrangeIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="9" y="16" width="6" height="5" rx="1"/><path d="M5.5 8v4a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8M12 14v2"/></svg>
const UndoIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M3 13C5.2 7.4 10.3 4 16 4a9 9 0 0 1 6 2.5"/></svg>
const RedoIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M21 13a9 9 0 0 0-9-9 9 9 0 0 0-7 3.5"/></svg>
const ExportIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const ResetIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
const CopilotIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.88 5.76a2 2 0 0 0 1.27 1.27L21 12l-5.76 1.88a2 2 0 0 0-1.27 1.27L12 21l-1.88-5.76a2 2 0 0 0-1.27-1.27L3 12l5.76-1.88a2 2 0 0 0 1.27-1.27z"/></svg>
const ShortcutIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 10h0M12 10h0M16 10h0M8 14h8"/></svg>
const TemplateIcon = (icon: string) => () => <span className="text-sm leading-none">{icon}</span>

export function CommandPalette({ isOpen, onClose, onRunSimulation, onOpenCopilot, onOpenShortcuts }: Props) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLDivElement>(null)

  const nodes   = useWorkflowStore((s) => s.nodes)
  const edges   = useWorkflowStore((s) => s.edges)
  const setNodes = useWorkflowStore((s) => s.setNodes)
  const setEdges = useWorkflowStore((s) => s.setEdges)
  const saveSnapshot = useWorkflowStore((s) => s.saveSnapshot)
  const triggerFitView = useWorkflowStore((s) => s.triggerFitView)
  const resetWorkflow  = useWorkflowStore((s) => s.resetWorkflow)
  const undo = useWorkflowStore((s) => s.undo)
  const redo = useWorkflowStore((s) => s.redo)
  const autoArrange = useAutoArrange()

  const loadTemplate = useCallback((tpl: typeof TEMPLATES[number]) => {
    saveSnapshot()
    setNodes(tpl.nodes as WorkflowNode[])
    setEdges(tpl.edges as Edge[])
    triggerFitView()
    toast.success(`Loaded: ${tpl.name}`)
    onClose()
  }, [saveSnapshot, setNodes, setEdges, triggerFitView, onClose])

  const TplIcon = (icon: string) => {
    const Comp = TemplateIcon(icon)
    return <Comp />
  }

  const commands: Command[] = useMemo(() => [
    { id: 'run',      label: 'Run Simulation',     icon: <RunIcon />,     group: 'Actions', description: 'Execute workflow step-by-step',
      action: () => { onRunSimulation(); onClose() } },
    { id: 'arrange',  label: 'Auto-arrange Layout', icon: <ArrangeIcon />, group: 'Actions', description: 'Clean up node positions',
      action: () => { autoArrange(); onClose() } },
    { id: 'undo',     label: 'Undo',                icon: <UndoIcon />,    group: 'Actions', description: 'Ctrl+Z',
      action: () => { undo(); onClose() } },
    { id: 'redo',     label: 'Redo',                icon: <RedoIcon />,    group: 'Actions', description: 'Ctrl+Shift+Z',
      action: () => { redo(); onClose() } },
    { id: 'export',   label: 'Export Workflow',     icon: <ExportIcon />,  group: 'Actions', description: 'Download as JSON',
      action: () => { exportWorkflow(nodes, edges); onClose() } },
    { id: 'reset',    label: 'Reset Canvas',        icon: <ResetIcon />,   group: 'Actions', description: 'Clear all nodes and edges',
      action: () => { resetWorkflow(); toast.info('Canvas reset'); onClose() } },
    ...TEMPLATES.map((t) => ({
      id: `tpl-${t.id}`,
      label: `Load: ${t.name}`,
      icon: TplIcon(t.icon),
      group: 'Templates',
      description: t.description,
      action: () => loadTemplate(t),
    })),
    { id: 'copilot',   label: 'Open AI Copilot',     icon: <CopilotIcon />,  group: 'AI & Views', description: 'Generate workflow from text',
      action: () => { onOpenCopilot(); onClose() } },
    { id: 'shortcuts', label: 'Keyboard Shortcuts',   icon: <ShortcutIcon />, group: 'AI & Views', description: '?',
      action: () => { onOpenShortcuts(); onClose() } },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [nodes, edges, undo, redo, autoArrange, loadTemplate, onRunSimulation, onOpenCopilot, onOpenShortcuts, onClose, resetWorkflow])

  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q),
    )
  }, [commands, query])

  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    filtered.forEach((c) => { groups[c.group] ??= []; groups[c.group]!.push(c) })
    return groups
  }, [filtered])

  const flat = useMemo(() => filtered, [filtered])

  useEffect(() => {
    setQuery(''); setActiveIdx(0)
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [isOpen])

  useEffect(() => { setActiveIdx(0) }, [query])

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => (i + 1) % flat.length) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => (i - 1 + flat.length) % flat.length) }
      if (e.key === 'Enter' && flat[activeIdx]) { flat[activeIdx]!.action() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, flat, activeIdx, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[18vh]"
          style={{ background: 'var(--overlay-bg)', backdropFilter: 'var(--overlay-blur)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="w-full max-w-[540px] mx-4 bg-th-bg-2 border border-th-border rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ type: 'spring', stiffness: 460, damping: 38, mass: 0.8 }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-th-border">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-th-text-3">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands..."
                className="flex-1 bg-transparent py-4 text-[14px] text-th-text-1 placeholder:text-th-text-4 outline-none"
              />
              <kbd className="text-[10px] text-th-text-3 bg-th-bg-1 border border-th-border rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="overflow-y-auto max-h-[360px] py-2">
              {flat.length === 0 && (
                <p className="text-center text-xs text-th-text-3 py-8">No commands found</p>
              )}
              {Object.entries(grouped).map(([group, cmds]) => (
                <div key={group}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-th-text-3 px-4 pt-3 pb-1.5">
                    {group}
                  </p>
                  {cmds.map((cmd) => {
                    const idx = flat.indexOf(cmd)
                    const isActive = idx === activeIdx
                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        data-idx={idx}
                        onClick={cmd.action}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={[
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75',
                          isActive ? 'bg-indigo-500/12' : 'hover:bg-th-bg-3',
                        ].join(' ')}
                      >
                        <span className={`w-7 h-7 rounded-lg bg-th-bg-1 border border-th-border flex items-center justify-center flex-shrink-0 ${isActive ? 'text-indigo-400 border-indigo-500/30' : 'text-th-text-3'} transition-colors`}>
                          {cmd.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-medium ${isActive ? 'text-th-accent' : 'text-th-text-1'}`}>
                            {cmd.label}
                          </p>
                          {cmd.description && (
                            <p className="text-[11px] text-th-text-3 truncate">{cmd.description}</p>
                          )}
                        </div>
                        {isActive && (
                          <kbd className="text-[10px] text-th-text-3 bg-th-bg-1 border border-th-border rounded px-1.5 py-0.5">Enter</kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-th-border flex items-center gap-3 text-[10px] text-th-text-3">
              <span><kbd className="bg-th-bg-1 border border-th-border rounded px-1">Up/Down</kbd> navigate</span>
              <span><kbd className="bg-th-bg-1 border border-th-border rounded px-1">Enter</kbd> execute</span>
              <span><kbd className="bg-th-bg-1 border border-th-border rounded px-1">Esc</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
