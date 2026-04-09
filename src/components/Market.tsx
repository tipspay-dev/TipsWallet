import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter,
  Star,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  YAxis, 
  XAxis, 
  Tooltip 
} from 'recharts';

const marketData = [
  { name: 'TIPS', price: 0.45, change: 12.5, cap: '450M', volume: '12M', chart: [40, 42, 38, 45, 48, 44, 45] },
  { name: 'WTPC', price: 0.45, change: 5.4, cap: '25M', volume: '1.5M', chart: [42, 43, 41, 44, 46, 45, 45] },
  { name: 'USDC', price: 1.00, change: 0.01, cap: '35B', volume: '2.5B', chart: [100, 100, 100, 100, 100, 100, 100] },
  { name: 'ETH', price: 3200.00, change: -2.1, cap: '380B', volume: '15B', chart: [3300, 3250, 3280, 3200, 3180, 3220, 3200] },
  { name: 'BTC', price: 65000.00, change: 1.5, cap: '1.2T', volume: '35B', chart: [63000, 64000, 63500, 65000, 64500, 65500, 65000] },
];

import { TPCCoin, USDCCoin, WTPCCoin, TetherCoin } from './Icons';

const TokenIcon = ({ symbol }: { symbol: string }) => {
  switch (symbol) {
    case 'TIPS': return <TPCCoin className="w-full h-full" />;
    case 'USDC': return <USDCCoin className="w-full h-full" />;
    case 'WTPC': return <WTPCCoin className="w-full h-full" />;
    case 'ETH': return <div className="text-xl">💠</div>;
    case 'BNB': return <div className="text-xl">🟡</div>;
    case 'BTC': return <div className="text-xl">🟠</div>;
    case 'SOL': return <div className="text-xl">☀️</div>;
    default: return <div className="text-xl">💰</div>;
  }
};

export default function Market() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Market</h2>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search assets..." 
              className="pl-10 bg-white/5 border-white/10 rounded-xl focus-visible:ring-primary"
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-white/10 hover:bg-white/5">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Trending Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {marketData.slice(0, 3).map((item) => (
          <Card key={item.name} className="glass-panel border-none rounded-3xl overflow-hidden group hover:bg-white/10 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                    <TokenIcon symbol={item.name} />
                  </div>
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Vol: {item.volume}</p>
                  </div>
                </div>
                <Badge className={item.change >= 0 ? "bg-secondary/10 text-secondary" : "bg-red-400/10 text-red-400"}>
                  {item.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(item.change)}%
                </Badge>
              </div>
              
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={item.chart.map((val, i) => ({ val, i }))}>
                    <Line 
                      type="monotone" 
                      dataKey="val" 
                      stroke={item.change >= 0 ? "#22c55e" : "#f87171"} 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 flex justify-between items-end">
                <p className="text-2xl font-bold">${item.price.toLocaleString()}</p>
                <Star className="w-4 h-4 text-muted-foreground hover:text-accent transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Table */}
      <Card className="glass-panel border-none rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">All Assets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground text-sm">
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">24h Change</th>
                  <th className="px-6 py-4 font-medium">Market Cap</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {marketData.map((item) => (
                  <tr key={item.name} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                          <TokenIcon symbol={item.name} />
                        </div>
                        <span className="font-bold">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">${item.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={item.change >= 0 ? "text-secondary" : "text-red-400"}>
                        {item.change >= 0 ? '+' : ''}{item.change}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">${item.cap}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
