"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";
import { Film, Wallet, Sparkles } from "lucide-react";

export default function Navigation() {
    const pathname = usePathname();
    const { address } = useAccount();
    const { data: ensName } = useEnsName({
        address,
        chainId: mainnet.id,
    });

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold text-sm">N</span>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            NitroGate
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/browse"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/browse')
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                                }`}
                        >
                            <Film className="w-4 h-4" />
                            <span className="text-sm font-medium">Browse</span>
                        </Link>

                        <Link
                            href="/wallet"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/wallet')
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                                }`}
                        >
                            <Wallet className="w-4 h-4" />
                            <span className="text-sm font-medium">Wallet</span>
                        </Link>

                        <Link
                            href="/studio"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/studio')
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">Studio</span>
                        </Link>
                    </div>

                    {/* Right Side: ENS + Connect Button */}
                    <div className="flex items-center gap-4">
                        {/* ENS Greeting */}
                        {ensName && address && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-white/5 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                    <span className="text-indigo-400 text-xs">👤</span>
                                </div>
                                <span className="text-indigo-400 text-sm font-medium">{ensName}</span>
                            </div>
                        )}

                        {/* RainbowKit Connect Button */}
                        <ConnectButton.Custom>
                            {({
                                account,
                                chain,
                                openAccountModal,
                                openChainModal,
                                openConnectModal,
                                mounted,
                            }) => {
                                const ready = mounted;
                                const connected = ready && account && chain;

                                return (
                                    <div
                                        {...(!ready && {
                                            'aria-hidden': true,
                                            'style': {
                                                opacity: 0,
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                            },
                                        })}
                                    >
                                        {(() => {
                                            if (!connected) {
                                                return (
                                                    <button
                                                        onClick={openConnectModal}
                                                        type="button"
                                                        className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors font-medium text-sm"
                                                    >
                                                        Connect Wallet
                                                    </button>
                                                );
                                            }

                                            if (chain.unsupported) {
                                                return (
                                                    <button
                                                        onClick={openChainModal}
                                                        type="button"
                                                        className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-medium text-sm"
                                                    >
                                                        Wrong network
                                                    </button>
                                                );
                                            }

                                            return (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={openChainModal}
                                                        type="button"
                                                        className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-lg hover:bg-zinc-900/70 transition-colors"
                                                    >
                                                        {chain.hasIcon && (
                                                            <div
                                                                style={{
                                                                    background: chain.iconBackground,
                                                                    width: 16,
                                                                    height: 16,
                                                                    borderRadius: 999,
                                                                    overflow: 'hidden',
                                                                }}
                                                            >
                                                                {chain.iconUrl && (
                                                                    <img
                                                                        alt={chain.name ?? 'Chain icon'}
                                                                        src={chain.iconUrl}
                                                                        style={{ width: 16, height: 16 }}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                        <span className="text-zinc-300 text-sm font-medium">{chain.name}</span>
                                                    </button>

                                                    <button
                                                        onClick={openAccountModal}
                                                        type="button"
                                                        className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors font-medium text-sm"
                                                    >
                                                        {account.displayName}
                                                    </button>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                );
                            }}
                        </ConnectButton.Custom>
                    </div>
                </div>
            </div>
        </nav>
    );
}
