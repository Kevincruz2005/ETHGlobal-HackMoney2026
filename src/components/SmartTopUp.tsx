"use client";

import { LiFiWidget, WidgetConfig } from '@lifi/widget';
import { X } from 'lucide-react';

interface SmartTopUpProps {
    isOpen: boolean;
    onClose: () => void;
}

const widgetConfig: WidgetConfig = {
    integrator: 'nitrogate-hackathon',
    // Hardcoded to Bridge TO: Base Sepolia (Chain ID: 84532), USDC
    toChain: 84532,
    toToken: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia

    // Aesthetic Config
    theme: {
        container: {
            border: '1px solid rgb(39, 39, 42)',
            borderRadius: '16px',
        },
        palette: {
            primary: { main: '#FACC15' }, // Yellow-400
            secondary: { main: '#27272A' },
        },
    },
    appearance: 'dark',
};

export default function SmartTopUp({ isOpen, onClose }: SmartTopUpProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-[420px] bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-900 bg-zinc-900/50">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Smart Top-Up
                        </h3>
                        <p className="text-xs text-zinc-400">Low balance detected. Bridge funds instantly.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Widget Container */}
                <div className="h-[600px] w-full bg-black">
                    <LiFiWidget integrator="nitrogate-hackathon" config={widgetConfig} />
                </div>
            </div>
        </div>
    );
}
