/** Animated fake cursor that follows scripted paths during Live Demo. */

export type CursorMode = 'normal' | 'hover' | 'drag' | 'click'

export interface CursorState {
  x: number
  y: number
  duration: number   // CSS transition duration in ms
  visible: boolean
  mode: CursorMode
}

interface Props {
  state: CursorState
}

export function FakeCursor({ state }: Props) {
  if (!state.visible) return null

  const isGrab    = state.mode === 'drag'
  const isHover   = state.mode === 'hover'
  const isClick   = state.mode === 'click'

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
      style={{
        transform: `translate(${state.x}px, ${state.y}px)`,
        transition: state.duration > 0
          ? `transform ${state.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
          : 'none',
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="22"
        height="26"
        viewBox="0 0 22 26"
        fill="none"
        style={{
          transform: isGrab ? 'scale(0.88) rotate(-6deg)' : isHover ? 'scale(0.95)' : 'scale(1)',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
          transition: 'transform 0.15s ease',
        }}
      >
        <path
          d="M2 2l18 10.5L11.5 14l-1.5 9L2 2z"
          fill="white"
          stroke="#111827"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Click ripple */}
      {isClick && (
        <div
          className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-indigo-400/50"
          style={{ animation: 'cursor-ripple 0.45s ease-out forwards' }}
        />
      )}

      {/* Drag glow */}
      {isGrab && (
        <div
          className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-violet-500/20 blur-sm"
          style={{ animation: 'pulse 1s ease infinite' }}
        />
      )}
    </div>
  )
}
