'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    try {
      const theme = localStorage.getItem('pathwise_theme') || 'Dark'
      const lang = localStorage.getItem('pathwise_lang') || 'English'
      const root = document.documentElement
      root.classList.remove('theme-dark', 'theme-light', 'theme-blue')
      root.classList.add(theme === 'Dark' ? 'theme-dark' : theme === 'Light' ? 'theme-light' : 'theme-blue')
      root.setAttribute('data-lang', lang.toLowerCase())
    } catch {}
  }, [])

  async function onLogout() {
    try {
      setLoading(true)
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const nav = [
    { label: t('nav.aiSnapshot'), href: '/app/ai-snapshot' },
    { label: t('nav.learningPath'), href: '/app/learning-path' },
    { label: t('nav.dailyTasks'), href: '/app/daily-plan' },
    { label: t('nav.skillValidation'), href: '/app/skill-check' },
    { label: t('nav.dashboard'), href: '/app/dashboard' },
    { label: t('nav.aiCoach'), href: '/app/ai-coach' },
    { label: t('nav.realWorld'), href: '/app/market-alignment' },
    { label: t('nav.profile'), href: '/app/profile' },
    { label: t('nav.settings'), href: '/app/settings' }
  ]

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="space-y-1">
          {nav.map(i => {
            const active = pathname === i.href
            return (
              <button
                key={i.href}
                onClick={() => router.push(i.href)}
                className={`w-full text-left px-4 py-2 rounded-md border transition ${
                  active ? 'bg-primary/20 border-primary/30 text-white' : 'bg-transparent border-white/10 text-gray-300 hover:bg-white/5'
                }`}
              >
                {i.label}
              </button>
            )
          })}
        </div>
        <div className="h-px bg-white/10" />
        <button
          onClick={onLogout}
          disabled={loading}
          className="w-full px-4 py-2 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition disabled:opacity-50"
        >
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  )
}
