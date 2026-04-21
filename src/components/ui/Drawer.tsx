import clsx from 'clsx'
import type { ReactNode } from 'react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  return (
    <div
      className={clsx(
        'fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-800 z-50',
        'flex flex-col transform transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800 flex-shrink-0">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Properties</p>
          <h2 className="text-sm font-semibold text-white mt-0.5 truncate">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 flex-shrink-0 text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800"
          aria-label="Close properties panel"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  )
}
