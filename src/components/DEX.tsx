import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowDown, 
  Settings2, 
  Info, 
  ChevronDown, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { TipsPayDEXLogo, TPCCoin, USDCCoin } from './Icons';

export default function DEX() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center min-h-[80vh]"
    >
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between px-2">
          <TipsPayDEXLogo className="h-10 w-auto text-foreground" />
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
              <Settings2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Card className="glass-panel border-none rounded-[32px] p-2">
          <CardContent className="space-y-2 p-4">
            {/* From Token */}
            <div className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/5 hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">From</span>
                <span className="text-sm text-muted-foreground">Balance: 12,500.50</span>
              </div>
              <div className="flex items-center gap-4">
                <Input 
                  type="number" 
                  placeholder="0.0" 
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="border-none bg-transparent text-3xl font-bold p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30"
                />
                <Button variant="secondary" className="rounded-2xl bg-white/10 hover:bg-white/20 border-none gap-2 h-12 px-4">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                    <TPCCoin />
                  </div>
                  <span className="font-bold">TIPS</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </div>
            </div>

            {/* Swap Icon */}
            <div className="relative h-2 flex items-center justify-center">
              <Button 
                size="icon" 
                className="absolute z-10 w-10 h-10 rounded-xl bg-background border-4 border-background hover:bg-primary transition-all group"
              >
                <ArrowDown className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              </Button>
            </div>

            {/* To Token */}
            <div className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/5 hover:border-secondary/30 transition-colors">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">To</span>
                <span className="text-sm text-muted-foreground">Balance: 0.00</span>
              </div>
              <div className="flex items-center gap-4">
                <Input 
                  type="number" 
                  placeholder="0.0" 
                  value={toAmount}
                  readOnly
                  className="border-none bg-transparent text-3xl font-bold p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30"
                />
                <Button variant="secondary" className="rounded-2xl bg-white/10 hover:bg-white/20 border-none gap-2 h-12 px-4">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                    <USDCCoin />
                  </div>
                  <span className="font-bold">USDC</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex justify-between text-sm px-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  Price Impact <Info className="w-3 h-3" />
                </div>
                <span className="text-secondary font-medium">&lt;0.01%</span>
              </div>
              
              <Button className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg neon-border-purple hover:opacity-90 transition-opacity gap-2">
                <Zap className="w-5 h-5 fill-current" />
                Swap Tokens
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="glass-panel rounded-2xl p-4 flex items-start gap-3 border-none">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-accent" />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            TipsDEX uses an automated market maker (AMM) to provide the best rates across the TipsChain ecosystem. Slippage tolerance is set to <span className="text-white font-medium">0.5%</span> by default.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
