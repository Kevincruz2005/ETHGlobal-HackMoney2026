import React, { useState } from 'react';
import { useTeleport } from '@/hooks/useTeleport';
import { ArrowRight, Loader2 } from 'lucide-react';

/**
 * Example component demonstrating useTeleport hook usage
 * 
 * Can be added to the /wallet page for testing CCTP bridging
 */
export default function TeleportExample() {
    const { teleport, isApproving, isBurning, error, txHash } = useTeleport();
    const [amount, setAmount] = useState('1.0');
    const [recipient, setRecipient] = useState('0x995D174C8b0c4F70817EaA59aDb8A3e20fAF659c');

    const handleTeleport = async () => {
        await teleport(amount, recipient);
    };

    const isLoading = isApproving || isBurning;

    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Bridge to Ethereum</h2>

            <div className="space-y-4">
                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Amount (USDC)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white focus:border-amber-500 focus:outline-none disabled:opacity-50"
                        placeholder="1.0"
                    />
                </div>

                {/* Recipient Input */}
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Recipient (Ethereum Address)
                    </label>
                    <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white font-mono text-sm focus:border-amber-500 focus:outline-none disabled:opacity-50"
                        placeholder="0x..."
                    />
                </div>

                {/* Bridge Button */}
                <button
                    onClick={handleTeleport}
                    disabled={isLoading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg font-bold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isApproving && (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Approving USDC...
                        </>
                    )}
                    {isBurning && (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Burning USDC...
                        </>
                    )}
                    {!isLoading && (
                        <>
                            Bridge to Ethereum
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>

                {/* Status Messages */}
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-400">❌ {error}</p>
                    </div>
                )}

                {txHash && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-sm text-emerald-400 mb-2">
                            ✓ Burn complete! USDC burned on Base Sepolia.
                        </p>
                        <a
                            href={`https://sepolia.basescan.org/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-400 hover:text-amber-300 font-mono break-all"
                        >
                            {txHash}
                        </a>
                        <p className="text-xs text-zinc-500 mt-2">
                            Note: Attestation and minting on Ethereum Sepolia is a separate step.
                        </p>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2 text-sm text-amber-400">
                    <span className="text-xl">⚪</span>
                    <div>
                        <strong>Circle CCTP Bridge</strong>
                        <br />
                        Burns USDC on Base Sepolia for minting on Ethereum Sepolia. Requires attestation from Circle API before minting.
                    </div>
                </div>
            </div>
        </div>
    );
}
