'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { STATES } from '../data/locations'

type Profile = {
  currentRole?: string
  ageRange?: string
  careerGoal?: string
  targetTimeline?: string
  skillLevel?: string
  knownSkills?: string[]
  weeklyLearningTime?: string
  learningStyle?: string
  // Extra fields kept for compatibility or future use
  state?: string
  city?: string
  skillConfidence?: string
  motivation?: string
}

const STEPS = [
  { title: 'Welcome', subtitle: 'Introduction' },
  { title: 'Personal Info', subtitle: 'Basic Details' },
  { title: 'Education', subtitle: 'Academic Details' },
  { title: 'Who Are You?', subtitle: 'Current Role' },
  { title: 'Where Do You Want to Go?', subtitle: 'Career Goal' },
  { title: 'Where Are You Now?', subtitle: 'Skill Level' },
  { title: 'How Can You Learn Best?', subtitle: 'Learning Preferences' }
]

const ROLES = ['Student', 'Working Professional', 'Job Seeker', 'Career Switcher']
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const LEARNING_TIMES = ['3-5 hrs/week', '6-10 hrs/week', '10+ hrs/week']
const LEARNING_STYLES = ['Video', 'Reading', 'Projects', 'Mixed']
const SUGGESTED_GOALS = [
  'Full-Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Web Developer',
  'Mobile Developer',
  'Android Developer',
  'iOS Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'AI Engineer',
  'Cloud Engineer',
  'DevOps Engineer',
  'Site Reliability Engineer',
  'Cybersecurity Analyst',
  'Blockchain Developer',
  'AR/VR Developer',
  'Game Developer',
  'UI/UX Designer',
  'Product Manager',
  'QA Engineer',
  'Test Automation Engineer',
  'Business Analyst',
  'Data Analyst',
  'Data Engineer',
  'Solutions Architect',
  'Systems Administrator',
  'Network Engineer',
  'Embedded Systems Engineer',
  'IoT Developer',
  'Salesforce Developer',
  'SAP Consultant',
  'Tableau Developer',
  'Power BI Analyst'
]
const COMMON_SKILLS = ['HTML', 'CSS', 'JavaScript', 'Python', 'SQL', 'React', 'Node.js', 'Java', 'C++', 'Go']
const SKILL_SUGGESTIONS = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript',
  'React', 'Python', 'SQL',
  'Git', 'Docker', 'AWS', 'Tailwind CSS'
]

