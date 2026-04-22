import { useEffect, useRef, useState } from 'react'
import type { GhostCursorConfig, StepAnimType } from '../../hooks/useTutorial'
import { TUTORIAL_CATALOG, type TutorialType } from '../../hooks/useTutorial'

// ── Step-context-aware ghost cursor ──────────────────────────────────────────
interface GhostProps { config: GhostCursorConfig }

function GhostCursor({ config }: GhostProps) {
  type Phase = 'idle' | 'moving' | 'clicking' | 'holding' | 'returning'
  const [phase, setPhase] = useState<Phase>('idle')
  const [pos,   setPos]   = useState(config.from)
  const cancelRef         = useRef(false)
  const animType: StepAnimType = config.animType

  useEffect(() => {
    cancelRef.current = false
    setPos(config.from)
    setPhase('idle')

    const loop = async () => {
      await sleep(300)
      while (!cancelRef.current) {
        if (animType === 'drag') {
          setPhase('moving'); setPos(config.from); await sleep(200)
          if (cancelRef.current) break
          setPhase('holding'); await sleep(150)
          if (cancelRef.current) break
          setPhase('moving'); setPos(config.to); await sleep(1000)
          if (cancelRef.current) break
          setPhase('clicking'); await sleep(350)
          if (cancelRef.current) break
          setPhase('idle'); await sleep(500)
          if (cancelRef.current) break
          setPhase('returning'); setPos(config.from); await sleep(100)

        } else if (animType === 'connect') {
          setPhase('moving'); setPos({ x: config.from.x, y: config.from.y + 20 }); await sleep(800)
          if (cancelRef.current) break
          setPhase('holding'); await sleep(150)
          if (cancelRef.current) break
          setPhase('moving'); setPos({ x: config.to.x, y: config.to.y - 20 }); await sleep(900)
          if (cancelRef.current) break
          setPhase('clicking'); await sleep(350)
          if (cancelRef.current) break
          setPhase('idle'); await sleep(500)
          if (cancelRef.current) break
          setPhase('returning'); setPos(config.from); await sleep(100)

        } else {
          setPhase('moving'); setPos(config.to); await sleep(900)
          if (cancelRef.current) break
          setPhase('clicking'); await sleep(400)
          if (cancelRef.current) break
          setPhase('idle'); await sleep(600)
          if (cancelRef.current) break
          setPhase('returning'); setPos(config.from); await sleep(100)
        }
      }
    }

    void loop()
    return () => { cancelRef.current = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.from.x, config.from.y, config.to.x, config.to.y, animType])

  const isDragging  = phase === 'moving' && animType !== 'click'
  const isHolding   = phase === 'holding'
  const isClicking  = phase === 'clicking'
  const isReturning = phase === 'returning'

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[180]"
      style={{
        transform: `translate(${pos.x - 4}px, ${pos.y - 2}px)`,
        transition: isReturning
          ? 'none'
          : `transform ${phase === 'moving' ? (animType !== 'click' ? 950 : 900) : 150}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
        opacity: isReturning ? 0 : 0.78,
      }}
    >
      <svg width="20" height="23" viewBox="0 0 22 26" fill="none"
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.55))',
          transform: (isDragging || isHolding) ? 'scale(0.88) rotate(-6deg)' : isClicking ? 'scale(0.85)' : 'scale(1)',
          transition: 'transform 0.18s ease',
        }}
      >
        <path d="M2 2l18 10.5L11.5 14l-1.5 9L2 2z"
          fill="rgba(255,255,255,0.85)" stroke="#1a1a2e" strokeWidth="1.5" strokeLinejoin="round"
        />
      </svg>
      {isClicking && (
        <div
          className="absolute -top-1 -left-1 w-5 h-5 rounded-full border-2 border-indigo-400/80"
          style={{ animation: 'cursor-ripple 0.45s ease-out forwards' }}
        />
      )}
    </div>
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Tutorial spotlight glow ring ──────────────────────────────────────────────
function SpotlightGlow({ targetName }: { targetName: string }) {
  const [r, setR] = useState<DOMRect | null>(null)
  useEffect(() => {
    const run = () => {
      const el = document.querySelector(`[data-demo-target="${targetName}"]`)
      if (el) setR(el.getBoundingClientRect())
    }
    run()
    const id = setInterval(run, 600)
    return () => clearInterval(id)
  }, [targetName])
  if (!r) return null
  const p = 6
  return (
    <div
      className="fixed pointer-events-none z-[175]"
      style={{
        left: r.left - p, top: r.top - p,
        width: r.width + p * 2, height: r.height + p * 2,
        borderRadius: 12,
        animation: 'spotlight-pulse 2s ease infinite',
      }}
    />
  )
}

// ── Tutorial template picker modal ────────────────────────────────────────────
interface PickerProps {
  onSelect: (type: TutorialType) => void
  onClose:  () => void
}

export function TutorialPicker({ onSelect, onClose }: PickerProps) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--overlay-bg)', backdropFilter: 'var(--overlay-blur)' }}
        onClick={onClose}
      />
      {/* Card */}
      <div
        className="relative z-10 w-[460px] mx-4 bg-th-bg-2 border border-th-border rounded-2xl shadow-2xl p-6"
        style={{ animation: 'tutorial-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[16px] font-bold text-th-text-1">Choose a Tutorial</h2>
            <p className="text-[12px] text-th-text-3 mt-0.5">Pick a workflow type to learn by building.</p>
          </div>
          <button type="button" onClick={onClose}
            className="text-th-text-3 hover:text-th-text-1 hover:bg-th-bg-3 transition-all p-1.5 rounded-lg text-xl leading-none"
          >×</button>
        </div>

        <div className="flex flex-col gap-2.5">
          {TUTORIAL_CATALOG.map((tut) => (
            <button
              key={tut.id}
              type="button"
              onClick={() => onSelect(tut.id)}
              className="
                w-full text-left px-4 py-3.5 rounded-xl
                border border-th-border bg-th-bg-1
                hover:bg-th-bg-3 hover:border-indigo-500/40
                transition-all duration-150 group
              "
            >
              <div className="flex items-center gap-3">
                <span className="
                  w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0
                  bg-indigo-500/10 border border-indigo-500/20 text-indigo-500
                  group-hover:bg-indigo-500/18 transition-colors
                ">
                  {tut.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-th-text-1 group-hover:text-th-accent transition-colors">
                    {tut.title}
                  </p>
                  <p className="text-[11px] text-th-text-3 mt-0.5 leading-tight">{tut.description}</p>
                </div>
                <span className="text-th-text-4 group-hover:text-indigo-400 transition-colors text-lg flex-shrink-0">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main tutorial overlay card ────────────────────────────────────────────────
interface OverlayProps {
  isActive:        boolean
  isDone:          boolean
  step:            number
  totalSteps:      number
  stepTitle:       string
  stepHint:        string
  stepIcon:        string
  ghost:           GhostCursorConfig | null
  spotlightTarget: string
  onCancel:        () => void
  onNext:          () => void
  onBack:          () => void
  onBuildOwn:      () => void
  onTryCopilot:    () => void
}

export function TutorialOverlay({
  isActive, isDone, step, totalSteps, stepTitle, stepHint, stepIcon,
  ghost, spotlightTarget, onCancel, onNext, onBack, onBuildOwn, onTryCopilot,
}: OverlayProps) {
  if (!isActive) return null

  const progress = isDone ? 100 : Math.round(((step + 1) / totalSteps) * 100)
  const canGoBack = step > 0 && !isDone

  return (
    <>
      {!isDone && spotlightTarget && <SpotlightGlow targetName={spotlightTarget} />}
      {!isDone && ghost && <GhostCursor config={ghost} />}

      <div className="fixed bottom-6 right-6 z-[200] w-[300px]"
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border-base)',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 0 0 1px var(--border-subtle), 0 24px 64px rgba(0,0,0,0.35), 0 0 40px var(--accent-muted)',
          animation: 'tutorial-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        {isDone ? (
          /* ── Done state ─── */
          <div className="text-center py-1">
            <div className="w-12 h-12 rounded-full bg-green-500/12 border border-green-500/25 flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-bold text-th-text-1 mb-1">Tutorial Complete!</h3>
            <p className="text-th-text-3 text-[12px] mb-5 leading-relaxed">
              You built your first HR workflow.<br/>You're ready to design anything.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={onTryCopilot}
                className="flex-1 px-3 py-2 bg-th-accent hover:opacity-90 rounded-xl text-white text-[12px] font-semibold transition-all"
              >
                ✦ Try Copilot
              </button>
              <button type="button" onClick={onBuildOwn}
                className="flex-1 px-3 py-2 bg-th-bg-3 hover:bg-th-bg-4 border border-th-border rounded-xl text-th-text-1 text-[12px] font-medium transition-all"
              >
                Build Freely
              </button>
            </div>
          </div>
        ) : (
          /* ── Active step ── */
          <>
            {/* Step header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="
                  w-6 h-6 rounded-lg bg-indigo-500/12 border border-indigo-500/25
                  flex items-center justify-center text-[11px] text-indigo-500 flex-shrink-0
                ">
                  {stepIcon}
                </span>
                <span className="text-[9.5px] text-th-text-3 font-mono uppercase tracking-widest">
                  Step {step + 1}/{totalSteps}
                </span>
              </div>
              <button type="button" onClick={onCancel}
                className="text-th-text-4 hover:text-th-text-2 hover:bg-th-bg-3 transition-all text-xl leading-none p-1 rounded-lg"
                title="Exit tutorial"
              >×</button>
            </div>

            {/* Title + hint */}
            <h3 className="text-[14px] font-bold text-th-text-1 mb-2 leading-snug">{stepTitle}</h3>
            <p className="text-[12px] text-th-text-2 leading-relaxed mb-4">{stepHint}</p>

            {/* Progress bar */}
            <div className="h-1 w-full bg-th-bg-3 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Watching indicator */}
            <p className="text-[10px] text-th-text-4 mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60 animate-pulse inline-block" />
              Perform the action shown to continue...
            </p>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              {canGoBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="
                    flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium
                    text-th-text-3 hover:text-th-text-1 bg-th-bg-1
                    border border-th-border hover:border-th-border-strong
                    transition-all duration-150
                  "
                >
                  ← Back
                </button>
              )}
              <button
                type="button"
                onClick={onCancel}
                className="
                  px-3 py-1.5 rounded-lg text-[11px] font-medium
                  text-rose-400/80 hover:text-rose-400
                  border border-transparent hover:border-rose-500/20 hover:bg-rose-500/5
                  transition-all duration-150
                "
              >
                Exit
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={onNext}
                className="
                  flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                  bg-indigo-500/12 border border-indigo-500/25
                  text-indigo-500 hover:bg-indigo-500/20
                  transition-all duration-150
                "
              >
                {step === totalSteps - 1 ? 'Finish' : 'Skip step →'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
