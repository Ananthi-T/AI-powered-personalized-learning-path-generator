'use client'

import { motion } from 'framer-motion'

export default function About() {
  return (
    <div className="container py-12 md:py-16 grid grid-cols-2 gap-6 items-start">
      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <h2 className="text-3xl font-bold">About PathWise</h2>
        <p className="mt-3 text-sm text-gray-300">PathWise is an AI-powered platform that creates personalized learning paths to help you grow your career.</p>
        <ul className="mt-4 space-y-2 text-sm text-gray-400">
          <li>Personalized learning</li>
          <li>Career-oriented skill building</li>
          <li>AI-driven recommendations</li>
        </ul>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative h-56 rounded-2xl border border-white/10 bg-white/5 shadow-glow overflow-hidden"
        >
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewBox="0 0 400 300"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 0 8px rgba(79,140,255,0.35))' }}
          >
            <defs>
              <radialGradient id="bgGlow" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#4F8CFF33" />
                <stop offset="100%" stopColor="#00000000" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="400" height="300" fill="url(#bgGlow)" />
            <motion.path
              d="M40 220 C120 160 180 140 240 160 S340 210 360 180"
              stroke="#4F8CFF"
              strokeOpacity="0.7"
              strokeWidth="2"
              fill="none"
              strokeDasharray="6 8"
              animate={{ strokeDashoffset: [0, 80] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
            <motion.path
              d="M60 120 C140 90 190 110 260 100 S330 120 360 90"
              stroke="#8B5CF6"
              strokeOpacity="0.6"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5 7"
              animate={{ strokeDashoffset: [0, 70] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            />
            {[
              { x: 60, y: 220 },
              { x: 120, y: 180 },
              { x: 180, y: 155 },
              { x: 240, y: 165 },
              { x: 300, y: 190 },
              { x: 360, y: 175 }
            ].map((n, i) => (
              <motion.circle
                key={i}
                cx={n.x}
                cy={n.y}
                r={6}
                fill="#4F8CFF"
                style={{ filter: 'drop-shadow(0 0 6px rgba(79,140,255,0.6))' }}
                animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
                transition={{ duration: 2.2 + i * 0.2, repeat: Infinity }}
              />
            ))}
            {[
              { x: 80, y: 120 },
              { x: 160, y: 100 },
              { x: 230, y: 105 },
              { x: 300, y: 110 }
            ].map((n, i) => (
              <motion.circle
                key={`a-${i}`}
                cx={n.x}
                cy={n.y}
                r={5}
                fill="#8B5CF6"
                style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.6))' }}
                animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.06, 1] }}
                transition={{ duration: 2.8 + i * 0.25, repeat: Infinity }}
              />
            ))}
          </motion.svg>
        </motion.div>
      </motion.div>
      <div className="md:col-span-2 mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="card">
          <div className="h-10 w-10 rounded-md bg-gradient-to-r from-primary to-accent grid place-items-center text-white font-bold">UI</div>
          <p className="mt-3 text-gray-300">User interacting with AI dashboard</p>
          <motion.svg viewBox="0 0 200 80" className="mt-4 w-full h-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <rect x="10" y="15" width="180" height="50" rx="8" fill="#111623" stroke="#4F8CFF66" />
            <motion.rect x="20" y="25" width="60" height="8" rx="4" fill="#4F8CFF" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.rect x="20" y="40" width="120" height="8" rx="4" fill="#8B5CF6" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.4, repeat: Infinity }} />
          </motion.svg>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="card">
          <div className="h-10 w-10 rounded-md bg-gradient-to-r from-primary to-accent grid place-items-center text-white font-bold">RG</div>
          <p className="mt-3 text-gray-300">Career growth path with milestones</p>
          <motion.svg viewBox="0 0 200 80" className="mt-4 w-full h-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.path d="M10 60 L60 45 L110 35 L160 25" stroke="#4F8CFF" strokeWidth="2" fill="none" strokeDasharray="5 7" animate={{ strokeDashoffset: [0, 60] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
            {[60, 110, 160].map((x, i) => (
              <motion.circle key={i} cx={x} cy={25 + i * 10} r={5} fill="#8B5CF6" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.2 + i * 0.3, repeat: Infinity }} />
            ))}
          </motion.svg>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="card">
          <div className="h-10 w-10 rounded-md bg-gradient-to-r from-primary to-accent grid place-items-center text-white font-bold">DF</div>
          <p className="mt-3 text-gray-300">Data flow and knowledge graph</p>
          <motion.svg viewBox="0 0 200 80" className="mt-4 w-full h-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.path d="M20 40 C60 20 100 60 140 40" stroke="#8B5CF6" strokeWidth="2" fill="none" strokeDasharray="6 8" animate={{ strokeDashoffset: [0, 50] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }} />
            {[20, 60, 100, 140].map((x, i) => (
              <motion.circle key={i} cx={x} cy={i % 2 === 0 ? 40 : 30} r={4.5} fill="#4F8CFF" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2 + i * 0.2, repeat: Infinity }} />
            ))}
          </motion.svg>
        </motion.div>
      </div>
    </div>
  )
}
