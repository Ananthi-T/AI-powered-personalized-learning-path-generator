'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card">
      {mode === 'signup' && (
        <div>
          <label className="block text-sm text-gray-300">Full Name</label>
          <input className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
        </div>
      )}
      <div className="mt-4">
        <label className="block text-sm text-gray-300">Email</label>
        <input className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="mt-4">
        <label className="block text-sm text-gray-300">Password</label>
        <input type="password" className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
    </motion.div>
  )
}

