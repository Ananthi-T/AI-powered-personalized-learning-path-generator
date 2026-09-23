'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'English' | 'Tamil' | 'Hindi'

type LanguageContextValue = {
  language: Lang
  setLanguage: (l: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem('pathwise_lang') as Lang | null
      return (s as Lang) || 'English'
    } catch {
      return 'English'
    }
  })

  useEffect(() => {
    try { localStorage.setItem('pathwise_lang', language) } catch {}
    const root = document.documentElement
    root.setAttribute('data-lang', language.toLowerCase())
  }, [language])

  const value = useMemo(() => ({ language, setLanguage }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('LanguageContext missing')
  return ctx
}
