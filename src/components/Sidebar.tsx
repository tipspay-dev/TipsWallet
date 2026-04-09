import { motion } from 'motion/react';
import { 
  Wallet, 
  ArrowLeftRight, 
  TrendingUp, 
  LayoutDashboard, 
  Settings, 
  ShieldCheck,
  Globe,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTheme } from './ThemeProvider';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'dex', label: 'DEX', icon: ArrowLeftRight },
  { id: 'market', label: 'Market', icon: TrendingUp },
];

import { TipspayWalletLogo } from './Icons';
import { NETWORK_CONFIG } from '@/src/config';

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-20 md:w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col h-full z-40">
      <div className="p-6 flex items-center gap-3 text-white" style={{ fontSize: '12px', textAlign: 'justify', lineHeight: '22px' }}>
        <TipspayWalletLogo className="w-full h-auto" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 shrink-0 transition-transform duration-300 group-hover:scale-110",
                isActive && "neon-text-purple"
              )} />
              <span className="hidden md:block font-medium">{item.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
            </button>
          );
        })}

        <Separator className="my-6 bg-white/5" />

        <div className="space-y-2">
          <a 
            href={NETWORK_CONFIG.explorer} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all"
          >
            <Globe className="w-6 h-6 shrink-0" />
            <span className="hidden md:block font-medium">Explorer</span>
          </a>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <span className="hidden md:block font-medium">Security</span>
          </button>
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all"
          >
            {theme === 'dark' ? <Sun className="w-6 h-6 shrink-0" /> : <Moon className="w-6 h-6 shrink-0" />}
            <span className="hidden md:block font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </nav>

      <div className="p-4 space-y-4">
        <div className="hidden md:block glass-panel p-4 rounded-2xl">
          <p className="text-xs text-muted-foreground mb-2">Network Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-sm font-medium">Tipschain ({NETWORK_CONFIG.chainId})</span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => {
            localStorage.removeItem('tipspay_onboarded');
            window.location.reload();
          }}
          className="w-full justify-start gap-4 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
        >
          <LogOut className="w-6 h-6 shrink-0" />
          <span className="hidden md:block">Lock Wallet</span>
        </Button>
      </div>
    </aside>
  );
}
