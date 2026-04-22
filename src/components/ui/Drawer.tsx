import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'var(--overlay-bg)', backdropFilter: 'var(--overlay-blur)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-80 bg-th-bg-1 border-l border-th-border z-50 flex flex-col"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.9 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-th-border flex-shrink-0">
              <div className="min-w-0">
                <p className="text-[9.5px] uppercase tracking-[0.12em] text-th-text-3 font-bold">Properties</p>
                <h2 className="text-[13px] font-semibold text-th-text-1 mt-0.5 truncate">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="ml-2 flex-shrink-0 text-th-text-3 hover:text-th-text-1 transition-colors p-1.5 rounded-lg hover:bg-th-bg-3"
                aria-label="Close properties panel"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
