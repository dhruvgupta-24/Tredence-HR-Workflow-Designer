import clsx from 'clsx'
import type { ReactNode } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  children,
  className,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        variant === 'primary' &&
          'bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500',
        variant === 'secondary' &&
          'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500',
        variant === 'danger' &&
          'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
        variant === 'ghost' &&
          'border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white focus:ring-gray-500',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
    >
      {children}
    </button>
  )
}
