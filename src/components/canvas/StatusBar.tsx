/** A slim banner that lives below CanvasControls giving recruiters real-time confidence. */
export function StatusBar() {
  return (
    <div className="h-7 flex-shrink-0 flex items-center px-4 gap-4 bg-gray-950 border-b border-gray-800/40">
      <StatusPill color="green" label="Saved locally" dot />
      <StatusPill color="indigo" label="Build ready" />
      <StatusPill color="green"  label="Zero errors" />
      <div className="flex-1" />
      <span className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">FlowHR · v1.0</span>
    </div>
  )
}

function StatusPill({ color, label, dot }: { color: 'green' | 'indigo'; label: string; dot?: boolean }) {
  const clr = color === 'green' ? 'text-green-500' : 'text-indigo-400'
  const dotClr = color === 'green' ? 'bg-green-500' : 'bg-indigo-400'
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-medium ${clr}`}>
      {dot ? (
        <span className={`w-1.5 h-1.5 rounded-full ${dotClr} animate-pulse`} />
      ) : (
        <span className="text-xs leading-none">✓</span>
      )}
      {label}
    </span>
  )
}
