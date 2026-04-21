/**
 * Runtime DOM position utilities for demo cursor alignment.
 * All positions are viewport-relative pixel coordinates.
 */

/** Center of a [data-demo-target="X"] element. Returns null if not found. */
export function getDemoTarget(name: string): { x: number; y: number } | null {
  const el = document.querySelector(`[data-demo-target="${name}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/** Bounding rect of the React Flow canvas container. */
export function getCanvasRect(): DOMRect | null {
  return (
    document.querySelector('.react-flow__renderer')?.getBoundingClientRect() ??
    document.querySelector('.react-flow')?.getBoundingClientRect() ??
    null
  )
}

/**
 * Convert a React Flow canvas coordinate to screen pixel position.
 * Requires the viewport to be at the known state {x:0, y:0, zoom} set by
 * triggerViewportReset().
 *
 * Formula: screenPos = containerTopLeft + rfCoord * zoom
 */
export function rfToScreen(
  rfX: number,
  rfY: number,
  zoom: number,
  containerRect: DOMRect,
): { x: number; y: number } {
  return {
    x: containerRect.left + rfX * zoom,
    y: containerRect.top  + rfY * zoom,
  }
}

/**
 * Center of a rendered node given its RF position and canvas state.
 * RF nodes are approximately 240px wide, 80px tall (before zoom).
 */
export function nodeCenter(
  rfX: number,
  rfY: number,
  zoom: number,
  containerRect: DOMRect,
  nodeWidthRF = 240,
  nodeHeightRF = 80,
): { x: number; y: number } {
  return rfToScreen(rfX + nodeWidthRF / 2, rfY + nodeHeightRF / 2, zoom, containerRect)
}

/**
 * Bottom handle of a node (source handle center).
 * RF handles are at the very bottom edge of the node.
 */
export function nodeBottomHandle(
  rfX: number,
  rfY: number,
  zoom: number,
  containerRect: DOMRect,
  nodeWidthRF = 240,
  nodeHeightRF = 80,
): { x: number; y: number } {
  return rfToScreen(rfX + nodeWidthRF / 2, rfY + nodeHeightRF, zoom, containerRect)
}

/** Top handle of a node (target handle center). */
export function nodeTopHandle(
  rfX: number,
  rfY: number,
  zoom: number,
  containerRect: DOMRect,
  nodeWidthRF = 240,
): { x: number; y: number } {
  return rfToScreen(rfX + nodeWidthRF / 2, rfY, zoom, containerRect)
}
