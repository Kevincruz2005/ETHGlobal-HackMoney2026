"use client";

import { X, Download, DollarSign, Video } from "lucide-react";

interface DownloadConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    videoTitle: string;
    quality: string;
    totalWatchedSeconds: number;
    streamingCost: number;
    downloadFee?: number;
}

export default function DownloadConfirmation({
    isOpen,
    onClose,
    onConfirm,
    videoTitle,
    quality,
    totalWatchedSeconds,
    streamingCost,
    downloadFee = 0.0050
}: DownloadConfirmationProps) {
    if (!isOpen) return null;

    const totalCost = streamingCost + downloadFee;
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-[#4DA2FF]/30 rounded-xl w-full max-w-md p-6 shadow-2xl shadow-[#4DA2FF]/10 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#4DA2FF]/20 rounded-lg border border-[#4DA2FF]/30">
                            <Download className="w-5 h-5 text-[#4DA2FF]" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Download Confirmation</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-zinc-800 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Video Info */}
                <div className="mb-6 p-4 bg-black/40 rounded-lg border border-zinc-800">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#4DA2FF]/10 rounded">
                            <Video className="w-4 h-4 text-[#4DA2FF]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-zinc-400 mb-1">Video</p>
                            <p className="text-white font-semibold">{videoTitle}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 text-xs bg-[#4DA2FF]/20 text-[#4DA2FF] rounded border border-[#4DA2FF]/30 font-mono">
                                    {quality}
                                </span>
                                <span className="text-xs text-zinc-500">
                                    {formatTime(totalWatchedSeconds)} watched
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction Breakdown */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Transaction Summary</h3>
                    </div>

                    <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-zinc-800">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                <span className="text-zinc-300">Streaming Cost (Already Paid)</span>
                            </div>
                            <span className="font-mono text-green-400">${streamingCost.toFixed(4)}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#4DA2FF]"></div>
                                <span className="text-zinc-300">Download Fee (One-time)</span>
                            </div>
                            <span className="font-mono text-[#4DA2FF]">${downloadFee.toFixed(4)}</span>
                        </div>

                        <div className="h-px bg-[#4DA2FF]/30 my-3" />

                        <div className="flex justify-between items-center">
                            <span className="text-white font-bold uppercase tracking-wide">Total Due</span>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-[#4DA2FF] font-mono">
                                    ${totalCost.toFixed(4)}
                                </div>
                                <div className="text-xs text-zinc-500 font-mono">USDC</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all font-medium hover:scale-105"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-[#4DA2FF] to-[#3A8BEE] hover:from-[#3A8BEE] hover:to-[#2A7BCF] text-black rounded-lg transition-all font-bold shadow-lg shadow-[#4DA2FF]/30 hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Confirm Download
                    </button>
                </div>

                {/* Note */}
                <div className="mt-4 p-3 bg-blue-500/10  border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-300 text-center">
                        💡 You've already paid ${streamingCost.toFixed(4)} for streaming. Download fee is ${downloadFee.toFixed(4)} for lifetime access.
                    </p>
                </div>
            </div>
        </div>
    );
}
