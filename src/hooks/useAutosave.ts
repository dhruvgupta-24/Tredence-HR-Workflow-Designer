import { useEffect, useRef } from 'react'
import { useWorkflowStore } from '../store'
import { saveToStorage } from '../utils/serialization'

export function useAutosave() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const sidebarWidth = useWorkflowStore((s) => s.sidebarWidth)
  const sandboxWidth = useWorkflowStore((s) => s.sandboxWidth)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveToStorage(nodes, edges, sidebarWidth, sandboxWidth)
    }, 500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, sidebarWidth, sandboxWidth])
}
