import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
  icon: string
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

export function CommandPalette({ isOpen, onClose, onRunSimulation, onOpenCopilot, onOpenShortcuts }: Props) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

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

  const commands: Command[] = useMemo(() => [
    // Actions
    { id: 'run',      label: 'Run Simulation',     icon: '▶', group: 'Actions', description: 'Execute workflow step-by-step',
      action: () => { onRunSimulation(); onClose() } },
    { id: 'arrange',  label: 'Auto-arrange Layout', icon: '⬡', group: 'Actions', description: 'Clean up node positions',
      action: () => { autoArrange(); onClose() } },
    { id: 'undo',     label: 'Undo',                icon: '↩', group: 'Actions', description: 'Ctrl+Z',
      action: () => { undo(); onClose() } },
    { id: 'redo',     label: 'Redo',                icon: '↪', group: 'Actions', description: 'Ctrl+Shift+Z',
      action: () => { redo(); onClose() } },
    { id: 'export',   label: 'Export Workflow',     icon: '↓', group: 'Actions', description: 'Download as JSON',
      action: () => { exportWorkflow(nodes, edges); onClose() } },
    { id: 'reset',    label: 'Reset Canvas',        icon: '✕', group: 'Actions', description: 'Clear all nodes and edges',
      action: () => { resetWorkflow(); toast.info('Canvas reset'); onClose() } },
    // Templates
    ...TEMPLATES.map((t) => ({
      id: `tpl-${t.id}`,
      label: `Load: ${t.name}`,
      icon: t.icon,
      group: 'Templates',
      description: t.description,
      action: () => loadTemplate(t),
    })),
    // AI & Views
    { id: 'copilot',   label: 'Open AI Copilot',       icon: '✦', group: 'AI & Views', description: 'Generate workflow from text',
      action: () => { onOpenCopilot(); onClose() } },
    { id: 'shortcuts', label: 'Keyboard Shortcuts',     icon: '⌨', group: 'AI & Views', description: '?',
      action: () => { onOpenShortcuts(); onClose() } },
  ], [nodes, edges, undo, redo, autoArrange, loadTemplate, onRunSimulation, onOpenCopilot, onOpenShortcuts, onClose, resetWorkflow])

  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q),
    )
  }, [commands, query])

  // Group filtered results
  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    filtered.forEach((c) => {
      groups[c.group] ??= []
      groups[c.group]!.push(c)
    })
    return groups
  }, [filtered])

  // Flat list for keyboard nav
  const flat = useMemo(() => filtered, [filtered])

  useEffect(() => {
    setQuery('')
    setActiveIdx(0)
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [isOpen])

  useEffect(() => { setActiveIdx(0) }, [query])

  // Scroll active item into view
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

  if (!isOpen) return null

  let flatIdx = 0

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[18vh]"
      style={{ background: 'rgba(3,7,18,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[540px] mx-4 bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-800/80">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" className="flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands…"
            className="flex-1 bg-transparent py-4 text-[14px] text-gray-100 placeholder-gray-600 outline-none"
          />
          <kbd className="text-[10px] text-gray-600 bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto max-h-[360px] py-2">
          {flat.length === 0 && (
            <p className="text-center text-xs text-gray-600 py-8">No commands found</p>
          )}
          {Object.entries(grouped).map(([group, cmds]) => (
            <div key={group}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-4 pt-3 pb-1.5">
                {group}
              </p>
              {cmds.map((cmd) => {
                const idx = flat.indexOf(cmd)
                const isActive = idx === activeIdx
                flatIdx++
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    data-idx={idx}
                    onClick={cmd.action}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={[
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75',
                      isActive ? 'bg-indigo-600/15' : 'hover:bg-gray-800/40',
                    ].join(' ')}
                  >
                    <span className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700/60 flex items-center justify-center text-sm flex-shrink-0">
                      {cmd.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {cmd.label}
                      </p>
                      {cmd.description && (
                        <p className="text-[11px] text-gray-600 truncate">{cmd.description}</p>
                      )}
                    </div>
                    {isActive && (
                      <kbd className="text-[10px] text-gray-600 bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5">↵</kbd>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="px-4 py-2.5 border-t border-gray-800/60 flex items-center gap-3 text-[10px] text-gray-600">
          <span><kbd className="bg-gray-800 border border-gray-700 rounded px-1">↑↓</kbd> navigate</span>
          <span><kbd className="bg-gray-800 border border-gray-700 rounded px-1">↵</kbd> execute</span>
          <span><kbd className="bg-gray-800 border border-gray-700 rounded px-1">esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
