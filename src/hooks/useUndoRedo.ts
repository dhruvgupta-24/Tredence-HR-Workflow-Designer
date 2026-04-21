import { useEffect } from 'react'
import { useWorkflowStore } from '../store'

export function useUndoRedo() {
  const undo = useWorkflowStore((s) => s.undo)
  const redo = useWorkflowStore((s) => s.redo)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const removeNode = useWorkflowStore((s) => s.removeNode)
  const saveSnapshot = useWorkflowStore((s) => s.saveSnapshot)
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      // Do not intercept when typing in form controls
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        redo()
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault()
        saveSnapshot()
        removeNode(selectedNodeId)
      } else if (e.key === 'Escape') {
        setSelectedNode(null)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, selectedNodeId, removeNode, saveSnapshot, setSelectedNode])
}
