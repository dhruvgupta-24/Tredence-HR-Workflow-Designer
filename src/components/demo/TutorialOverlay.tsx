import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { GhostCursorConfig, StepAnimType } from '../../hooks/useTutorial'
import { TUTORIAL_CATALOG, type TutorialType } from '../../hooks/useTutorial'

// ── Ghost cursor ──────────────────────────────────────────────────────────────
interface GhostProps { config: GhostCursorConfig }

function GhostCursor({ config }: GhostProps) {
  type Phase = 'idle' | 'moving' | 'clicking' | 'holding' | 'returning' | 'vanished'
  const [phase, setPhase] = useState<Phase>('idle')
  const [pos,   setPos]   = useState(config.from)
  const cancelRef         = useRef(false)
  const animType: StepAnimType = config.animType

  useEffect(() => {
    cancelRef.current = false
    setPos(config.from)
    setPhase('idle')

    const sequence = async () => {
      await sleep(300)

      if (animType === 'drag') {
        setPhase('moving'); setPos(config.from); await sleep(200)
        if (cancelRef.current) return
        setPhase('holding'); await sleep(150)
        if (cancelRef.current) return
        setPhase('moving'); setPos(config.to); await sleep(1000)
        if (cancelRef.current) return
        setPhase('clicking'); await sleep(350)
        if (cancelRef.current) return
        setPhase('idle'); await sleep(500)

      } else if (animType === 'connect') {
        setPhase('moving'); setPos({ x: config.from.x + 8, y: config.from.y + 12 }); await sleep(800)
        if (cancelRef.current) return
        setPhase('holding'); await sleep(150)
        if (cancelRef.current) return
        setPhase('moving'); setPos({ x: config.to.x + 8, y: config.to.y - 12 }); await sleep(950)
        if (cancelRef.current) return
        setPhase('clicking'); await sleep(350)
        if (cancelRef.current) return
        setPhase('idle'); await sleep(500)

      } else {
        // click
        setPhase('moving'); setPos(config.to); await sleep(900)
        if (cancelRef.current) return
        setPhase('clicking'); await sleep(400)
        if (cancelRef.current) return
        setPhase('idle'); await sleep(500)
      }

      if (!cancelRef.current) setPhase('vanished')
    }

    void sequence()
    return () => { cancelRef.current = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.from.x, config.from.y, config.to.x, config.to.y, animType])

  const isDragging = phase === 'moving' && animType !== 'click'
  const isHolding  = phase === 'holding'
  const isClicking = phase === 'clicking'

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[180]"
      style={{
        transform: `translate(${pos.x - 4}px, ${pos.y - 2}px)`,
        transition: phase === 'moving'
          ? `transform ${animType !== 'click' ? 1000 : 900}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
          : 'transform 150ms ease',
        opacity: phase === 'vanished' ? 0 : 0.82,
        willChange: 'transform',
      }}
    >
      <svg
        width="20" height="23" viewBox="0 0 22 26" fill="none"
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.55))',
          transform: (isDragging || isHolding) ? 'scale(0.88) rotate(-6deg)' : isClicking ? 'scale(0.85)' : 'scale(1)',
          transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <path d="M2 2l18 10.5L11.5 14l-1.5 9L2 2z"
          fill="rgba(255,255,255,0.9)" stroke="#1a1a2e" strokeWidth="1.5" strokeLinejoin="round"
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

// ── Spotlight glow ring - smooth RAF-based tracking ───────────────────────────
interface SpotlightRect { left: number; top: number; width: number; height: number }

function resolveElement(target: string): Element | null {
  if (!target) return null
  if (target.startsWith('.') || target.startsWith('#')) {
    return document.querySelector(target)
  }
  return document.querySelector(`[data-demo-target="${target}"]`)
}

function SpotlightGlow({ targetName }: { targetName: string }) {
  const [rect, setRect] = useState<SpotlightRect | null>(null)
  const rafRef   = useRef<number>(0)
  const lastTime = useRef(0)
  const prevRect = useRef<SpotlightRect | null>(null)

  const update = useCallback(() => {
    const el = resolveElement(targetName)
    if (!el) { prevRect.current = null; setRect(null); return }
    const r = el.getBoundingClientRect()
    const next: SpotlightRect = { left: r.left, top: r.top, width: r.width, height: r.height }
    const p = prevRect.current
    // Only update state when position actually changed (avoids flood of renders)
    if (!p || Math.abs(p.left - next.left) > 0.5 || Math.abs(p.top - next.top) > 0.5 ||
        Math.abs(p.width - next.width) > 0.5 || Math.abs(p.height - next.height) > 0.5) {
      prevRect.current = next
      setRect(next)
    }
  }, [targetName])

  useEffect(() => {
    // Immediate first read
    update()

    // RAF loop at ~30fps for smooth continuous tracking
    const loop = (time: number) => {
      if (time - lastTime.current > 33) {
        update()
        lastTime.current = time
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    // Instant update on window resize so spotlight snaps immediately
    window.addEventListener('resize', update, { passive: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', update)
    }
  }, [update])

  if (!rect) return null

  const p = 6
  return (
    <div
      className="fixed pointer-events-none z-[175]"
      style={{
        left:    rect.left   - p,
        top:     rect.top    - p,
        width:   rect.width  + p * 2,
        height:  rect.height + p * 2,
        borderRadius: 14,
        // Smooth interpolation as the panel resizes
        transition: 'left 80ms ease, top 80ms ease, width 80ms ease, height 80ms ease',
        animation: 'spotlight-pulse 2s ease infinite',
        willChange: 'left, top, width, height',
      }}
    />
  )
}

// ── Tutorial template picker modal ────────────────────────────────────────────
interface PickerProps {
  onSelect: (type: TutorialType) => void
  onClose:  () => void
}

const TutorialTypeIcon = ({ id }: { id: TutorialType }) => {
  if (id === 'basic') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
  if (id === 'leave') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

export function TutorialPicker({ onSelect, onClose }: PickerProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[300] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'var(--overlay-bg)', backdropFilter: 'var(--overlay-blur)' }}
          onClick={onClose}
        />
        <motion.div
          className="relative z-10 w-[460px] mx-4 bg-th-bg-2 border border-th-border rounded-2xl shadow-2xl p-6"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-bold text-th-text-1">Choose a Tutorial</h2>
              <p className="text-[12px] text-th-text-3 mt-0.5">Pick a workflow type to learn by building.</p>
            </div>
            <button type="button" onClick={onClose}
              className="text-th-text-3 hover:text-th-text-1 hover:bg-th-bg-3 transition-all p-1.5 rounded-lg"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {TUTORIAL_CATALOG.map((tut) => (
              <motion.button
                key={tut.id}
                type="button"
                onClick={() => onSelect(tut.id)}
                whileHover={{ x: 2, transition: { type: 'spring', stiffness: 500, damping: 30 } }}
                whileTap={{ scale: 0.98 }}
                className="
                  w-full text-left px-4 py-3.5 rounded-xl
                  border border-th-border bg-th-bg-1
                  hover:bg-th-bg-3 hover:border-indigo-500/40
                  transition-colors duration-150 group
                "
              >
                <div className="flex items-center gap-3">
                  <span className="
                    w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                    bg-indigo-500/10 border border-indigo-500/20 text-indigo-400
                    group-hover:bg-indigo-500/18 transition-colors
                  ">
                    <TutorialTypeIcon id={tut.id} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-th-text-1 group-hover:text-th-accent transition-colors">
                      {tut.title}
                    </p>
                    <p className="text-[11px] text-th-text-3 mt-0.5 leading-tight">{tut.description}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-th-text-4 group-hover:text-indigo-400 transition-colors flex-shrink-0">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
  const progress  = isDone ? 100 : Math.round(((step + 1) / totalSteps) * 100)
  const canGoBack = step > 0 && !isDone

  return (
    <>
      {isActive && !isDone && spotlightTarget && (
        <SpotlightGlow key={spotlightTarget} targetName={spotlightTarget} />
      )}
      {isActive && !isDone && ghost && (
        <GhostCursor key={`${ghost.from.x}-${ghost.from.y}-${ghost.to.x}-${ghost.to.y}`} config={ghost} />
      )}

      <AnimatePresence>
        {isActive && (
          <motion.div
            className="fixed bottom-6 right-6 z-[200] w-[300px]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36, mass: 0.85 }}
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border-base)',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 0 0 1px var(--border-subtle), 0 24px 64px rgba(0,0,0,0.35), 0 0 40px var(--accent-muted)',
            }}
          >
            <AnimatePresence mode="wait">
              {isDone ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-center py-1"
                >
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
                      Try Copilot
                    </button>
                    <button type="button" onClick={onBuildOwn}
                      className="flex-1 px-3 py-2 bg-th-bg-3 hover:bg-th-bg-4 border border-th-border rounded-xl text-th-text-1 text-[12px] font-medium transition-all"
                    >
                      Build Freely
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
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
                      className="text-th-text-4 hover:text-th-text-2 hover:bg-th-bg-3 transition-all p-1 rounded-lg"
                      title="Exit tutorial"
                    >
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>

                  {/* Title + hint */}
                  <h3 className="text-[14px] font-bold text-th-text-1 mb-2 leading-snug">{stepTitle}</h3>
                  <p className="text-[12px] text-th-text-2 leading-relaxed mb-4">{stepHint}</p>

                  {/* Progress bar */}
                  <div className="h-1 w-full bg-th-bg-3 rounded-full overflow-hidden mb-1">
                    <motion.div
                      className="h-full bg-indigo-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Watching indicator */}
                  <p className="text-[10px] text-th-text-4 mb-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60 animate-pulse inline-block" />
                    Perform the action shown to continue...
                  </p>

                  {/* Navigation */}
                  <div className="flex items-center gap-2">
                    {canGoBack && (
                      <button type="button" onClick={onBack}
                        className="
                          flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium
                          text-th-text-3 hover:text-th-text-1 bg-th-bg-1
                          border border-th-border hover:border-th-border-strong
                          transition-all duration-150
                        "
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Back
                      </button>
                    )}
                    <button type="button" onClick={onCancel}
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
                    <button type="button" onClick={onNext}
                      className="
                        flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                        bg-indigo-500/12 border border-indigo-500/25
                        text-indigo-500 hover:bg-indigo-500/20
                        transition-all duration-150
                      "
                    >
                      {step === totalSteps - 1 ? 'Finish' : 'Skip'}
                      {step < totalSteps - 1 && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
