import { useState, useEffect } from 'react';
import { DashboardView } from './components/DashboardView';
import { MascotOverlay } from './components/MascotOverlay';

export default function App() {
  const [isMascotView, setIsMascotView] = useState(() => {
    return window.location.hash === '#/pet';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setIsMascotView(window.location.hash === '#/pet');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isMascotView) {
    return <MascotOverlay />;
  }

  return <DashboardView />;
}