export default function ProfileSetupForm({
  endpoint = '/api/user/profile',
  method = 'POST',
  afterSaveRedirect = '/app/ai-snapshot',
  mode = 'setup'
}: {
  endpoint?: string
  method?: 'POST' | 'PUT'
  afterSaveRedirect?: string
  mode?: 'setup' | 'edit'
}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile>({ knownSkills: [] })
  const [newSkill, setNewSkill] = useState('')
  const [showMoreSkills, setShowMoreSkills] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/user/profile', {
          credentials: 'include'
        })
        if (res.status === 401) { router.replace('/login'); return }
        const data = await res.json().catch(() => ({}))
        if (data.profile) {
          setProfile(p => ({ ...p, ...data.profile }))
        }
      } catch {}
    })()
  }, [router])

  function next() { 
    if (step === 3 && !profile.currentRole) { setError('Current Role is required'); return }
    if (step === 4 && !profile.careerGoal) { setError('Career Goal is required'); return }
    if (step === 5 && !profile.skillLevel) { setError('Skill Level is required'); return }
    if (step === 6 && !profile.weeklyLearningTime) { setError('Weekly Learning Time is required'); return }
    
    setError(null)
    setStep(s => Math.min(s + 1, STEPS.length - 1)) 
  }
  
  function prev() { 
    setError(null)
    setStep(s => Math.max(s - 1, 0)) 
  }

  function addSkill(skill: string) {
    if (skill && !profile.knownSkills?.includes(skill)) {
      setProfile({ ...profile, knownSkills: [...(profile.knownSkills || []), skill] })
    }
    setNewSkill('')
  }

  function removeSkill(skill: string) {
    setProfile({ ...profile, knownSkills: profile.knownSkills?.filter(s => s !== skill) })
  }

  const [success, setSuccess] = useState<string | null>(null)

  async function save() {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profile)
      })
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok || (data && data.success === false)) throw new Error((data && data.error) || 'Failed to save')

      // Generate Snapshot immediately after save
      const snapRes = await fetch('/api/career-snapshot', {
        method: 'POST',
        credentials: 'include'
      })
      if (snapRes.status === 401) {
        router.replace('/login')
        return
      }
      if (!snapRes.ok) {
        console.error('Failed to generate snapshot immediately')
      }

      if (mode === 'setup') {
        router.push(afterSaveRedirect)
      } else {
        setSuccess('Profile updated successfully')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function skip() { 
    setLoading(true)
    try {
       const res = await fetch('/api/user/profile', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         credentials: 'include',
         body: JSON.stringify({ ...profile, skipped: true })
       })
       if (res.status === 401) {
         router.replace('/login')
         return
       }
       router.push('/app/dashboard') 
    } catch {
       router.push('/app/dashboard')
    }
  }

  const OptionButton = ({ selected, onClick, children }: { selected: boolean, onClick: () => void, children: React.ReactNode }) => (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-colors duration-200
        ${selected 
          ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
          : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
        }
      `}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        selected ? 'border-blue-500' : 'border-gray-500'
      }`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
      </div>
      <div className={`flex-1 font-medium ${selected ? 'text-white' : 'text-gray-300'}`}>
        {children}
      </div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="card max-w-md w-full mx-auto">
      <div className="">
        {step > 0 && (
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-semibold">{STEPS[step].title}</h1>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">Step {step} of {STEPS.length - 1}</span>
                <button onClick={skip} className="text-xs text-gray-400 hover:text-white transition-colors">
                  Skip
                </button>
              </div>
            </div>
            <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-accent" 
                initial={{ width: 0 }}
                animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <div className="p-6 min-h-[300px] flex flex-col justify-center">
          {mode === 'edit' ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={(profile as any).dob || ''}
                    onChange={e => setProfile({ ...profile, dob: e.target.value } as any)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gender</label>
                  <select
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={(profile as any).gender || ''}
                    onChange={e => setProfile({ ...profile, gender: e.target.value } as any)}
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">State</label>
                  <select 
                    value={profile.state || ''}
                    onChange={e => setProfile({ ...profile, state: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select a state</option>
                    {STATES.map(state => (
                      <option key={state} value={state} className="bg-gray-800 text-white">{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">City</label>
                  <input 
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                    value={profile.city || ''} 
                    onChange={e => setProfile({ ...profile, city: e.target.value })}
                    placeholder="e.g. Chennai"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={(profile as any).phone || ''}
                    onChange={e => setProfile({ ...profile, phone: e.target.value } as any)}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Education Level</label>
                  <select
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={(profile as any).educationLevel || ''}
                    onChange={e => setProfile({ ...profile, educationLevel: e.target.value } as any)}
                  >
                    <option value="">Select level</option>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's">Bachelor's</option>
                    <option value="Master's">Master's</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">School/College Name</label>
                  <input 
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                    value={(profile as any).institutionName || ''} 
                    onChange={e => setProfile({ ...profile, institutionName: e.target.value } as any)}
                    placeholder="e.g. Anna University"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Branch</label>
                  <select
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={(profile as any).branch || ''}
                    onChange={e => setProfile({ ...profile, branch: e.target.value } as any)}
                  >
                    <option value="">Select branch</option>
                    <option value="B.Com">B.Com</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="Arts">Arts</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Science">Science</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Role</label>
                <div className="space-y-3">
                  {ROLES.map(role => (
                    <OptionButton
                      key={role}
                      selected={profile.currentRole === role}
                      onClick={() => setProfile({ ...profile, currentRole: role })}
                    >
                      {role}
                    </OptionButton>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Primary Career Goal</label>
                  <select
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={profile.careerGoal || ''}
                    onChange={e => setProfile({ ...profile, careerGoal: e.target.value })}
                  >
                    <option value="" disabled>Select career goal</option>
                    {SUGGESTED_GOALS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Known Skills (Optional)</label>
                  <div className="rounded-md border border-white/10 bg-white/5 p-3 space-y-3">
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {(showMoreSkills ? SKILL_SUGGESTIONS : SKILL_SUGGESTIONS.slice(0, 6)).map(skill => {
                        const selected = !!profile.knownSkills?.includes(skill)
                        return (
                          <button
                            key={skill}
                            onClick={() => selected ? removeSkill(skill) : addSkill(skill)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              selected 
                                ? 'bg-blue-600/20 border-blue-500 text-white' 
                                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                            }`}
                          >
                            {skill}
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none"
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        placeholder="Type a skill (e.g. Angular)"
                      />
                      <button
                        type="button"
                        onClick={() => addSkill(newSkill.trim())}
                        disabled={!newSkill.trim()}
                        className="px-3.5 py-2.5 rounded-md bg-primary text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMoreSkills(v => !v)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        {showMoreSkills ? 'Show less' : 'Show more'}
                      </button>
                    </div>
                  </div>
                  {!!profile.knownSkills?.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.knownSkills!.map(skill => (
                        <div key={skill} className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-700/50 border border-gray-600 text-gray-200 flex items-center gap-2">
                          <span>{skill}</span>
                          <button onClick={() => removeSkill(skill)} aria-label="Remove skill" className="text-gray-300 hover:text-white">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Skill Level</label>
                <div className="space-y-3">
                  {SKILL_LEVELS.map(level => (
                    <OptionButton
                      key={level}
                      selected={profile.skillLevel === level}
                      onClick={() => setProfile({ ...profile, skillLevel: level })}
                    >
                      <div className="flex flex-col items-start">
                        <span>{level}</span>
                        <span className="text-xs font-normal text-gray-500 mt-0.5">
                          {level === 'Beginner' ? 'New to coding' : level === 'Intermediate' ? 'Built projects' : 'Professional'}
                        </span>
                      </div>
                    </OptionButton>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Weekly Learning Time</label>
                <div className="space-y-3">
                  {LEARNING_TIMES.map(time => (
                    <OptionButton
                      key={time}
                      selected={profile.weeklyLearningTime === time}
                      onClick={() => setProfile({ ...profile, weeklyLearningTime: time })}
                    >
                      {time}
                    </OptionButton>
                  ))}
                </div>
              </div>
            </div>
          ) : (
          <AnimatePresence mode="wait">
            {step === 0 && mode === 'setup' && (
              <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="text-center py-2">
                <h1 className="text-2xl font-bold mb-2">Profile Setup</h1>
                <p className="text-gray-400 max-w-sm mx-auto mb-6 text-sm">
                  Answer a few quick questions to personalize your AI learning path.
                </p>
                 <div className="space-y-3">
                   <button onClick={next} className="w-full btn-primary justify-center">
                     Start Setup
                   </button>
                   <button onClick={skip} className="w-full px-4 py-2.5 rounded-md border border-white/10 hover:bg-white/5 text-sm">
                     Skip for now
                   </button>
                 </div>
               </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1pi" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Date of Birth</label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={(profile as any).dob || ''}
                      onChange={e => setProfile({ ...profile, dob: e.target.value } as any)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gender</label>
                    <select
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={(profile as any).gender || ''}
                      onChange={e => setProfile({ ...profile, gender: e.target.value } as any)}
                    >
                      <option value="">Select gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">State</label>
                    <select 
                      value={profile.state || ''}
                      onChange={e => setProfile({ ...profile, state: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select a state</option>
                      {STATES.map(state => (
                        <option key={state} value={state} className="bg-gray-800 text-white">{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">City</label>
                    <input 
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                      value={profile.city || ''} 
                      onChange={e => setProfile({ ...profile, city: e.target.value })}
                      placeholder="e.g. Chennai"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={(profile as any).phone || ''}
                      onChange={e => setProfile({ ...profile, phone: e.target.value } as any)}
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2edu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Education Level</label>
                    <select
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={(profile as any).educationLevel || ''}
                      onChange={e => setProfile({ ...profile, educationLevel: e.target.value } as any)}
                    >
                      <option value="">Select level</option>
                      <option value="High School">High School</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Bachelor's">Bachelor's</option>
                      <option value="Master's">Master's</option>
                      <option value="PhD">PhD</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">School/College Name</label>
                    <input 
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                      value={(profile as any).institutionName || ''} 
                      onChange={e => setProfile({ ...profile, institutionName: e.target.value } as any)}
                      placeholder="e.g. Anna University"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Branch</label>
                    <select
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={(profile as any).branch || ''}
                      onChange={e => setProfile({ ...profile, branch: e.target.value } as any)}
                    >
                      <option value="">Select branch</option>
                      <option value="B.Com">B.Com</option>
                      <option value="B.Tech">B.Tech</option>
                      <option value="B.Sc">B.Sc</option>
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                      <option value="Arts">Arts</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Science">Science</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-4">
                <div className="space-y-3">
                  {ROLES.map(role => (
                    <OptionButton
                      key={role}
                      selected={profile.currentRole === role}
                      onClick={() => setProfile({ ...profile, currentRole: role })}
                    >
                      {role}
                    </OptionButton>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4goal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Primary Career Goal <span className="text-red-500">*</span></label>
                  <select
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={profile.careerGoal || ''}
                    onChange={e => setProfile({ ...profile, careerGoal: e.target.value })}
                  >
                    <option value="" disabled>Select career goal</option>
                    {SUGGESTED_GOALS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Known Skills (Optional)</label>
                  <div className="rounded-md border border-white/10 bg-white/5 p-3 space-y-3">
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {(showMoreSkills ? SKILL_SUGGESTIONS : SKILL_SUGGESTIONS.slice(0, 6)).map(skill => {
                        const selected = !!profile.knownSkills?.includes(skill)
                        return (
                          <button
                            key={skill}
                            onClick={() => selected ? removeSkill(skill) : addSkill(skill)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              selected 
                                ? 'bg-blue-600/20 border-blue-500 text-white' 
                                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                            }`}
                          >
                            {skill}
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none"
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        placeholder="Type a skill (e.g. Angular)"
                      />
                      <button
                        type="button"
                        onClick={() => addSkill(newSkill.trim())}
                        disabled={!newSkill.trim()}
                        className="px-3.5 py-2.5 rounded-md bg-primary text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMoreSkills(v => !v)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        {showMoreSkills ? 'Show less' : 'Show more'}
                      </button>
                    </div>
                  </div>
                  {!!profile.knownSkills?.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.knownSkills!.map(skill => (
                        <div key={skill} className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-700/50 border border-gray-600 text-gray-200 flex items-center gap-2">
                          <span>{skill}</span>
                          <button onClick={() => removeSkill(skill)} aria-label="Remove skill" className="text-gray-300 hover:text-white">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5level" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-4">
                <div className="space-y-3">
                  {SKILL_LEVELS.map(level => (
                    <OptionButton
                      key={level}
                      selected={profile.skillLevel === level}
                      onClick={() => setProfile({ ...profile, skillLevel: level })}
                    >
                      <div className="flex flex-col items-start">
                         <span>{level}</span>
                         <span className="text-xs font-normal text-gray-500 mt-0.5">
                           {level === 'Beginner' ? 'New to coding' : level === 'Intermediate' ? 'Built projects' : 'Professional'}
                         </span>
                      </div>
                    </OptionButton>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6learn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Weekly Learning Time</label>
                  <div className="space-y-3">
                    {LEARNING_TIMES.map(time => (
                      <OptionButton
                        key={time}
                        selected={profile.weeklyLearningTime === time}
                        onClick={() => setProfile({ ...profile, weeklyLearningTime: time })}
                      >
                         {time}
                      </OptionButton>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            

            
          </AnimatePresence>
          )}
        </div>

        {((mode === 'setup' && step > 0) || mode === 'edit') && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            {mode === 'setup' ? (
              <button 
                onClick={prev} 
                className="px-4 py-2 rounded-md border border-white/10 hover:bg-white/5 text-sm"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            
            {mode === 'setup' && step < STEPS.length - 1 ? (
              <button 
                onClick={next} 
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button 
                onClick={save}
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (mode === 'setup' ? 'Finish' : 'Save Changes')}
              </button>
            )}
          </div>
        )}
      </div>
      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center text-xs font-medium">
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-center text-xs font-medium">
          {success}
        </motion.div>
      )}
    </motion.div>
  )
}
