import { AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import PageTransition from './PageTransition';

export default function AnimatedOutlet() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={location.pathname} className="h-full">
        <Outlet />
      </PageTransition>
    </AnimatePresence>
  );
}
