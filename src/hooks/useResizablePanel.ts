import { useState, useCallback, useRef, useEffect } from 'react'
import { useWorkflowStore } from '../store'

interface UseResizablePanelProps {
  currentWidth: number
  minWidth: number
  maxWidth: number
  defaultWidth: number
  onWidthChange: (w: number) => void
  side: 'left' | 'right'
}

export function useResizablePanel({
  currentWidth,
  minWidth,
  maxWidth,
  defaultWidth,
  onWidthChange,
  side,
}: UseResizablePanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const triggerFitView = useWorkflowStore((s) => s.triggerFitView)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      setIsDragging(true)
      startXRef.current = e.clientX
      startWidthRef.current = currentWidth
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [currentWidth],
  )

  const onDoubleClick = useCallback(() => {
    onWidthChange(defaultWidth)
    // Small delay to let React Flow stabilize then fit view
    setTimeout(triggerFitView, 50)
  }, [defaultWidth, onWidthChange, triggerFitView])

  useEffect(() => {
    if (!isDragging) return

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startXRef.current
      const directionalDelta = side === 'left' ? deltaX : -deltaX
      let newWidth = startWidthRef.current + directionalDelta
      if (newWidth < minWidth) newWidth = minWidth
      if (newWidth > maxWidth) newWidth = maxWidth
      onWidthChange(newWidth)
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setTimeout(triggerFitView, 50)
    }

    // Attach to document to catch fast mouse moves outside the element
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, minWidth, maxWidth, side, onWidthChange, triggerFitView])

  return {
    isDragging,
    onPointerDown,
    onDoubleClick,
  }
}
