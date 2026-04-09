/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import SplashScreen from './components/SplashScreen';
import WalletDashboard from './components/WalletDashboard';
import DEX from './components/DEX';
import Market from './components/Market';
import Sidebar from './components/Sidebar';
import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('wallet');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
        <AnimatePresence mode="wait">
          {loading ? (
            <SplashScreen onComplete={() => setLoading(false)} />
          ) : (
            <div key="main" className="flex h-screen overflow-hidden">
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
            </div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}

