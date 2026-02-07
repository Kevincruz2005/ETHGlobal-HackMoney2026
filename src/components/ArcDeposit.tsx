"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, Zap, CheckCircle2, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { useTeleport } from "@/hooks/useTeleport";

interface ArcDepositProps {
    externalBalance: number;
    onDeposit: (amount: number) => void;
    isOpen: boolean;
    onClose: () => void;
}

type DepositStep = 'idle' | 'approving' | 'burning' | 'attesting' | 'complete';

export default function ArcDeposit({ externalBalance, onDeposit, isOpen, onClose }: ArcDepositProps) {
    const [amount, setAmount] = useState("");
    const [localStep, setLocalStep] = useState<DepositStep>('idle');

    const { teleport, isApproving, isBurning, error, txHash } = useTeleport();

    // Sync hook states to local step
    useEffect(() => {
        if (isApproving) {
            setLocalStep('approving');
        } else if (isBurning) {
            setLocalStep('burning');
        } else if (txHash && !error) {
            setLocalStep('attesting');
            // Show complete after brief delay
            setTimeout(() => {
                setLocalStep('complete');
                const depositAmount = parseFloat(amount);
                onDeposit(depositAmount);

                // Reset after showing success
                setTimeout(() => {
                    setAmount("");
                    setLocalStep('idle');
                    onClose();
                }, 1500);
            }, 1000);
        } else if (!isApproving && !isBurning && !txHash) {
            setLocalStep('idle');
        }
    }, [isApproving, isBurning, txHash, error]);

    const handleDeposit = async () => {
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0 || depositAmount > externalBalance) {
            return;
        }

        try {
            // Call the real CCTP hook
            // Note: We're bridging to Ethereum Sepolia since Arc domain isn't supported yet
            // For demo, we treat this as "Arc" in the UI
            const recipientAddress = '0x995D174C8b0c4F70817EaA59aDb8A3e20fAF659c' as `0x${string}`;
            await teleport(amount, recipientAddress);
        } catch (err) {
            console.error('[ArcDeposit] Error:', err);
        }
    };

    const getStepInfo = () => {
        switch (localStep) {
            case 'approving':
                return { text: 'Approving USDC...', progress: 25 };
            case 'burning':
                return { text: 'Burning USDC on Base...', progress: 60 };
            case 'attesting':
                return { text: 'Waiting for attestation...', progress: 90 };
            case 'complete':
                return { text: 'Teleport Complete! ✨', progress: 100 };
            default:
                return { text: '', progress: 0 };
        }
    };

    const stepInfo = getStepInfo();
    const isProcessing = localStep !== 'idle' && localStep !== 'complete';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-zinc-950/95 border border-amber-500/30 rounded-xl p-8 shadow-2xl shadow-amber-500/20">
                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/40 rounded-lg flex items-center justify-center">
                                        <ArrowDownToLine className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Bridge to Arc</h2>
                                        <p className="text-xs text-zinc-500">Cross-chain USDC via CCTP</p>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Deposit Amount (USDC)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        disabled={isProcessing}
                                        className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-lg text-white text-lg font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
                                    />
                                    <button
                                        onClick={() => setAmount(externalBalance.toString())}
                                        disabled={isProcessing}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                                    >
                                        MAX
                                    </button>
                                </div>
                                <div className="mt-2 text-xs text-zinc-500">
                                    Available: <span className="text-amber-400 font-mono">${externalBalance.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Progress Steps */}
                            <AnimatePresence>
                                {isProcessing && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6"
                                    >
                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${stepInfo.progress}%` }}
                                                    transition={{ duration: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Step Text */}
                                        <div className="flex items-center gap-2 text-sm">
                                            {localStep === 'complete' ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                                            )}
                                            <span className="text-zinc-300">{stepInfo.text}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error Display */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <div className="flex items-start gap-2 text-sm text-red-400">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-bold mb-1">Transaction Failed</div>
                                            <div className="text-red-400/80">{error}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Success with TX Link */}
                            {txHash && !error && (
                                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <div className="flex items-start gap-2 text-sm text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="font-bold mb-1">Burn Complete!</div>
                                            <a
                                                href={`https://sepolia.basescan.org/tx/${txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-amber-400 hover:text-amber-300 font-mono break-all flex items-center gap-1"
                                            >
                                                View on BaseScan <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <div className="flex items-start gap-2 text-xs text-amber-300">
                                    <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold mb-1">Circle CCTP Bridge</div>
                                        <div className="text-amber-400/80">
                                            Burns USDC on Base Sepolia. Attestation for minting takes 10-20 minutes.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isProcessing}
                                    className="flex-1 px-4 py-3 bg-zinc-800/50 border border-white/10 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeposit}
                                    disabled={!amount || isProcessing || parseFloat(amount) > externalBalance}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg font-bold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? 'Processing...' : 'Bridge Now'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
