import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWorkflowStore } from '../../store'
import { matchCopilotFlow, COPILOT_FLOWS } from '../../data/copilotFlows'
import { toast } from '../../store/toastStore'

type Stage = 'idle' | 'analyzing' | 'building' | 'done'

const QUICK_PROMPTS = [
  'New employee onboarding',
  'Leave approval with manager',
  'Performance review cycle',
  'Hiring and recruitment',
  'Promotion process',
  'Monthly payroll cycle',
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function CopilotModal({ isOpen, onClose }: Props) {
  const [prompt,      setPrompt]      = useState('')
  const [stage,       setStage]       = useState<Stage>('idle')
  const [statusText,  setStatusText]  = useState('')
  const [matchedFlow, setMatchedFlow] = useState<string>('')
  const setNodes     = useWorkflowStore((s) => s.setNodes)
  const setEdges     = useWorkflowStore((s) => s.setEdges)
  const saveSnapshot = useWorkflowStore((s) => s.saveSnapshot)
  const triggerFitView = useWorkflowStore((s) => s.triggerFitView)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setPrompt(''); setStage('idle'); setStatusText(''); setMatchedFlow('')
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const generate = async (text = prompt) => {
    if (!text.trim() || stage !== 'idle') return
    setStage('analyzing')
    setStatusText('Analyzing your request...')
    await delay(900)

    try {
      const flow = matchCopilotFlow(text)
      if (!flow) {
        setStatusText('No matching workflow found. Try a more specific HR process.')
        setStage('idle')
        toast.warning('No matching workflow - try different keywords')
        return
      }
      setMatchedFlow(flow.name)
      setStatusText(`Identified: ${flow.name}`)
      await delay(700)

      setStage('building')
      setStatusText(`Building ${flow.nodes.length} nodes...`)
      await delay(1000)

      saveSnapshot()
      setNodes(flow.nodes)
      setEdges(flow.edges)
      triggerFitView()

      setStage('done')
      setStatusText(`Generated ${flow.name} - ${flow.nodes.length} nodes, ${flow.edges.length} connections`)
      toast.success(`AI generated: ${flow.name}`)
      setTimeout(onClose, 1400)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected error'
      setStatusText(`Error: ${msg}`)
      setStage('idle')
      toast.error(`Copilot failed: ${msg}`)
    }
  }

  const isLoading = stage === 'analyzing' || stage === 'building'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-center justify-center"
          style={{ background: 'var(--overlay-bg)', backdropFilter: 'var(--overlay-blur)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden bg-th-bg-2 border border-th-border"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 36, mass: 0.9 }}
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-th-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/12 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                      <path d="M12 3l1.88 5.76a2 2 0 0 0 1.27 1.27L21 12l-5.76 1.88a2 2 0 0 0-1.27 1.27L12 21l-1.88-5.76a2 2 0 0 0-1.27-1.27L3 12l5.76-1.88a2 2 0 0 0 1.27-1.27z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-th-text-1">AI Workflow Copilot</p>
                    <p className="text-[11px] text-th-text-3">Describe any HR process in plain English</p>
                  </div>
                </div>
                <button type="button" onClick={onClose}
                  className="text-th-text-3 hover:text-th-text-1 transition-colors p-1.5 rounded-lg hover:bg-th-bg-3"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {/* Input */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void generate()}
                  placeholder="e.g. Create a performance review workflow..."
                  disabled={isLoading}
                  className="
                    w-full rounded-xl px-4 py-3 pr-28 text-[13px]
                    bg-th-bg-1 border border-th-border
                    text-th-text-1 placeholder:text-th-text-4
                    focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25
                    disabled:opacity-50 transition-all
                  "
                />
                <button
                  type="button"
                  onClick={() => void generate()}
                  disabled={!prompt.trim() || isLoading}
                  className="
                    absolute right-2 top-1/2 -translate-y-1/2
                    px-3 py-1.5 bg-th-accent hover:bg-th-accent-hover rounded-lg
                    text-[11px] font-semibold text-white
                    disabled:opacity-30 disabled:pointer-events-none
                    transition-all duration-150
                  "
                >
                  {isLoading ? '...' : 'Generate'}
                </button>
              </div>

              {/* Status row */}
              <AnimatePresence mode="wait">
                {statusText && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-3 flex items-center gap-2 text-[12px] ${
                      stage === 'done'  ? 'text-green-500' :
                      isLoading         ? 'text-indigo-400' : 'text-th-text-3'
                    }`}
                  >
                    {isLoading && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin flex-shrink-0">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                    )}
                    {stage === 'done' && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    <span>{statusText}</span>
                    {matchedFlow && stage === 'building' && (
                      <span className="ml-1 px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/25 rounded-full text-indigo-400 text-[10px]">
                        {matchedFlow}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick prompt chips */}
              {stage === 'idle' && (
                <div className="mt-5">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-th-text-3 mb-2.5">
                    Quick Prompts
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((p) => (
                      <motion.button
                        key={p}
                        type="button"
                        onClick={() => { setPrompt(p); void generate(p) }}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        className="
                          text-[11px] px-3 py-1.5 rounded-lg
                          bg-th-bg-1 border border-th-border
                          text-th-text-2 hover:text-th-accent
                          hover:border-indigo-500/35 hover:bg-th-bg-3
                          transition-colors duration-150
                        "
                      >
                        {p}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Available workflows */}
              {stage === 'idle' && (
                <div className="mt-5 pt-4 border-t border-th-border">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-th-text-3 mb-2.5">
                    {COPILOT_FLOWS.length} Available Workflows
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {COPILOT_FLOWS.map((f) => (
                      <div key={f.id} className="text-[11px] text-th-text-3 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-indigo-500/50 flex-shrink-0" />
                        {f.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}
