"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { useEnsAvatar } from "wagmi";
import { mainnet } from "wagmi/chains";
import { normalize } from "viem/ens";
import Image from "next/image";
import type { StreamLog } from "@/hooks/useStreamSession";

interface MatrixLogProps {
    logs: StreamLog[];
    buyerLabel?: string;
    sellerLabel?: string;
    buyerEnsName?: string;
    sellerEnsName?: string;
}

export default function MatrixLog({ logs, buyerLabel, sellerLabel, buyerEnsName, sellerEnsName }: MatrixLogProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Fetch ENS avatars for buyer and seller
    const { data: buyerAvatar } = useEnsAvatar({
        name: buyerEnsName ? normalize(buyerEnsName) : undefined,
        chainId: mainnet.id,
    });

    const { data: sellerAvatar } = useEnsAvatar({
        name: sellerEnsName ? normalize(sellerEnsName) : undefined,
        chainId: mainnet.id,
    });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="flex flex-col h-full bg-black font-mono text-xs overflow-hidden relative border-l border-zinc-900">
            {/* Scanline Effect */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]" />

            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pb-10">
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2 text-green-500/80 hover:text-green-400"
                        >
                            <span className="text-zinc-600 text-[10px]">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}]</span>

                            {log.type === 'init' && (
                                <span className="text-yellow-400 font-bold">» SESSION_INIT :: {log.amount} USDC</span>
                            )}

                            {log.type === 'STATE_UPDATE' && (
                                <>
                                    {/* Buyer Avatar */}
                                    {(buyerLabel || sellerLabel) && (
                                        <div className="flex items-center gap-1">
                                            {buyerAvatar && (
                                                <div className="w-4 h-4 rounded-full overflow-hidden bg-zinc-800 border border-cyan-400/30">
                                                    <Image
                                                        src={buyerAvatar}
                                                        alt={buyerLabel || "buyer"}
                                                        width={16}
                                                        height={16}
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <span className="text-cyan-400/90 font-bold text-[10px]">
                                                {buyerLabel || "buyer"}
                                            </span>
                                        </div>
                                    )}

                                    <span className="text-green-500 font-bold text-[10px]">» SIG_VERIFIED</span>
                                    
                                    {/* Transaction Hash */}
                                    <span className="text-zinc-500 hidden lg:inline text-[9px] tracking-tighter max-w-[80px] truncate">
                                        {log.signature}
                                    </span>

                                    {/* Arrow */}
                                    <span className="text-zinc-600 text-[8px]">→</span>

                                    {/* Seller Avatar */}
                                    {(buyerLabel || sellerLabel) && (
                                        <div className="flex items-center gap-1">
                                            {sellerAvatar && (
                                                <div className="w-4 h-4 rounded-full overflow-hidden bg-zinc-800 border border-yellow-400/30">
                                                    <Image
                                                        src={sellerAvatar}
                                                        alt={sellerLabel || "seller"}
                                                        width={16}
                                                        height={16}
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <span className="text-yellow-400/90 font-bold text-[10px]">
                                                {sellerLabel || "seller"}
                                            </span>
                                        </div>
                                    )}

                                    {/* Amount */}
                                    <span className="text-white font-bold ml-auto text-[10px]">
                                        {log.amount.includes('0.000000') ? (
                                            <span className="text-purple-400">FREE VIEW</span>
                                        ) : (
                                            `-${log.amount} USDC`
                                        )}
                                    </span>
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>

            <div className="p-2 border-t border-zinc-900 bg-zinc-950 z-20">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>SECURE CHANNEL ACTIVE</span>
                    <span className="ml-auto opacity-50">YELLOWNET::NITROLITE::V1</span>
                </div>
            </div>
        </div>
    );
}
