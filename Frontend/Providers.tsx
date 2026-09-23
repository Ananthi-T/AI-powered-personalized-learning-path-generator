'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LanguageProvider, useLanguage } from '../context/LanguageContext'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/_not-found',
  '/_error',
])

function PrefsInitializer() {
  const router = useRouter()
  const pathname = usePathname()
  const { setLanguage } = useLanguage()
  const { setTheme } = useTheme()
  useEffect(() => {
    if (PUBLIC_PATHS.has(pathname) || pathname?.startsWith('/_next') || pathname?.startsWith('/api')) {
      return
    }
    ;(async () => {
      try {
        const res = await fetch('/api/settings', {
          cache: 'no-store',
          credentials: 'include'
        })
        if (res.status === 401) {
          router.push('/login')
          return
        }
        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          const p = data.preferences || {}
          if (p.language) setLanguage(p.language)
          if (p.theme) setTheme(p.theme)
        }
      } catch {}
    })()
  }, [router, pathname, setLanguage, setTheme])
  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <PrefsInitializer />
        {children}
      </ThemeProvider>
    </LanguageProvider>
  )
}
