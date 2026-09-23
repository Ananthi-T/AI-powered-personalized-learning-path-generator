'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <div className="container min-h-[calc(100vh-5rem)] grid place-items-center text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-glow">PathWise</h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300">AI-Powered Personalized Learning Paths for Your Career Growth</p>
        <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base text-gray-400">PathWise uses artificial intelligence to analyze your goals and skills, then creates a personalized learning roadmap just for you.</p>
        <Link href="/signup" className="mt-8 btn-primary">
          Get Started
        </Link>
      </motion.div>
    </div>
  )
}
