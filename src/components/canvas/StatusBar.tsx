export function StatusBar() {
  return (
    <div className="h-7 flex-shrink-0 flex items-center px-4 gap-4 bg-th-bg-nav border-b border-th-border-subtle">
      <StatusPill color="green" label="Saved locally" dot />
      <StatusPill color="indigo" label="Build ready" />
      <StatusPill color="green" label="Zero errors" />
      <div className="flex-1" />
      <span className="text-[9px] text-th-text-4 font-mono tracking-widest uppercase">FlowHR v1.0</span>
    </div>
  )
}

function StatusPill({ color, label, dot }: { color: 'green' | 'indigo'; label: string; dot?: boolean }) {
  const clr    = color === 'green' ? 'text-green-500' : 'text-indigo-400'
  const dotClr = color === 'green' ? 'bg-green-500'   : 'bg-indigo-400'
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-medium ${clr}`}>
      {dot ? (
        <span className={`w-1.5 h-1.5 rounded-full ${dotClr} animate-pulse`} />
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
      {label}
    </span>
  )
}
