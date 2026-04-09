import { useState, useEffect } from 'react';
import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowDown, 
  Settings2, 
  Info, 
  ChevronDown, 
  RefreshCw,
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTransactions } from '../context/TransactionContext';
import { NETWORK_CONFIG } from '../config';

import { TipspayDEXLogo, TPCCoin, USDTCoin, WTPCCoin, TetherCoin } from './Icons';

type Token = {
  symbol: string;
  name: string;
  address: string;
  icon: React.ReactNode;
};

const TOKENS: Token[] = [
  { symbol: 'TPC', name: 'Tipscoin', address: 'native', icon: <TPCCoin /> },
  { symbol: 'USDTC', name: 'USDTips', address: NETWORK_CONFIG.stableToken, icon: <USDTCoin /> },
  { symbol: 'WTPC', name: 'WrappedNative', address: NETWORK_CONFIG.wrappedNative, icon: <WTPCCoin /> },
  { symbol: 'TETHER', name: 'Tether USD', address: '0x...tether', icon: <TetherCoin /> },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x...dai', icon: <div className="text-xl">◈</div> },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x...wbtc', icon: <div className="text-xl">₿</div> },
  { symbol: 'ETH', name: 'Ethereum', address: '0x...eth', icon: <div className="text-xl">💠</div> },
];

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  selectedToken: Token;
  otherToken: Token;
}

function TokenSelectModal({ isOpen, onClose, onSelect, selectedToken, otherToken }: TokenSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = TOKENS.filter(token => 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-md glass-panel border-none rounded-[32px] overflow-hidden bg-background/90"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold">Select a Token</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name or symbol"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-2xl bg-white/5 border-white/10 focus-visible:ring-primary"
            />
          </div>

          <ScrollArea className="h-[400px] -mx-4 px-4">
            <div className="space-y-1">
              {filteredTokens.map((token) => {
                const isSelected = token.symbol === selectedToken.symbol;
                const isOther = token.symbol === otherToken.symbol;

                return (
                  <button
                    key={token.symbol}
                    disabled={isOther}
                    onClick={() => {
                      onSelect(token);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      isSelected ? 'bg-primary/20 border border-primary/30' : 
                      isOther ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                        {token.icon}
                      </div>
                      <div>
                        <p className="font-bold text-white">{token.symbol}</p>
                        <p className="text-xs text-muted-foreground">{token.name}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">Selected</Badge>
                    )}
                  </button>
                );
              })}
              {filteredTokens.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No tokens found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DEX() {
  const { addTransaction } = useTransactions();
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isSelectingFrom, setIsSelectingFrom] = useState(false);
  const [isSelectingTo, setIsSelectingTo] = useState(false);

  const exchangeRate = fromToken.symbol === 'TPC' ? 0.45 : (fromToken.symbol === 'USDTC' ? 2.22 : 1);

  useEffect(() => {
    if (fromAmount && !isNaN(parseFloat(fromAmount))) {
      const calculated = parseFloat(fromAmount) * exchangeRate;
      setToAmount(calculated.toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken, exchangeRate]);

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;

    setIsSwapping(true);
    setSwapStatus('loading');

    // Simulate blockchain interaction
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // In a real app, we would call the contract here using ethers/viem
      // const contract = new ethers.Contract(NETWORK_CONFIG.stableToken, ABI, provider);
      
      addTransaction({
        type: 'swap',
        token: `${fromToken.symbol}/${toToken.symbol}`,
        amount: fromAmount,
        status: 'completed',
        hash: `0x${Math.random().toString(16).substring(2, 42)}`,
      });

      setSwapStatus('success');
      setTimeout(() => {
        setSwapStatus('idle');
        setIsSwapping(false);
        setFromAmount('');
        setToAmount('');
      }, 3000);
    } catch (error) {
      setSwapStatus('error');
      setTimeout(() => setSwapStatus('idle'), 3000);
      setIsSwapping(false);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center min-h-[80vh]"
    >
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between px-2">
          <TipspayDEXLogo className="h-10 w-auto text-foreground" />
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
              <Settings2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Card className="glass-panel border-none rounded-[32px] p-2 relative overflow-hidden">
          <AnimatePresence>
            {swapStatus === 'success' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6"
              >
                <CheckCircle2 className="w-16 h-16 text-secondary mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold text-white mb-2">Swap Successful!</h3>
                <p className="text-muted-foreground">Your transaction has been confirmed on Tipschain.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <CardContent className="space-y-2 p-4">
            {/* From Token */}
            <div className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/5 hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">From</span>
                <span className="text-sm text-muted-foreground">Balance: 0.00</span>
              </div>
              <div className="flex items-center gap-4">
                <Input 
                  type="number" 
                  placeholder="0.0" 
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  disabled={isSwapping}
                  className="border-none bg-transparent text-3xl font-bold p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30"
                />
                <Button 
                  variant="secondary" 
                  onClick={() => setIsSelectingFrom(true)}
                  className="rounded-2xl bg-white/10 hover:bg-white/20 border-none gap-2 h-12 px-4"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                    {fromToken.icon}
                  </div>
                  <span className="font-bold">{fromToken.symbol}</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Contract: {fromToken.address}
              </div>
            </div>

            {/* Swap Icon */}
            <div className="relative h-2 flex items-center justify-center">
              <Button 
                size="icon" 
                onClick={switchTokens}
                disabled={isSwapping}
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
                <Button 
                  variant="secondary" 
                  onClick={() => setIsSelectingTo(true)}
                  className="rounded-2xl bg-white/10 hover:bg-white/20 border-none gap-2 h-12 px-4"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                    {toToken.icon}
                  </div>
                  <span className="font-bold">{toToken.symbol}</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Contract: {toToken.address}
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex justify-between text-sm px-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  Price Impact <Info className="w-3 h-3" />
                </div>
                <span className="text-secondary font-medium">&lt;0.01%</span>
              </div>
              
              <Button 
                onClick={handleSwap}
                disabled={isSwapping || !fromAmount}
                className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg neon-border-purple hover:opacity-90 transition-opacity gap-2"
              >
                {isSwapping ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    Swap Tokens
                  </>
                )}
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
            TipspayDEX uses an automated market maker (AMM) to provide the best rates across the Tipschain ecosystem. 
            Facilitated by <span className="text-white font-medium">USDTips</span> and <span className="text-white font-medium">WrappedNative</span> contracts.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isSelectingFrom && (
          <TokenSelectModal
            isOpen={isSelectingFrom}
            onClose={() => setIsSelectingFrom(false)}
            onSelect={setFromToken}
            selectedToken={fromToken}
            otherToken={toToken}
          />
        )}
        {isSelectingTo && (
          <TokenSelectModal
            isOpen={isSelectingTo}
            onClose={() => setIsSelectingTo(false)}
            onSelect={setToToken}
            selectedToken={toToken}
            otherToken={fromToken}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
