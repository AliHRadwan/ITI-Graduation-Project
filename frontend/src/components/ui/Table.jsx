import { motion, useReducedMotion } from 'framer-motion';

export default function Table({ children, className = '' }) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>;
}

export function TableRow({ children, className = '', onClick }) {
  const shouldReduceMotion = useReducedMotion();
  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2, ease: 'easeOut' },
      };

  return (
    <motion.tr
      className={`${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''} ${className}`}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.tr>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </td>
  );
}
