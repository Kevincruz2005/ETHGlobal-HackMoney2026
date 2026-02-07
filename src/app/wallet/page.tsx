"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, Zap, TrendingUp, ArrowUpRight, Activity, Shield } from "lucide-react";
import { useAccount } from "wagmi";
import WalletProfile from "@/components/WalletProfile";
import ArcDeposit from "@/components/ArcDeposit";

export default function WalletPage() {
    // Real wallet connection
    const { address, isConnected } = useAccount();

    // Balances (persistent in localStorage for demo)
    const [externalBalance, setExternalBalance] = useState(0);
    const [arcBalance, setArcBalance] = useState(0);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [showBalanceAnimation, setShowBalanceAnimation] = useState(false);

    // Load balances from localStorage on mount
    useEffect(() => {
        if (address) {
            const storedExternal = localStorage.getItem(`balance_external_${address}`);
            const storedArc = localStorage.getItem(`balance_arc_${address}`);

            setExternalBalance(storedExternal ? parseFloat(storedExternal) : 154.20);
            setArcBalance(storedArc ? parseFloat(storedArc) : 0);
        }
    }, [address]);

    // Save balances to localStorage
    useEffect(() => {
        if (address) {
            localStorage.setItem(`balance_external_${address}`, externalBalance.toString());
            localStorage.setItem(`balance_arc_${address}`, arcBalance.toString());
        }
    }, [externalBalance, arcBalance, address]);

    const handleDeposit = (amount: number) => {
        setExternalBalance(prev => prev - amount);
        setArcBalance(prev => prev + amount);
        setShowBalanceAnimation(true);
        setTimeout(() => setShowBalanceAnimation(false), 2000);
    };

    // Animated number counter
    const AnimatedNumber = ({ value, prefix = "$", decimals = 2 }: { value: number; prefix?: string; decimals?: number }) => {
        const [displayValue, setDisplayValue] = useState(value);

        useEffect(() => {
            const duration = 1000;
            const steps = 30;
            const increment = (value - displayValue) / steps;
            let currentStep = 0;

            const timer = setInterval(() => {
                currentStep++;
                if (currentStep >= steps) {
                    setDisplayValue(value);
                    clearInterval(timer);
                } else {
                    setDisplayValue(prev => prev + increment);
                }
            }, duration / steps);

            return () => clearInterval(timer);
        }, [value]);

        return (
            <span className="font-mono">
                {prefix}{displayValue.toFixed(decimals)}
            </span>
        );
    };

    // Show connect wallet message if not connected
    if (!isConnected || !address) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-zinc-950/95 border border-amber-500/30 rounded-xl p-8 text-center">
                    <Wallet className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
                    <p className="text-zinc-400 mb-6">
                        Please connect your wallet to view your universal balance and manage funds
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full px-6 py-3 bg-amber-500 text-black rounded-lg font-bold hover:bg-amber-400 transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Universal Wallet</h1>
                    <p className="text-zinc-400">Chain-abstracted balance powered by Circle Gateway</p>
                </div>

                {/* Wallet Profile with Base Sepolia ENS */}
                <WalletProfile />

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left: Universal Arc Balance */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Arc Balance Card */}
                        <div className="bg-zinc-950/95 border border-amber-500/30 rounded-xl p-8 shadow-2xl shadow-amber-500/10 relative overflow-hidden">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-amber-400" />
                                        <h3 className="text-lg font-bold text-white">Circle Arc Balance</h3>
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-400 flex items-center gap-1">
                                        <Activity className="w-3 h-3 animate-pulse" />
                                        ACTIVE
                                    </div>
                                </div>

                                {/* Balance */}
                                <motion.div
                                    animate={showBalanceAnimation ? { scale: [1, 1.05, 1] } : {}}
                                    transition={{ duration: 0.5 }}
                                    className="mb-6"
                                >
                                    <div className="text-6xl font-bold text-amber-400 mb-2">
                                        <AnimatedNumber value={arcBalance} />
                                    </div>
                                    <div className="text-sm text-zinc-400">USDC on Circle Arc</div>
                                </motion.div>

                                {/* Yellow Network Status */}
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Zap className="w-4 h-4 text-yellow-400" />
                                        <span className="text-yellow-400 font-bold">Yellow State Channels:</span>
                                        <span className="text-emerald-400 font-medium">Active</span>
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-1">
                                        Ready for gasless pay-per-second streaming
                                    </div>
                                </div>

                                {/* Deposit Button */}
                                <button
                                    onClick={() => setIsDepositOpen(true)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                                >
                                    <ArrowUpRight className="w-5 h-5" />
                                    Deposit to Arc
                                </button>
                            </div>
                        </div>

                        {/* External Wallet Card */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-zinc-400" />
                                    <h3 className="text-lg font-bold text-white">External Wallet</h3>
                                </div>
                                <div className="text-xs text-zinc-500">Base Sepolia</div>
                            </div>

                            <div className="text-3xl font-bold text-white mb-1 font-mono">
                                ${externalBalance.toFixed(2)}
                            </div>
                            <div className="text-sm text-zinc-400">Available USDC</div>
                        </div>
                    </motion.div>

                    {/* Right: Transaction History & Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    <div className="text-xs text-zinc-400">Total Deposited</div>
                                </div>
                                <div className="text-2xl font-bold text-emerald-400">
                                    ${(154.20 - externalBalance + arcBalance).toFixed(2)}
                                </div>
                            </div>

                            <div className="bg-zinc-900/50 border border-purple-500/20 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-4 h-4 text-purple-400" />
                                    <div className="text-xs text-zinc-400">Total Streamed</div>
                                </div>
                                <div className="text-2xl font-bold text-purple-400">
                                    ${(154.20 - externalBalance - arcBalance).toFixed(4)}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>

                            {arcBalance === 0 && externalBalance === 154.20 ? (
                                <div className="text-center py-8 text-zinc-500">
                                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No transactions yet</p>
                                    <p className="text-sm mt-1">Deposit to Arc to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {arcBalance > 0 && (
                                        <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-emerald-500/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">Deposit</div>
                                                    <div className="text-xs text-zinc-500">Base Sepolia → Circle Arc</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-emerald-400">+${arcBalance.toFixed(2)}</div>
                                                <div className="text-xs text-zinc-500">Just now</div>
                                            </div>
                                        </div>
                                    )}

                                    {(154.20 - externalBalance - arcBalance) > 0.001 && (
                                        <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-purple-500/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                                                    <span className="text-purple-400 text-sm">🎬</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">Streaming</div>
                                                    <div className="text-xs text-zinc-500">Pay-per-second</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-purple-400">
                                                    -${(154.20 - externalBalance - arcBalance).toFixed(4)}
                                                </div>
                                                <div className="text-xs text-zinc-500">Recent</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Circle Gateway Info */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/40 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Powered by Circle Gateway</h4>
                                    <p className="text-sm text-zinc-400 leading-relaxed">
                                        Seamless cross-chain USDC transfers with burn-and-mint technology.
                                        Zero gas fees on destination chain. Instant finality.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Arc Deposit Modal */}
            <ArcDeposit
                externalBalance={externalBalance}
                onDeposit={handleDeposit}
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
            />
        </div>
    );
}
