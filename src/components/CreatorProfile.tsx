"use client";

import Image from "next/image";
import type { NitroCreatorMetadata } from "@/hooks/useNitroCreatorMetadata";

interface CreatorProfileProps {
    address: `0x${string}`;
    metadata?: NitroCreatorMetadata;
}

export default function CreatorProfile({ address, metadata }: CreatorProfileProps) {
    const ensName = metadata?.ensName;
    const ensAvatar = metadata?.ensAvatar;
    const description = metadata?.description;
    const discountCode = metadata?.discountCode;
    const saleRate = metadata?.saleRate;
    return (
        <div className="flex items-center gap-3 p-3 bg-black/50 rounded-xl border border-zinc-800 backdrop-blur-sm">
            {/* Avatar */}
            <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border-2 border-[#4DA2FF]/50">
                    {ensAvatar ? (
                        <Image
                            src={ensAvatar}
                            alt={ensName || "Creator"}
                            width={48}
                            height={48}
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold text-lg">
                            ?
                        </div>
                    )}
                </div>
                {/* Online Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate">
                        {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
                    </span>
                    {ensName && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-[#4DA2FF]/20 text-[#4DA2FF] rounded-full font-bold tracking-wide">
                            VERIFIED
                        </span>
                    )}
                </div>
                <p className="text-xs text-zinc-400 truncate">
                    {description || "Creator on NitroGate"}
                </p>
                {(typeof saleRate === "number" || discountCode) && (
                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                        {typeof saleRate === "number" && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#4DA2FF]/15 text-[#4DA2FF] border border-[#4DA2FF]/20 font-bold">
                                SALE RATE: {saleRate.toFixed(6)}/s
                            </span>
                        )}
                        {discountCode && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#4DA2FF]/15 text-[#4DA2FF] border border-[#4DA2FF]/20 font-bold">
                                COUPON: {discountCode}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
