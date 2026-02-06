"use client";

import Link from "next/link";
import { useAccount, useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";
import { Zap, Shield, Coins, Film, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  });

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
        {/* Radial Glow Background */}
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* ENS Greeting */}
          {isConnected && ensName && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-block px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
            >
              <span className="text-indigo-400 text-sm">
                Welcome back, <span className="font-bold">{ensName}</span> ✨
              </span>
            </motion.div>
          )}

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            NitroGate:
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Pay-Per-Second Cinema
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto"
          >
            The Netflix of Web3. Stream premium content and pay only for what you watch.
            <br />
            <span className="text-amber-400/80">Zero gas fees. Instant payments. True ownership.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/browse"
              className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Film className="w-5 h-5" />
              Browse Movies
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/studio"
              className="px-8 py-4 bg-zinc-900/50 border border-white/10 text-white rounded-lg font-bold text-lg hover:bg-zinc-800/50 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              Start Creating
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">$0.0001</div>
              <div className="text-sm text-zinc-500">Per Second</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">0</div>
              <div className="text-sm text-zinc-500">Gas Fees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">100%</div>
              <div className="text-sm text-zinc-500">To Creators</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution Cards */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center text-white mb-16"
          >
            Why NitroGate?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Subscriptions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/50 border border-white/5 rounded-xl p-8 hover:border-amber-500/30 transition-colors group"
            >
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Why wait for subscriptions?
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Pay per second, not per month. Watch a 2-hour movie for <span className="text-amber-400 font-mono">$0.72</span> instead of a $15 monthly subscription you barely use.
              </p>
            </motion.div>

            {/* Card 2: Gas Fees */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/50 border border-white/5 rounded-xl p-8 hover:border-amber-500/30 transition-colors group"
            >
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Why pay gas fees?
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Every payment happens off-chain via <span className="text-amber-400 font-semibold">Yellow Network</span> state channels. Stream for hours with <span className="text-amber-400 font-mono">zero gas fees</span>.
              </p>
            </motion.div>

            {/* Card 3: Ownership */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900/50 border border-white/5 rounded-xl p-8 hover:border-amber-500/30 transition-colors group"
            >
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Own your content
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Creators keep <span className="text-amber-400 font-mono">100%</span> of revenue. Verified identities via <span className="text-indigo-400 font-semibold">ENS</span>. Bridge funds from any chain with <span className="text-purple-400 font-semibold">Circle Arc</span>.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 px-6 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center text-white mb-16"
          >
            Powered by the Best
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Yellow Network */}
            <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🟡</div>
              <h3 className="text-lg font-bold text-amber-400 mb-2">Yellow Network</h3>
              <p className="text-sm text-zinc-400">State channels for gasless micropayments</p>
            </div>

            {/* Circle Arc */}
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🔵</div>
              <h3 className="text-lg font-bold text-purple-400 mb-2">Circle Arc</h3>
              <p className="text-sm text-zinc-400">Chain-abstracted USDC for universal liquidity</p>
            </div>

            {/* ENS */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🏷️</div>
              <h3 className="text-lg font-bold text-indigo-400 mb-2">ENS</h3>
              <p className="text-sm text-zinc-400">Decentralized identity and trust layer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-6"
          >
            Ready to experience the future of streaming?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400 mb-12"
          >
            Join creators and viewers building the decentralized content economy.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/browse"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
            >
              Start Watching
            </Link>
            <Link
              href="/studio"
              className="px-8 py-4 bg-zinc-900/50 border border-white/10 text-white rounded-lg font-bold text-lg hover:bg-zinc-800/50 transition-all"
            >
              Become a Creator
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
