import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from '../../store/toastStore'
import type { ToastVariant } from '../../store/toastStore'

const SuccessIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const ErrorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

const WarningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

const STYLE: Record<ToastVariant, { bg: string; border: string; icon: React.FC; iconColor: string }> = {
  success: { bg: 'bg-th-bg-2', border: 'border-green-500/25',  icon: SuccessIcon, iconColor: 'text-green-400' },
  error:   { bg: 'bg-th-bg-2', border: 'border-red-500/25',    icon: ErrorIcon,   iconColor: 'text-red-400' },
  warning: { bg: 'bg-th-bg-2', border: 'border-amber-500/25',  icon: WarningIcon, iconColor: 'text-amber-400' },
  info:    { bg: 'bg-th-bg-2', border: 'border-indigo-500/25', icon: InfoIcon,    iconColor: 'text-indigo-400' },
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const remove  = useToastStore((s) => s.remove)

  return (
    <div
      className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 items-end pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const s = STYLE[t.variant]
          const Icon = s.icon
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 420, damping: 36, mass: 0.8 }}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl',
                'text-[13px] font-medium max-w-[320px] min-w-[200px] pointer-events-auto',
                'backdrop-blur-md',
                s.bg, s.border,
              ].join(' ')}
            >
              <span className={`flex-shrink-0 ${s.iconColor}`}><Icon /></span>
              <span className="flex-1 text-th-text-1 leading-snug">{t.message}</span>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="text-th-text-4 hover:text-th-text-2 transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
