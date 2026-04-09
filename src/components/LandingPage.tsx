import { motion } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight, 
  Download, 
  ChevronRight,
  Cpu,
  Lock,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TipsChainLogo, TipsPayWalletLogo } from './Icons';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">TipsChain Mainnet is Live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8"
          >
            The Future of <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Decentralized Finance
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Securely manage, swap, and grow your assets on the world's fastest blockchain ecosystem. 
            Experience the power of the Tipschain Ecosystem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              onClick={onEnter}
              size="lg" 
              className="h-14 px-8 rounded-2xl bg-primary text-white font-bold text-lg neon-border-purple hover:opacity-90 transition-all group"
            >
              Launch Wallet
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 transition-all gap-2"
            >
              <Download className="w-5 h-5" />
              Download Extension
            </Button>
          </motion.div>
        </div>
      </section>

      {/* TipsChain Section */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                <TipsChainLogo className="h-12 w-auto text-foreground" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Powered by <span className="text-secondary neon-text-green">TipsChain</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                TipsChain is a high-performance Layer 1 blockchain designed for mass adoption. 
                With sub-second finality and near-zero fees, it's the perfect foundation for the next generation of Web3 apps.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <h3 className="text-2xl font-bold text-white mb-1">100k+</h3>
                  <p className="text-sm text-muted-foreground">TPS Capacity</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <h3 className="text-2xl font-bold text-white mb-1">&lt;$0.001</h3>
                  <p className="text-sm text-muted-foreground">Avg. Gas Fee</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-secondary/20 blur-[100px] rounded-full" />
              <div className="glass-panel p-8 rounded-[40px] relative border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Zap, title: "Instant", desc: "Sub-second block times" },
                    { icon: Globe, title: "Global", desc: "Borderless transactions" },
                    { icon: Shield, title: "Secure", desc: "PoS Consensus" },
                    { icon: Layers, title: "Scalable", desc: "Sharding ready" }
                  ].map((feature, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-secondary/30 transition-all">
                      <feature.icon className="w-8 h-8 text-secondary mb-4" />
                      <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TipsPay Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 flex justify-center"
            >
              <TipsPayWalletLogo className="h-12 w-auto text-foreground" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              Your Gateway to the <span className="text-primary neon-text-purple">Tipschain Ecosystem</span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 text-muted-foreground">
              The Ultimate Wallet by <span className="text-primary neon-text-purple">Tipspay</span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The ultimate non-custodial wallet for the TipsChain ecosystem. 
              Manage your assets, swap tokens, and explore dApps with ease.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Non-Custodial",
                desc: "Your keys, your crypto. We never have access to your funds.",
                color: "text-primary"
              },
              {
                icon: ArrowRight,
                title: "Integrated DEX",
                desc: "Swap tokens instantly with the best rates across the network.",
                color: "text-secondary"
              },
              {
                icon: Cpu,
                title: "Hardware Support",
                desc: "Connect your Ledger or Trezor for maximum security.",
                color: "text-accent"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-8 rounded-[32px] border-white/5 hover:border-white/20 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <TipsPayWalletLogo className="h-8 w-auto text-foreground" />
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Telegram</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Tipschain Ecosystem Wallet by Tipspay. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
