"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface CinemaControlsProps {
    selectedQuality: '480p' | '720p' | '1080p' | '4k';
    onQualityChange: (quality: '480p' | '720p' | '1080p' | '4k') => void;
    onTip: () => void;
    creatorEns?: string;
    ratePerSecond: number;
}

export default function CinemaControls({
    selectedQuality,
    onQualityChange,
    onTip,
    creatorEns,
    ratePerSecond
}: CinemaControlsProps) {
    const [showCoin, setShowCoin] = useState(false);

    const handleTip = () => {
        setShowCoin(true);
        onTip();
        setTimeout(() => setShowCoin(false), 1000);
    };

    return (
        <div className="space-y-3">
            {/* Control Bar */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                {/* Quality Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-xs mr-2">Quality:</span>
                    <button
                        onClick={() => onQualityChange('480p')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${selectedQuality === '480p'
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                            : 'bg-zinc-800/50 border border-white/10 text-zinc-400 hover:text-zinc-200'
                            }`}
                    >
                        SD (Saver)
                    </button>
                    <button
                        onClick={() => onQualityChange('1080p')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${selectedQuality === '1080p'
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                            : 'bg-zinc-800/50 border border-white/10 text-zinc-400 hover:text-zinc-200'
                            }`}
                    >
                        🎬 Premium
                    </button>
                </div>

                {/* Tip Button */}
                <div className="relative">
                    <button
                        onClick={handleTip}
                        className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-lg hover:bg-amber-500/20 transition-all font-medium text-sm flex items-center gap-2"
                    >
                        <span>Tip 1 USDC</span>
                    </button>

                    {/* Flying Coin Animation */}
                    {showCoin && (
                        <motion.div
                            initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                            animate={{
                                y: -150,
                                x: Math.random() * 100 - 50,
                                opacity: 0,
                                scale: 0.5,
                                rotate: 360
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 text-3xl pointer-events-none"
                        >
                            💰
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Creator Info */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Creator ENS:</span>
                    <span className="text-indigo-400 font-medium">{creatorEns || 'movie-dao.eth'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Cost Per Second:</span>
                    <span className="text-amber-400 font-mono">{ratePerSecond.toFixed(6)} USC</span>
                </div>
            </div>
        </div>
    );
}
