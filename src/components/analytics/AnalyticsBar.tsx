import { useMemo } from 'react'
import { useWorkflowStore } from '../../store'

const DURATION_DAYS: Record<string, number> = {
  start:     0,
  task:      1,
  approval:  2,
  automated: 0.25,
  end:       0,
}

function Sep() {
  return <span className="w-px h-3 bg-th-border flex-shrink-0" aria-hidden />
}

function Stat({
  label, value, valueClass = '',
}: { label: string; value: string; valueClass?: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-th-text-3 text-[10px]">{label}</span>
      <span className={`text-[11px] font-semibold tabular-nums text-th-text-2 ${valueClass}`}>{value}</span>
    </span>
  )
}

export function AnalyticsBar() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)

  const stats = useMemo(() => {
    if (!nodes.length) return null

    const automated = nodes.filter((n) => n.type === 'automated').length
    const approvals  = nodes.filter((n) => n.type === 'approval').length
    const tasks      = nodes.filter((n) => n.type === 'task').length
    const autoPct    = Math.round((automated / nodes.length) * 100)
    const estDays    = nodes.reduce((s, n) => s + (DURATION_DAYS[n.type ?? ''] ?? 1), 0)

    const inDeg: Record<string, number> = {}
    edges.forEach((e) => { inDeg[e.target] = (inDeg[e.target] ?? 0) + 1 })
    let bottleneck = ''
    let maxIn = 1
    nodes.forEach((n) => {
      const d = inDeg[n.id] ?? 0
      if (d > maxIn) { maxIn = d; bottleneck = String(n.data.title ?? '') }
    })

    return { nodeCount: nodes.length, edgeCount: edges.length, autoPct, estDays, tasks, approvals, bottleneck }
  }, [nodes, edges])

  if (!stats) return null

  return (
    <div
      className="h-9 flex-shrink-0 border-t border-th-border bg-th-bg-1 flex items-center px-4 gap-3 overflow-hidden"
      aria-label="Workflow analytics"
    >
      <Stat label="Nodes"      value={`${stats.nodeCount}`} />
      <Sep />
      <Stat label="Automation" value={`${stats.autoPct}%`}
        valueClass={stats.autoPct >= 40 ? 'text-green-400' : ''} />
      <Sep />
      <Stat label="Est. Duration" value={`${stats.estDays.toFixed(1)}d`} />
      <Sep />
      <Stat label="Tasks"     value={`${stats.tasks}`} />
      <Sep />
      <Stat label="Approvals" value={`${stats.approvals}`}
        valueClass={stats.approvals >= 3 ? 'text-amber-400' : ''} />

      {stats.bottleneck && (
        <>
          <Sep />
          <span className="flex items-center gap-1.5 text-[10px]">
            <span className="text-amber-500" aria-hidden>⚠</span>
            <span className="text-th-text-3">Bottleneck</span>
            <span className="text-amber-400 font-semibold max-w-[120px] truncate">{stats.bottleneck}</span>
          </span>
        </>
      )}

      {stats.approvals >= 3 && (
        <>
          <Sep />
          <span className="text-[10px] text-amber-500/80 font-medium">Long approval chain</span>
        </>
      )}

      <div className="flex-1" />
      <span className="text-[10px] text-th-text-4 font-mono">{stats.edgeCount} connections</span>
    </div>
  )
}
