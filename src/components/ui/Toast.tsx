import { useToastStore } from '../../store/toastStore'
import type { ToastVariant } from '../../store/toastStore'

const STYLE: Record<ToastVariant, { bar: string; icon: string; iconColor: string }> = {
  success: { bar: 'bg-gray-900 border-green-800/50',  icon: '✓', iconColor: 'text-green-400' },
  error:   { bar: 'bg-gray-900 border-red-800/50',    icon: '✕', iconColor: 'text-red-400' },
  warning: { bar: 'bg-gray-900 border-amber-800/50',  icon: '⚠', iconColor: 'text-amber-400' },
  info:    { bar: 'bg-gray-900 border-indigo-800/50', icon: 'ℹ', iconColor: 'text-indigo-400' },
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const remove  = useToastStore((s) => s.remove)

  return (
    <div
      className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 items-end pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const s = STYLE[t.variant]
        return (
          <div
            key={t.id}
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl',
              'text-[13px] font-medium max-w-[320px] min-w-[200px] pointer-events-auto',
              'animate-slide-up backdrop-blur-md',
              s.bar,
            ].join(' ')}
          >
            <span className={`text-sm font-bold flex-shrink-0 ${s.iconColor}`}>{s.icon}</span>
            <span className="flex-1 text-gray-200 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0 text-base leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
