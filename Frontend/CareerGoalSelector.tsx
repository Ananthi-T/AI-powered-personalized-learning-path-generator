'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const GOALS = [
  'Full-Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'AI Engineer'
]

export default function CareerGoalSelector({ onUpdated }: { onUpdated?: () => void }) {
  const router = useRouter()
  const [careerGoal, setCareerGoal] = useState<string>('')
  const [knownSkills, setKnownSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/user/profile', { credentials: 'include' })
        if (res.status === 401) {
          router.replace('/login')
          return
        }
        let data
        try {
          data = await res.json()
        } catch {
          data = {}
        }
        setCareerGoal(String(data?.profile?.careerGoal || 'Full-Stack Developer'))
        setKnownSkills(Array.isArray(data?.profile?.knownSkills) ? data.profile.knownSkills : [])
      } catch {}
    })()
  }, [router])

  async function updateGoal(goal: string) {
    setCareerGoal(goal)
    setLoading(true)
    try {
      const profileRes = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ careerGoal: goal })
      })
      if (profileRes.status === 401) {
        window.location.href = '/login'
        return
      }
      try {
        await profileRes.json()
      } catch {}
      const snapRes = await fetch('/api/career-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetRole: goal, knownSkills })
      })
      if (snapRes.status === 401) {
        window.location.href = '/login'
        return
      }
      try {
        await snapRes.json()
      } catch {}
      if (onUpdated) onUpdated()
      else router.push('/app/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select
        className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white text-sm"
        value={careerGoal}
        onChange={e => updateGoal(e.target.value)}
        disabled={loading}
      >
        {GOALS.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <button
        onClick={() => updateGoal(careerGoal)}
        disabled={loading}
        className="px-3 py-2 rounded-md bg-primary text-white text-sm"
      >
        {loading ? 'Updating...' : 'Recalculate'}
      </button>
    </div>
  )
}
