'use client'

import { motion } from 'framer-motion'

export default function Solution() {
  return (
    <div className="container py-12 md:py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center">Our Solution</h2>
      <div className="mt-8 grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="card p-5">
          <h3 className="text-xl font-semibold">Before</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-300">
            <li>Confusion in choosing the right skills</li>
            <li>Lack of structured learning paths</li>
            <li>One-size-fits-all learning platforms</li>
          </ul>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="card p-5">
          <h3 className="text-xl font-semibold">After</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-300">
            <li>Goal → roadmap → success</li>
            <li>Personalized, adaptive learning paths</li>
            <li>Data-driven guidance and progress tracking</li>
          </ul>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-8 rounded-xl border border-white/10 p-5 bg-gradient-to-br from-primary/25 to-accent/15">
        <p className="text-center text-sm text-gray-200">AI helps users go from defining a goal to a tailored roadmap and measurable outcomes.</p>
      </motion.div>
    </div>
  )
}
