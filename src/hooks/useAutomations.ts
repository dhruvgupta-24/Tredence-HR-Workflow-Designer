import { useEffect, useRef } from 'react'
import { useWorkflowStore } from '../store'
import { getAutomations } from '../api/automations'

export function useAutomations() {
  const setAutomations = useWorkflowStore((s) => s.setAutomations)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    void getAutomations().then(setAutomations)
  }, [setAutomations])
}
