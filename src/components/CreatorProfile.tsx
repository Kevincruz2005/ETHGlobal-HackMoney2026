"use client";

import { useEnsName, useEnsAvatar, useEnsText } from "wagmi";
import { mainnet } from "wagmi/chains";
import { normalize } from "viem/ens";
import Image from "next/image";

interface CreatorProfileProps {
    address: `0x${string}`;
}

export default function CreatorProfile({ address }: CreatorProfileProps) {
    // ENS resolution happens on mainnet
    const { data: ensName } = useEnsName({
        address,
        chainId: mainnet.id
    });

    const { data: ensAvatar } = useEnsAvatar({
        name: ensName ?? undefined,
        chainId: mainnet.id
    });

    const { data: description } = useEnsText({
        name: ensName ? normalize(ensName) : undefined,
        key: "description",
        chainId: mainnet.id,
    });

    return (
        <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 backdrop-blur-sm">
            {/* Avatar */}
            <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border-2 border-yellow-400/50">
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
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-zinc-900 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate">
                        {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
                    </span>
                    {ensName && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-yellow-400/20 text-yellow-400 rounded-full font-bold tracking-wide">
                            VERIFIED
                        </span>
                    )}
                </div>
                <p className="text-xs text-zinc-400 truncate">
                    {description || "Creator on NitroGate"}
                </p>
            </div>
        </div>
    );
}
