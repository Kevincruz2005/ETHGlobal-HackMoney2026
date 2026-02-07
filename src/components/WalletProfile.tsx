"use client";

import { useAccount, useEnsName, useEnsAvatar } from "wagmi";
import { baseSepolia, sepolia } from "wagmi/chains";
import { motion } from "framer-motion";

/**
 * WalletProfile - Universal Wallet Identity Component
 * 
 * Performs proper reverse ENS resolution on BOTH:
 * - Ethereum Sepolia (for regular ENS names via sepolia.app.ens)
 * - Base Sepolia (for Basenames via base.org)
 * 
 * Features:
 * - Multi-chain ENS resolution
 * - Loading skeleton states
 * - ENS avatar with gradient fallback
 * - Verified badge for ENS names
 */

// Generate deterministic gradient based on address
const generateGradient = (address: string): string => {
    const hash = address.toLowerCase().slice(2, 8);
    const hue1 = parseInt(hash.slice(0, 2), 16);
    const hue2 = parseInt(hash.slice(2, 4), 16);
    const hue3 = parseInt(hash.slice(4, 6), 16);

    return `linear-gradient(135deg, 
        hsl(${hue1}, 70%, 60%) 0%, 
        hsl(${hue2}, 70%, 55%) 50%, 
        hsl(${hue3}, 70%, 50%) 100%)`;
};

// Generate blocky avatar from address
const AddressAvatar = ({ address }: { address: string }) => {
    const gradient = generateGradient(address);
    const initial = address.slice(2, 4).toUpperCase();

    return (
        <div
            className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
            style={{ background: gradient }}
        >
            {initial}
        </div>
    );
};

export default function WalletProfile() {
    const { address, isConnected } = useAccount();

    // Query Ethereum Sepolia for regular ENS (sepolia.app.ens)
    const { data: ensNameSepolia, isLoading: ensLoadingSepolia } = useEnsName({
        address,
        chainId: sepolia.id, // 11155111 - Ethereum Sepolia
    });

    // Query Base Sepolia for Basenames (base.org)
    const { data: ensNameBase, isLoading: ensLoadingBase } = useEnsName({
        address,
        chainId: baseSepolia.id, // 84532 - Base Sepolia
    });

    // Use whichever name exists (prioritize Ethereum Sepolia)
    const ensName = ensNameSepolia || ensNameBase;
    const ensNameLoading = ensLoadingSepolia || ensLoadingBase;
    const ensSource = ensNameSepolia ? "Ethereum Sepolia" : ensNameBase ? "Base Sepolia" : null;

    // Fetch avatar from the same chain as the name
    const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
        name: ensName || undefined,
        chainId: ensNameSepolia ? sepolia.id : baseSepolia.id,
    });

    if (!isConnected || !address) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6 backdrop-blur-md"
        >
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/40 overflow-hidden flex items-center justify-center">
                    {ensAvatarLoading ? (
                        // Loading skeleton
                        <div className="w-full h-full bg-zinc-800 animate-pulse" />
                    ) : ensAvatar ? (
                        // ENS avatar
                        <img
                            src={ensAvatar}
                            alt={ensName || address}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        // Gradient fallback based on address
                        <AddressAvatar address={address} />
                    )}
                </div>

                {/* Identity Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {/* Name or Address */}
                        {ensNameLoading ? (
                            // Loading skeleton
                            <div className="h-8 w-48 bg-zinc-800 animate-pulse rounded" />
                        ) : (
                            <h2 className="text-2xl font-bold text-white">
                                {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
                            </h2>
                        )}

                        {/* Verified Badge */}
                        {ensName && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-xs font-bold text-emerald-400"
                            >
                                VERIFIED
                            </motion.div>
                        )}
                    </div>

                    {/* Address (always show for transparency) */}
                    <div className="text-sm text-zinc-500 font-mono">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                </div>

                {/* ENS Badge */}
                <div className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
                    <div className="text-xs text-zinc-400 mb-1">Identity by</div>
                    <div className="text-lg font-bold text-indigo-400">
                        {ensName ? "ENS" : "Base"}
                    </div>
                </div>
            </div>

            {/* ENS Info Banner */}
            {ensName && ensSource && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/5"
                >
                    <div className="text-xs text-zinc-400">
                        ENS name registered on <span className="text-indigo-400 font-semibold">{ensSource}</span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
