'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'Dark' | 'Light' | 'Blue Light'

type ThemeContextValue = {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const s = localStorage.getItem('pathwise_theme') as Theme | null
      return (s as Theme) || 'Dark'
    } catch {
      return 'Dark'
    }
  })

  useEffect(() => {
    try { localStorage.setItem('pathwise_theme', theme) } catch {}
    const root = document.documentElement
    const cls = theme === 'Dark' ? 'theme-dark' : theme === 'Light' ? 'theme-light' : 'theme-blue'
    root.classList.remove('theme-dark', 'theme-light', 'theme-blue')
    root.classList.add(cls)
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('ThemeContext missing')
  return ctx
}
