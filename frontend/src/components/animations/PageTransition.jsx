import { motion, useReducedMotion } from 'framer-motion';

export default function PageTransition({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: 'easeOut' };

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
