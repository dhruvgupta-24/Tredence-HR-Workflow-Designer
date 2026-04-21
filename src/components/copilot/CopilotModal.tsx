import { useState, useRef, useEffect } from 'react'
import { useWorkflowStore } from '../../store'
import { matchCopilotFlow, COPILOT_FLOWS } from '../../data/copilotFlows'
import { toast } from '../../store/toastStore'

type Stage = 'idle' | 'analyzing' | 'building' | 'done'

const QUICK_PROMPTS = [
  'New employee onboarding flow',
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
  const [prompt, setPrompt] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [statusText, setStatusText] = useState('')
  const [matchedFlow, setMatchedFlow] = useState<string>('')
  const setNodes = useWorkflowStore((s) => s.setNodes)
  const setEdges = useWorkflowStore((s) => s.setEdges)
  const saveSnapshot = useWorkflowStore((s) => s.saveSnapshot)
  const triggerFitView = useWorkflowStore((s) => s.triggerFitView)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setPrompt(''); setStage('idle'); setStatusText(''); setMatchedFlow('')
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const generate = async (text = prompt) => {
    if (!text.trim() || stage !== 'idle') return

    setStage('analyzing')
    setStatusText('Analyzing your request…')
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
      setStatusText(`Building ${flow.nodes.length} nodes…`)
      await delay(1000)

      // Validated templates - data is already correctly shaped
      saveSnapshot()
      setNodes(flow.nodes)
      setEdges(flow.edges)
      triggerFitView()

      setStage('done')
      setStatusText(`✓ Generated ${flow.name} - ${flow.nodes.length} nodes, ${flow.edges.length} connections`)
      toast.success(`AI generated: ${flow.name}`)
      setTimeout(onClose, 1200)
    } catch (err) {
      console.error('[Copilot] generation error:', err)
      const msg = err instanceof Error ? err.message : 'Unexpected error'
      setStatusText(`Error: ${msg}`)
      setStage('idle')
      toast.error(`Copilot failed: ${msg}`)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center"
      style={{ background: 'rgba(3,7,18,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg mx-4 bg-gray-900 border border-gray-800/80 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-indigo-400 text-sm">✦</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-white">AI Workflow Copilot</p>
                <p className="text-[11px] text-gray-500">Describe any HR process in plain English</p>
              </div>
            </div>
            <button type="button" onClick={onClose}
              className="text-gray-600 hover:text-white transition-colors p-1"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="px-6 py-5">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void generate()}
              placeholder="e.g. Create a performance review workflow…"
              disabled={stage === 'analyzing' || stage === 'building'}
              className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-4 py-3 pr-12
                text-[13px] text-gray-100 placeholder-gray-600
                focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30
                transition-all disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void generate()}
              disabled={!prompt.trim() || stage === 'analyzing' || stage === 'building'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2
                px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg
                text-[11px] font-semibold text-white transition-colors
                disabled:opacity-30 disabled:pointer-events-none"
            >
              {stage === 'idle' || stage === 'done' ? 'Generate' : '…'}
            </button>
          </div>

          {/* Status */}
          {statusText && (
            <div className={`mt-3 flex items-center gap-2 text-[12px] ${
              stage === 'done' ? 'text-green-400' :
              stage === 'analyzing' || stage === 'building' ? 'text-indigo-400' : 'text-gray-500'
            }`}>
              {(stage === 'analyzing' || stage === 'building') && (
                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
              {stage === 'done' && <span>✓</span>}
              <span>{statusText}</span>
              {matchedFlow && stage === 'building' && (
                <span className="ml-1 px-2 py-0.5 bg-indigo-900/50 border border-indigo-800/60 rounded-full text-indigo-300 text-[10px]">
                  {matchedFlow}
                </span>
              )}
            </div>
          )}

          {/* Quick prompts */}
          {stage === 'idle' && (
            <div className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-2.5">
                Quick Prompts
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setPrompt(p); void generate(p) }}
                    className="text-[11px] px-3 py-1.5 bg-gray-800/60 border border-gray-700/60 rounded-lg
                      text-gray-400 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10
                      transition-all duration-150"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available flows */}
          {stage === 'idle' && (
            <div className="mt-5 pt-4 border-t border-gray-800/60">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-2">
                {COPILOT_FLOWS.length} Available Workflows
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {COPILOT_FLOWS.map((f) => (
                  <div key={f.id} className="text-[11px] text-gray-600 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-indigo-600/60 flex-shrink-0" />
                    {f.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}
