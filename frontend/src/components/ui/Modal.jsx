import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const shouldReduceMotion = useReducedMotion();
  const overlayTransition = { duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' };
  const panelTransition = { duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog as="div" className="relative z-50" onClose={onClose} open={isOpen}>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={shouldReduceMotion ? false : { opacity: 1 }}
            exit={shouldReduceMotion ? false : { opacity: 0 }}
            transition={overlayTransition}
          />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel
                as={motion.div}
                className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left align-middle shadow-xl transition-all`}
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
                animate={shouldReduceMotion ? false : { opacity: 1, scale: 1, y: 0 }}
                exit={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
                transition={panelTransition}
              >
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    {title && (
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100"
                      >
                        {title}
                      </Dialog.Title>
                    )}
                    {showCloseButton && (
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                )}
                <div className="px-6 py-4">{children}</div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
