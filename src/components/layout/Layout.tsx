
import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useTheme } from '@/context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
    if (!hasCompletedOnboarding) {
      // We delay the onboarding a bit to let the page load first
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  return (
    <div className={`min-h-screen bg-background flex flex-col transition-colors ${theme}`}>
      <Navbar />
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
