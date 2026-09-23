import { motion } from 'framer-motion'
export default function FeatureCard({ title, icon }: { title: string; icon?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="card">
      <div className="h-10 w-10 rounded-md bg-gradient-to-r from-primary to-accent grid place-items-center text-white font-bold">{icon || '•'}</div>
      <p className="mt-3 text-gray-200">{title}</p>
    </motion.div>
  )
}

