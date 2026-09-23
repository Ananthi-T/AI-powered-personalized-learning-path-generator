import { motion, type HTMLMotionProps } from 'framer-motion'
type Props = HTMLMotionProps<'button'>
export default function Button({ children, className = '', ...props }: Props) {
  return (
    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className={`btn-primary ${className}`} {...props}>
      {children}
    </motion.button>
  )
}

