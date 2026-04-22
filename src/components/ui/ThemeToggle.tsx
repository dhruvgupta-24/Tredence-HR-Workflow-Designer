import { useRef } from 'react'
import { useThemeStore } from '../../store/themeStore'

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()
  const isDark = theme === 'dark'
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    // Store the click origin so the CSS clip-path animation expands from here
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      document.documentElement.style.setProperty('--theme-x', `${rect.left + rect.width / 2}px`)
      document.documentElement.style.setProperty('--theme-y', `${rect.top + rect.height / 2}px`)
    }

    const next = isDark ? 'light' : 'dark'

    // Use the View Transitions API if available (Chrome 111+) for the
    // cinematic circular reveal; fall back to instant swap everywhere else.
    const vt = document as Document & { startViewTransition?: (cb: () => void) => void }
    if (vt.startViewTransition) {
      vt.startViewTransition(() => { setTheme(next) })
    } else {
      setTheme(next)
    }
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      className="
        relative p-2 rounded-lg flex-shrink-0
        text-th-text-3 hover:text-th-text-1
        border border-transparent hover:border-th-border
        hover:bg-th-bg-3
        transition-all duration-150
      "
    >
      {isDark ? (
        // Sun - click to go light
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1"     x2="12" y2="3"/>
          <line x1="12" y1="21"    x2="12" y2="23"/>
          <line x1="4.22" y1="4.22"  x2="5.64"  y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1"  y1="12" x2="3"  y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
          <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        // Moon - click to go dark
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}
