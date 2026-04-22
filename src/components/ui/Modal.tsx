import type { ReactNode } from 'react'

interface Props {
  isOpen:   boolean
  onClose:  () => void
  title:    string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center modal-backdrop animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-th-bg-2 border border-th-border rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-th-border">
          <h2 className="text-[13px] font-semibold text-th-text-1">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-th-text-3 hover:text-th-text-1 transition-colors p-1 rounded-lg hover:bg-th-bg-3"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-th-text-2">{children}</div>
      </div>
    </div>
  )
}
