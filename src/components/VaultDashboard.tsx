"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Wallet, ChevronDown, ChevronUp } from "lucide-react";

interface VaultDashboardProps {
    balance: number;
    onTopUp: () => void;
}

export default function VaultDashboard({ balance, onTopUp }: VaultDashboardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusColor = () => {
        if (balance > 2) return "text-green-400";
        if (balance > 0.5) return "text-yellow-400";
        return "text-red-400";
    };

    const getStatusLabel = () => {
        if (balance > 2) return "Healthy";
        if (balance > 0.5) return "Low";
        return "Empty";
    };

    return (
        <div className="fixed top-24 right-6 z-40">
            {/* Collapsible Trigger Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-all mb-2 w-full justify-between"
            >
                <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    <span className="font-medium text-sm">Vault</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{balance.toFixed(2)} USDC</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {/* Expandable Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm space-y-6">
                            {/* Balance Display */}
                            <div className="text-center">
                                <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Real-Time Balance</div>
                                <motion.div
                                    key={balance}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-4xl font-mono text-amber-400 mb-4"
                                >
                                    {balance.toFixed(4)} <span className="text-2xl text-zinc-500">USDC</span>
                                </motion.div>

                                {/* Status Gauge */}
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor()} border-current/30 bg-current/10`}>
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
                                    <span className={`text-xs font-medium ${getStatusColor()}`}>{getStatusLabel()}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={onTopUp}
                                    className="w-full px-4 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-all font-medium text-sm"
                                >
                                    💰 Top Up (Circle Arc)
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="px-3 py-2 bg-zinc-800/50 border border-white/10 text-zinc-400 rounded-lg hover:bg-zinc-800/70 transition-all text-xs font-medium">
                                        Stake
                                    </button>
                                    <button className="px-3 py-2 bg-zinc-800/50 border border-white/10 text-zinc-400 rounded-lg hover:bg-zinc-800/70 transition-all text-xs font-medium">
                                        Withdraw
                                    </button>
                                </div>
                            </div>

                            {/* Marketplace Preview */}
                            <div className="pt-4 border-t border-white/5">
                                <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Marketplace</div>
                                <div className="space-y-2">
                                    {[
                                        { chain: "Ethereum", nodes: 1, price: "0.1" },
                                        { chain: "Arbitrum", nodes: 1, price: "0.05" },
                                    ].map((item) => (
                                        <div
                                            key={item.chain}
                                            className="flex items-center justify-between px-3 py-2 bg-zinc-800/30 rounded-lg border border-white/5 hover:border-amber-500/20 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                <span className="text-xs text-zinc-300">{item.chain}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-zinc-500">{item.nodes} node</span>
                                                <span className="text-xs font-mono text-amber-400">{item.price} USDC</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
