import clsx from 'clsx'
import type { ReactNode } from 'react'

type BadgeColor = 'green' | 'blue' | 'orange' | 'purple' | 'red' | 'gray'

const colorMap: Record<BadgeColor, string> = {
  green: 'bg-green-500/20 text-green-400 border border-green-500/40',
  blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
  orange: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
  purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
  red: 'bg-red-500/20 text-red-400 border border-red-500/40',
  gray: 'bg-gray-500/20 text-gray-400 border border-gray-500/40',
}

export function Badge({ color, children }: { color: BadgeColor; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        colorMap[color],
      )}
    >
      {children}
    </span>
  )
}
