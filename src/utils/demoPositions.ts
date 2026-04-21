/**
 * Utilities for querying real DOM positions of demo targets.
 * All positions are viewport-relative pixel coordinates (screen space).
 */

/** Returns center {x, y} of a [data-demo-target] element, or null if not found. */
export function getDemoTarget(name: string): { x: number; y: number } | null {
  const el = document.querySelector(`[data-demo-target="${name}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/** Returns center of the React Flow canvas area. */
export function getCanvasCenter(): { x: number; y: number } {
  const el =
    document.querySelector('.react-flow__renderer') ??
    document.querySelector('.react-flow')
  if (el) {
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width * 0.38, y: r.top + r.height * 0.35 }
  }
  // Layout fallback (sidebar=240, right=320, toolbar=76)
  const cx = (window.innerWidth - 320 + 240) / 2
  return { x: cx, y: window.innerHeight * 0.4 }
}

/** Canvas positions staggered vertically for node placement. */
export function getCanvasDropPositions(): { x: number; y: number }[] {
  const el =
    document.querySelector('.react-flow__renderer') ??
    document.querySelector('.react-flow')
  const base = el
    ? (() => {
        const r = el.getBoundingClientRect()
        return { left: r.left + r.width * 0.35, top: r.top }
      })()
    : { left: (window.innerWidth - 320 + 240) / 2 - 80, top: 76 }

  const vh = window.innerHeight - 76 // canvas height
  const step = vh / 5
  return [
    { x: base.left, y: base.top + step * 1 },
    { x: base.left, y: base.top + step * 2 },
    { x: base.left, y: base.top + step * 3 },
    { x: base.left, y: base.top + step * 4 },
  ]
}
