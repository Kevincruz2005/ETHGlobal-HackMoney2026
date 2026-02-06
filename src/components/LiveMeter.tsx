"use client";

interface LiveMeterProps {
    amountPaid: number;
    isPlaying: boolean;
    ratePerSecond: number;
}

export default function LiveMeter({ amountPaid, isPlaying, ratePerSecond }: LiveMeterProps) {
    return (
        <div className="fixed top-24 right-6 z-30 bg-zinc-950/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-4 shadow-xl shadow-amber-500/10 min-w-[240px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                    <span className="text-xs font-bold text-zinc-400">LIVE METER</span>
                </div>
                <div className="text-xs px-2 py-0.5 bg-amber-500/20 rounded text-amber-400 font-bold">
                    🟡 YELLOW
                </div>
            </div>

            {/* Amount Paid */}
            <div className="mb-3">
                <div className="text-xs text-zinc-500 mb-1">Amount Paid</div>
                <div className="text-2xl font-mono font-bold text-amber-400">
                    ${amountPaid.toFixed(4)}
                </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Channel Status</span>
                <span className="text-emerald-400 font-medium">Open - Gasless</span>
            </div>

            {/* Rate */}
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Rate/sec</span>
                <span className="text-amber-400 font-mono">${ratePerSecond.toFixed(6)}</span>
            </div>
        </div>
    );
}
