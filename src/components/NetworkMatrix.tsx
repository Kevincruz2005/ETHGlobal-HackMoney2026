"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import MatrixLog from "./MatrixLog";
import type { StreamLog } from "@/hooks/useStreamSession";

interface NetworkMatrixProps {
    logs: StreamLog[];
}

export default function NetworkMatrix({ logs }: NetworkMatrixProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="col-span-3">
            {/* Trigger Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-lg px-4 py-2.5 text-left hover:bg-zinc-900/70 transition-colors flex items-center justify-between group"
            >
                <span className="flex items-center gap-2">
                    <span className="text-amber-400 group-hover:scale-110 transition-transform">⚡</span>
                    <span className="text-sm text-zinc-400 group-hover:text-zinc-100 transition-colors">
                        Network Activity
                    </span>
                    <span className="text-xs text-zinc-600 font-mono">
                        ({logs.length} events)
                    </span>
                </span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>System Operational</span>
                    </span>
                    <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-zinc-500"
                    >
                        ▼
                    </motion.span>
                </div>
            </button>

            {/* Sliding Terminal */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 bg-black border border-white/5 rounded-lg p-4">
                            <div className="mb-2 pb-2 border-b border-white/5 flex items-center justify-between">
                                <span className="text-xs text-amber-400 font-mono">YELLOW NETWORK LOGS</span>
                                <span className="text-xs text-zinc-600 font-mono">
                                    {new Date().toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <MatrixLog logs={logs} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
