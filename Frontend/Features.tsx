'use client'

import { motion } from 'framer-motion'

const features = [
  'AI-Generated Personalized Learning Paths',
  'Skill Gap Analysis',
  'Career-Focused Roadmaps',
  'Smart Course & Resource Recommendations',
  'Progress Tracking',
  'Adaptive Learning Based on User Performance'
]

export default function Features() {
  return (
    <div className="container py-12 md:py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center">Features</h2>
      <div className="mt-10 flex overflow-x-auto gap-5 pb-4">
        {features.map((f, idx) => (
          <motion.div
            key={f}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.03 }}
            className="card min-w-[220px] shrink-0"
          >
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-primary to-accent grid place-items-center text-white font-bold text-sm">
              {String.fromCharCode(65 + idx)}
            </div>
            <p className="mt-3 text-sm text-gray-200">{f}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
