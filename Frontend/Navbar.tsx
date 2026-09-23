'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#about' },
  { label: 'Features', href: '/#features' },
  { label: 'Solution', href: '/#solution' },
  { label: 'Contact', href: '/#contact' }
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 ${scrolled ? 'bg-background/70 border-b border-white/10 shadow-glow' : 'bg-transparent'} blur-glass`}
    >
      <div className="container grid grid-cols-3 items-center h-16">
        <nav className="flex items-center gap-8">
          {navItems.map(i => (
            <Link key={i.href} href={i.href} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            PathWise
          </motion.span>
        </div>
        <div className="flex items-center justify-end">
          <Link href="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

