import { motion, AnimatePresence } from 'motion/react';
import { Wallet } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

import { TipsPayWalletLogo } from './Icons';

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden"
    >
      {/* Animated Background Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -60, 0],
          y: [0, 60, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]"
      />

      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }}
          className="w-48 h-auto mb-8"
        >
          <TipsPayWalletLogo className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl font-bold tracking-tighter text-white mb-2"
        >
          TIPS<span className="text-primary neon-text-purple">PAY</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground font-mono text-sm tracking-widest uppercase"
        >
          Secure • Fast • Decentralized
        </motion.p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
          onAnimationComplete={() => setTimeout(onComplete, 500)}
          className="h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full mt-12 overflow-hidden"
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-full h-full bg-white/30"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
