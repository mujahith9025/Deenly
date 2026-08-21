import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light' | 'system'

interface ThemeState {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  initTheme: () => void
}

const THEME_KEY = 'deenly_theme'

function applyThemeToDocument(theme: ThemeMode) {
  const root = document.documentElement
  let resolvedTheme = theme

  if (theme === 'system') {
    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  if (resolvedTheme === 'light') {
    root.classList.remove('dark')
    root.classList.add('light')
    root.style.colorScheme = 'light'
  } else {
    root.classList.remove('light')
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem(THEME_KEY) as ThemeMode) || 'dark',

  setTheme: (theme: ThemeMode) => {
    localStorage.setItem(THEME_KEY, theme)
    applyThemeToDocument(theme)
    set({ theme })
  },

  initTheme: () => {
    const saved = (localStorage.getItem(THEME_KEY) as ThemeMode) || 'dark'
    applyThemeToDocument(saved)
    set({ theme: saved })

    // Listen to system preference changes if 'system' is selected
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (get().theme === 'system') {
        applyThemeToDocument('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
  },
}))
