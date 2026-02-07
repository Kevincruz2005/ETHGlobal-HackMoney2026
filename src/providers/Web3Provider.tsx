"use client";

import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { baseSepolia, sepolia, mainnet } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
    appName: "NitroGate",
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "YOUR_PROJECT_ID", // WalletConnect
    chains: [baseSepolia, sepolia, mainnet], // Testnets + Mainnet for ENS resolution
    ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/25817603-2654-4e83-8f50-c59a008a9f80', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A', location: 'src/providers/Web3Provider.tsx:Web3Provider.useEffect', message: 'Web3Provider mounted; capture origin + projectId presence', data: { origin: typeof window !== 'undefined' ? window.location.origin : 'ssr', hasProjectId: Boolean(process.env.NEXT_PUBLIC_WC_PROJECT_ID), projectIdValue: process.env.NEXT_PUBLIC_WC_PROJECT_ID ? 'set' : 'missing_or_placeholder', chains: config.chains.map(c => ({ id: c.id, name: c.name })) }, timestamp: Date.now() }) }).catch(() => { });
        // #endregion agent log

        // Suppress unwanted console errors in development
        if (process.env.NODE_ENV === 'development') {
            const originalConsoleError = console.error;
            console.error = (...args: any[]) => {
                const message = args[0]?.toString() || '';

                // Filter out Reown/WalletConnect allowlist warnings
                if (message.includes('not found on Allowlist') || message.includes('cloud.reown.com')) {
                    console.warn('⚠️  WalletConnect/Reown: Please add your local origins to the allowlist at https://cloud.reown.com');
                    return;
                }

                // Filter out Cross-Origin-Opener-Policy checks (harmless 404 from wallet checks)
                if (message.includes('Cross-Origin-Opener-Policy') || message.includes('checkCrossOriginOpenerPolicy')) {
                    return; // Suppress COOP checks - these are expected and harmless
                }

                // Filter out duplicate key warnings from IPFS videos (until localStorage is cleaned)
                if (message.includes('Encountered two children with the same key') && message.includes('ipfs-')) {
                    console.warn('⚠️  Duplicate IPFS video detected. Run cleanup script in console to fix.');
                    return;
                }

                // Filter out empty video error objects
                if (message.includes('Video error details:') && args[1] && typeof args[1] === 'object') {
                    const errorObj = args[1];
                    // Check if it's an empty error object (no code, no message)
                    if (!errorObj.code && !errorObj.message) {
                        return; // Suppress empty video errors
                    }
                }

                originalConsoleError.apply(console, args);
            };

            return () => {
                console.error = originalConsoleError;
            };
        }
    }, []);

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: "#FACC15", // Yellow-400
                        accentColorForeground: "black",
                        borderRadius: "medium",
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
