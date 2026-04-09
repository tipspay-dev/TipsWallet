import { motion } from 'motion/react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  MoreHorizontal,
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Token } from '@/src/types';
import { NETWORK_CONFIG } from '@/src/config';

import { TPCCoin, USDCCoin, WTPCCoin, TetherCoin } from './Icons';

const mockTokens: Token[] = [
  { id: '1', symbol: 'TIPS', name: 'TipsChain', balance: 12500.50, price: 0.45, change24h: 12.5, icon: 'tips', color: 'primary' },
  { id: '2', symbol: 'WTPC', name: 'Wrapped TPC', balance: 45.2, price: 0.45, change24h: 5.4, icon: 'wtpc', color: 'purple-400' },
  { id: '3', symbol: 'USDC', name: 'USDC (Stable)', balance: 500.00, price: 1.00, change24h: 0.01, icon: 'usdc', color: 'green-500' },
  { id: '4', symbol: 'ETH', name: 'Ethereum', balance: 1.25, price: 3200.00, change24h: -2.1, icon: 'eth', color: 'blue-500' },
];

const TokenIcon = ({ symbol }: { symbol: string }) => {
  switch (symbol) {
    case 'TIPS': return <TPCCoin className="w-full h-full" />;
    case 'USDC': return <USDCCoin className="w-full h-full" />;
    case 'WTPC': return <WTPCCoin className="w-full h-full" />;
    case 'ETH': return <div className="text-2xl">💠</div>;
    default: return <div className="text-2xl">💰</div>;
  }
};

export default function WalletDashboard() {
  const totalBalance = mockTokens.reduce((acc, token) => acc + (token.balance * token.price), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-muted-foreground font-medium mb-1 uppercase tracking-widest text-xs">Total Balance</h2>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold tracking-tighter">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 neon-text-green">
              +5.2% Today
            </Badge>
          </div>
          <a 
            href={`${NETWORK_CONFIG.explorer}/address/0x71C...8A2f`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mt-4 text-muted-foreground bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <span className="text-xs font-mono">0x71C...8A2f</span>
            <Copy className="w-3 h-3" />
          </a>
        </div>

        <div className="flex gap-3">
          <Button className="rounded-2xl h-14 px-6 bg-primary hover:bg-primary/80 neon-border-purple gap-2">
            <Plus className="w-5 h-5" />
            Buy
          </Button>
          <Button variant="outline" className="rounded-2xl h-14 px-6 border-white/10 hover:bg-white/5 gap-2">
            <ArrowUpRight className="w-5 h-5" />
            Send
          </Button>
          <Button variant="outline" className="rounded-2xl h-14 px-6 border-white/10 hover:bg-white/5 gap-2">
            <ArrowDownLeft className="w-5 h-5" />
            Receive
          </Button>
          <Button variant="outline" className="rounded-2xl h-14 px-6 border-white/10 hover:bg-white/5 gap-2">
            <RefreshCw className="w-5 h-5" />
            Swap
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assets List */}
        <Card className="lg:col-span-2 glass-panel border-none rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Assets</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {mockTokens.map((token) => (
                <div key={token.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                      <TokenIcon symbol={token.symbol} />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{token.symbol}</p>
                      <p className="text-sm text-muted-foreground">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{token.balance.toLocaleString()} {token.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      ${(token.balance * token.price).toLocaleString()} 
                      <span className={token.change24h >= 0 ? "text-secondary ml-2" : "text-red-400 ml-2"}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Side Panels */}
        <div className="space-y-8">
          {/* Quick Swap / Bridge Card */}
          <Card className="glass-panel border-none rounded-3xl bg-gradient-to-br from-primary/20 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg">TipsBridge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">Move your assets to TipsChain L1 instantly with zero fees.</p>
              <Button className="w-full rounded-xl bg-white text-black hover:bg-white/90 font-bold">
                Bridge Now
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass-panel border-none rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Activity</CardTitle>
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <ArrowDownLeft className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Received TIPS</p>
                      <p className="text-xs text-muted-foreground">2 mins ago</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-secondary">+500.00</p>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-white gap-2">
                View History
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
