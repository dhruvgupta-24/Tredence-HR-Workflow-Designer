import { useEffect, useRef, useState } from 'react'
import type { GhostCursorConfig } from '../../hooks/useTutorial'

// ── Ghost cursor that loops from→to demonstrating each tutorial step ───────────
interface GhostCursorProps {
  config: GhostCursorConfig
  isDrag?: boolean
}

function GhostCursor({ config, isDrag }: GhostCursorProps) {
  const [phase, setPhase] = useState<'idle' | 'moving' | 'clicking' | 'returning'>('idle')
  const [pos, setPos]     = useState(config.from)
  const cancelRef         = useRef(false)

  useEffect(() => {
    cancelRef.current = false
    setPos(config.from)

    const loop = async () => {
      while (!cancelRef.current) {
        // Move to target
        setPhase('moving')
        setPos(config.to)
        await sleep(950)
        if (cancelRef.current) break

        // Click/drop
        setPhase('clicking')
        await sleep(420)
        if (cancelRef.current) break

        // Pause at destination
        setPhase('idle')
        await sleep(400)
        if (cancelRef.current) break

        // Jump back (instant, invisible)
        setPhase('returning')
        setPos(config.from)
        await sleep(120)
      }
    }

    void loop()
    return () => { cancelRef.current = true }
  }, [config.from.x, config.from.y, config.to.x, config.to.y]) // eslint-disable-line react-hooks/exhaustive-deps

  const isMoving   = phase === 'moving'
  const isClicking = phase === 'clicking'
  const isReturn   = phase === 'returning'

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[180]"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: isMoving
          ? 'transform 950ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          : isReturn
          ? 'none'
          : 'transform 0.1s ease',
        opacity: isReturn ? 0 : 0.75,
      }}
    >
      <svg
        width="20" height="23" viewBox="0 0 22 26" fill="none"
        style={{
          filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
          transform: (isDrag && isMoving) ? 'scale(0.85) rotate(-5deg)' : isClicking ? 'scale(0.9)' : 'scale(1)',
          transition: 'transform 0.15s ease',
        }}
      >
        <path d="M2 2l18 10.5L11.5 14l-1.5 9L2 2z" fill="rgba(255,255,255,0.7)" stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>

      {/* Click ring */}
      {isClicking && (
        <div
          className="absolute -top-1 -left-1 w-5 h-5 rounded-full border border-indigo-400/70"
          style={{ animation: 'cursor-ripple 0.4s ease-out forwards' }}
        />
      )}
    </div>
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Tutorial spotlight highlight bar ──────────────────────────────────────────
interface SpotlightProps {
  targetName: string
}

function SpotlightGlow({ targetName }: SpotlightProps) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const update = () => {
      const el = document.querySelector(`[data-demo-target="${targetName}"]`)
      if (el) setRect(el.getBoundingClientRect())
    }
    update()
    const id = setInterval(update, 500)
    return () => clearInterval(id)
  }, [targetName])

  if (!rect) return null
  const pad = 6

  return (
    <div
      className="fixed pointer-events-none z-[175]"
      style={{
        left:   rect.left - pad,
        top:    rect.top  - pad,
        width:  rect.width  + pad * 2,
        height: rect.height + pad * 2,
        borderRadius: 10,
        boxShadow: '0 0 0 2px rgba(99,102,241,0.7), 0 0 20px 4px rgba(99,102,241,0.25)',
        animation: 'spotlight-pulse 2s ease infinite',
      }}
    />
  )
}

// ── Main TutorialOverlay component ────────────────────────────────────────────
interface Props {
  isActive:    boolean
  isDone:      boolean
  step:        number
  totalSteps:  number
  stepTitle:   string
  stepHint:    string
  stepIcon:    string
  ghost:       GhostCursorConfig | null
  spotlightTarget: string
  onCancel:    () => void
  onBuildOwn:  () => void
  onTryCopilot: () => void
}

export function TutorialOverlay({
  isActive, isDone, step, totalSteps, stepTitle, stepHint, stepIcon,
  ghost, spotlightTarget, onCancel, onBuildOwn, onTryCopilot,
}: Props) {
  if (!isActive) return null

  const progress = isDone ? 100 : Math.round((step / totalSteps) * 100)

  return (
    <>
      {/* Spotlight glow ring around target element */}
      {!isDone && spotlightTarget && <SpotlightGlow targetName={spotlightTarget} />}

      {/* Looping ghost cursor */}
      {!isDone && ghost && <GhostCursor config={ghost} isDrag={step < 3} />}

      {/* Instruction card - bottom right */}
      <div className="fixed bottom-6 right-6 z-[200] w-80 tutorial-card">

        {isDone ? (
          // ── Celebration card ──────────────────────────────────────────────
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Tutorial Complete!</h3>
            <p className="text-gray-400 text-sm mb-6">
              You built your first workflow.<br/>You&apos;re ready to automate.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={onTryCopilot}
                className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-semibold transition-colors"
              >
                ✦ Try Copilot
              </button>
              <button type="button" onClick={onBuildOwn}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Build Freely
              </button>
            </div>
          </div>

        ) : (
          // ── Step instruction card ─────────────────────────────────────────
          <>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm text-indigo-400 flex-shrink-0">
                  {stepIcon}
                </span>
                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                  Step {step + 1} of {totalSteps}
                </p>
              </div>
              <button type="button" onClick={onCancel}
                className="text-gray-600 hover:text-gray-400 transition-colors text-xl leading-none"
                title="Exit tutorial"
              >
                ×
              </button>
            </div>

            <h3 className="text-[15px] font-bold text-white mb-2">{stepTitle}</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{stepHint}</p>

            {/* Progress bar */}
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-700 mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-pulse inline-block" />
              Watching for your action...
            </p>
          </>
        )}
      </div>
    </>
  )
}
