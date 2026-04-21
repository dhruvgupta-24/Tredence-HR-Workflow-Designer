import { useEffect, useRef, useState } from 'react'
import type { GhostCursorConfig, StepAnimType } from '../../hooks/useTutorial'
import { TUTORIAL_CATALOG, type TutorialType } from '../../hooks/useTutorial'

// ── Step-context-aware ghost cursor ──────────────────────────────────────────
interface GhostProps {
  config:   GhostCursorConfig
}

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
      await sleep(300)  // slight pause before each loop starts

      while (!cancelRef.current) {
        if (animType === 'drag') {
          // Hover source, drag to target, release, pause, jump back
          setPhase('moving')
          setPos(config.from)
          await sleep(200)
          if (cancelRef.current) break

          setPhase('holding')  // press style
          await sleep(150)
          if (cancelRef.current) break

          setPhase('moving')
          setPos(config.to)
          await sleep(1000)
          if (cancelRef.current) break

          setPhase('clicking')
          await sleep(350)
          if (cancelRef.current) break

          setPhase('idle')
          await sleep(500)
          if (cancelRef.current) break

          setPhase('returning')
          setPos(config.from)
          await sleep(100)

        } else if (animType === 'connect') {
          // Move to source handle area, pause, drag to target handle, click
          setPhase('moving')
          setPos({ x: config.from.x, y: config.from.y + 20 }) // slightly below (handle area)
          await sleep(800)
          if (cancelRef.current) break

          setPhase('holding')
          await sleep(150)
          if (cancelRef.current) break

          setPhase('moving')
          setPos({ x: config.to.x, y: config.to.y - 20 }) // slightly above target (handle area)
          await sleep(900)
          if (cancelRef.current) break

          setPhase('clicking')
          await sleep(350)
          if (cancelRef.current) break

          setPhase('idle')
          await sleep(500)
          if (cancelRef.current) break

          setPhase('returning')
          setPos(config.from)
          await sleep(100)

        } else {
          // 'click' - move to target, pulse, pause, return
          setPhase('moving')
          setPos(config.to)
          await sleep(900)
          if (cancelRef.current) break

          setPhase('clicking')
          await sleep(400)
          if (cancelRef.current) break

          setPhase('idle')
          await sleep(600)
          if (cancelRef.current) break

          setPhase('returning')
          setPos(config.from)
          await sleep(100)
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
        opacity: isReturning ? 0 : 0.72,
      }}
    >
      <svg
        width="20" height="23" viewBox="0 0 22 26" fill="none"
        style={{
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
          transform: (isDragging || isHolding) ? 'scale(0.88) rotate(-6deg)' : isClicking ? 'scale(0.85)' : 'scale(1)',
          transition: 'transform 0.18s ease',
        }}
      >
        <path d="M2 2l18 10.5L11.5 14l-1.5 9L2 2z" fill="rgba(255,255,255,0.75)" stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>
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
        borderRadius: 10,
        animation: 'spotlight-pulse 2s ease infinite',
      }}
    />
  )
}

// ── Tutorial picker modal ─────────────────────────────────────────────────────
interface PickerProps {
  onSelect: (type: TutorialType) => void
  onClose:  () => void
}

export function TutorialPicker({ onSelect, onClose }: PickerProps) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-[440px] bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl p-6"
        style={{ animation: 'tutorial-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Choose a Tutorial</h2>
            <p className="text-xs text-gray-500 mt-0.5">Pick a workflow type to learn by building.</p>
          </div>
          <button type="button" onClick={onClose}
            className="text-gray-600 hover:text-gray-400 transition-colors text-xl leading-none"
          >×</button>
        </div>

        <div className="flex flex-col gap-3">
          {TUTORIAL_CATALOG.map((tut) => (
            <button
              key={tut.id}
              type="button"
              onClick={() => onSelect(tut.id)}
              className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-700/60 bg-gray-800/50 hover:bg-gray-800 hover:border-indigo-500/40 transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center text-base text-indigo-400 flex-shrink-0 group-hover:bg-indigo-600/25 transition-colors">
                  {tut.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{tut.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tut.description}</p>
                </div>
                <span className="ml-auto text-gray-700 group-hover:text-indigo-400 transition-colors text-lg">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main tutorial overlay ─────────────────────────────────────────────────────
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
  onBuildOwn:      () => void
  onTryCopilot:    () => void
}

export function TutorialOverlay({
  isActive, isDone, step, totalSteps, stepTitle, stepHint, stepIcon,
  ghost, spotlightTarget, onCancel, onBuildOwn, onTryCopilot,
}: OverlayProps) {
  if (!isActive) return null

  const progress = isDone ? 100 : Math.round((step / totalSteps) * 100)

  return (
    <>
      {!isDone && spotlightTarget && <SpotlightGlow targetName={spotlightTarget} />}
      {!isDone && ghost && <GhostCursor config={ghost} />}

      <div className="fixed bottom-6 right-6 z-[200] w-80 tutorial-card">
        {isDone ? (
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Tutorial Complete!</h3>
            <p className="text-gray-400 text-sm mb-6">You built your first workflow.<br/>You're ready to automate.</p>
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
              >×</button>
            </div>

            <h3 className="text-[15px] font-bold text-white mb-2">{stepTitle}</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{stepHint}</p>

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
