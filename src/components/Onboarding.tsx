import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Key, 
  Plus, 
  ArrowRight, 
  Copy, 
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TipspayWalletLogo } from './Icons';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'choice' | 'seed' | 'verify'>('choice');
  const [copied, setCopied] = useState(false);

  const seedPhrase = [
    "ocean", "mountain", "sunlight", "bridge", "crystal", "forest",
    "nebula", "velocity", "quantum", "horizon", "echo", "spirit"
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(seedPhrase.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />

      <AnimatePresence mode="wait">
        {step === 'choice' && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md space-y-8 text-center"
          >
            <div className="flex justify-center mb-8">
              <TipspayWalletLogo className="h-16 w-auto text-foreground" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Welcome to Tipspay</h1>
              <p className="text-muted-foreground">The most secure way to explore Tipschain</p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => setStep('seed')}
                className="glass-panel p-6 rounded-[32px] text-left hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Create New Wallet</h3>
                    <p className="text-sm text-muted-foreground">I'm new here, let's get started</p>
                  </div>
                  <ChevronRight className="ml-auto w-5 h-5 text-muted-foreground" />
                </div>
              </button>

              <button
                onClick={onComplete}
                className="glass-panel p-6 rounded-[32px] text-left hover:border-secondary/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Key className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Import Existing Wallet</h3>
                    <p className="text-sm text-muted-foreground">I already have a seed phrase</p>
                  </div>
                  <ChevronRight className="ml-auto w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {step === 'seed' && (
          <motion.div
            key="seed"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl space-y-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-white">Secret Recovery Phrase</h1>
              <p className="text-muted-foreground">This is the ONLY way to recover your wallet. Write it down and keep it safe.</p>
            </div>

            <div className="glass-panel p-8 rounded-[40px] border-primary/20">
              <div className="grid grid-cols-3 gap-4 mb-8">
                {seedPhrase.map((word, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                    <span className="font-mono text-white font-medium">{word}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleCopy}
                  className="flex-1 h-12 rounded-2xl border-white/10 gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
                <Button 
                  onClick={() => setStep('verify')}
                  className="flex-1 h-12 rounded-2xl bg-primary text-white font-bold neon-border-purple"
                >
                  I've written it down
                </Button>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-xs text-red-200 leading-relaxed">
                Never share your recovery phrase with anyone. Anyone with this phrase can steal your funds. 
                Tipspay support will NEVER ask for this phrase.
              </p>
            </div>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center space-y-8"
          >
            <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-8 neon-border-green">
              <Shield className="w-12 h-12 text-secondary" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Wallet Secured!</h1>
              <p className="text-muted-foreground">Your Tipspay wallet is ready to use. Welcome to the ecosystem.</p>
            </div>

            <Button 
              onClick={onComplete}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg"
            >
              Enter Wallet
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { ChevronRight } from 'lucide-react';
