'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle')

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitted')
  }

  return (
    <div className="container py-12 md:py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center">Contact Us</h2>
      <p className="mt-2 text-center text-sm text-gray-400">Have questions or feedback? We’d love to hear from you.</p>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        onSubmit={onSubmit}
        className="mt-6 max-w-sm mx-auto space-y-3"
      >
        <div>
          <label htmlFor="name" className="block text-sm text-gray-300">Name</label>
          <input id="name" name="name" required className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-primary shadow-glow text-sm" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-gray-300">Email</label>
          <input id="email" name="email" type="email" required className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-primary shadow-glow text-sm" />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm text-gray-300">Message</label>
          <textarea id="message" name="message" rows={4} required className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-primary shadow-glow text-sm" />
        </div>
        <button type="submit" className="w-full btn-primary justify-center text-sm">Submit</button>
        {status === 'submitted' && (
          <p className="text-center text-green-400 text-sm">Thanks for reaching out.</p>
        )}
      </motion.form>
    </div>
  )
}
