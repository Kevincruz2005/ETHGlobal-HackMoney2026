"use client";

import { motion } from "framer-motion";
import type { StreamLog } from "@/hooks/useStreamSession";

interface AgentViewProps {
    balance: number;
    isPlaying: boolean;
    totalPaid: number;
    logs: StreamLog[];
    creatorAddress: string;
}

export default function AgentView({
    balance,
    isPlaying,
    totalPaid,
    logs,
    creatorAddress
}: AgentViewProps) {
    const agentData = {
        protocol: "NITROLITE_V1",
        timestamp: new Date().toISOString(),
        stream: {
            status: isPlaying ? "ACTIVE" : "INACTIVE",
            balance_usdc: balance.toFixed(6),
            total_paid_usdc: totalPaid.toFixed(6),
            rate_per_second: "0.0001",
        },
        creator: {
            address: creatorAddress,
            chain: "base-sepolia",
            content_type: "video/mp4",
        },
        channel: {
            state: isPlaying ? "OPEN" : "CLOSED",
            signatures_count: logs.filter(l => l.type === "STATE_UPDATE").length,
        },
        recent_transactions: logs.slice(0, 10).map(log => ({
            type: log.type,
            amount: log.amount,
            signature: log.signature,
            timestamp: new Date(log.timestamp).toISOString(),
        })),
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full bg-black rounded-xl border border-zinc-800 overflow-hidden font-mono text-xs"
        >
            {/* Header */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-cyan-400 font-bold tracking-wider">AGENT_STREAM_API</span>
                </div>
                <span className="text-zinc-600 text-[10px]">application/json</span>
            </div>

            {/* JSON Content */}
            <div className="p-4 overflow-auto h-[calc(100%-60px)] scrollbar-thin scrollbar-thumb-zinc-800">
                <pre className="text-green-400 whitespace-pre-wrap break-all leading-relaxed">
                    {JSON.stringify(agentData, null, 2)}
                </pre>
            </div>
        </motion.div>
    );
}
