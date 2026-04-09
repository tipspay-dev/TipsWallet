/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import SplashScreen from './components/SplashScreen';
import WalletDashboard from './components/WalletDashboard';
import DEX from './components/DEX';
import Market from './components/Market';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import { ThemeProvider } from './components/ThemeProvider';
import { TransactionProvider } from './context/TransactionContext';

type AppView = 'landing' | 'onboarding' | 'loading' | 'main';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [activeTab, setActiveTab] = useState('wallet');

  // Check if already onboarded (simulated)
  useEffect(() => {
    const onboarded = localStorage.getItem('tipspay_onboarded');
    if (onboarded) {
      setView('loading');
    }
  }, []);

  const handleEnter = () => {
    setView('onboarding');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('tipspay_onboarded', 'true');
    setView('loading');
  };

  const handleSplashComplete = () => {
    setView('main');
  };

  return (
    <ThemeProvider>
      <TransactionProvider>
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <LandingPage onEnter={handleEnter} />
            </motion.div>
          )}

          {view === 'onboarding' && (
            <motion.div 
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <Onboarding onComplete={handleOnboardingComplete} />
            </motion.div>
          )}

          {view === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <SplashScreen onComplete={handleSplashComplete} />
            </motion.div>
          )}

          {view === 'main' && (
            <motion.div 
              key="main" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-screen overflow-hidden w-full"
            >
              <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
              
              <main className="flex-1 overflow-y-auto relative">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                  <AnimatePresence mode="wait">
                    {activeTab === 'wallet' && <WalletDashboard key="wallet" />}
                    {activeTab === 'dex' && <DEX key="dex" />}
                    {activeTab === 'market' && <Market key="market" />}
                  </AnimatePresence>
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </TransactionProvider>
    </ThemeProvider>
  );
}

