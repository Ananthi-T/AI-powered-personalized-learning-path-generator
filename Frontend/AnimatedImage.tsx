import { motion } from 'framer-motion'
export default function AnimatedImage() {
  return (
    <motion.div initial={{ y: 0 }} animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative h-64 rounded-2xl border border-white/10 bg-white/5 shadow-glow overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="theme-gradient w-full h-full" />
    </motion.div>
  )
}

