/**
 * Theme store — manages light/dark mode via Zustand.
 * Applies `data-theme` attribute to <html> synchronously on import,
 * so there is zero flash-of-wrong-theme on page load.
 */
import { create } from 'zustand'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'flowhr-theme'
const DEFAULT_THEME: Theme = 'dark'

function getPersistedTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch { /* SSR safety */ }
  return DEFAULT_THEME
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

// Apply immediately before React renders — prevents any FOUC
const initialTheme = getPersistedTheme()
applyTheme(initialTheme)

interface ThemeState {
  theme:       Theme
  setTheme:    (t: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,

  setTheme: (theme) => {
    applyTheme(theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* */ }
    set({ theme })
  },

  toggleTheme: () => {
    get().setTheme(get().theme === 'dark' ? 'light' : 'dark')
  },
}))
