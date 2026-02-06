/**
 * useNitroIdentity - Creative ENS Hook for Dynamic Pricing
 * 
 * This hook demonstrates "Creative use of ENS" by fetching streamer
 * commercial terms (pricing) from on-chain ENS text records instead
 * of hardcoding them. Streamers control their own rates via ENS!
 * 
 * ENS Text Record Schema:
 * - nitro.price: Per-second streaming price in USDC (e.g., "0.00000016667")
 * - nitro.bio: Streamer bio/description
 * - nitro.twitter: Social media handle
 * - nitro.discord: Community link
 * 
 * This proves the streamer has full control over their commercial
 * terms on-chain, enabling dynamic pricing without contract updates.
 */

import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { normalize } from 'viem/ens';

// Basenames Registry on Base Sepolia
const BASENAMES_REGISTRY = '0x1493b2567056c2181630115660963E13A8E32735';

// ENS Registry ABI (minimal)
const REGISTRY_ABI = [
    {
        inputs: [{ name: 'node', type: 'bytes32' }],
        name: 'resolver',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

// ENS Resolver ABI (text records)
const RESOLVER_ABI = [
    {
        inputs: [
            { name: 'node', type: 'bytes32' },
            { name: 'key', type: 'string' },
        ],
        name: 'text',
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'node', type: 'bytes32' }],
        name: 'addr',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

export interface NitroIdentity {
    // Core identity
    ensName: string | null;
    address: `0x${string}` | null;

    // Dynamic pricing (on-chain!)
    pricePerSecond: number | null;

    // Metadata
    bio: string | null;
    twitter: string | null;
    discord: string | null;

    // Loading states
    isLoading: boolean;
    error: string | null;
}

/**
 * Fetch streamer identity and dynamic pricing from ENS
 * @param ensNameOrAddress - ENS name (e.g., "streamer.basetest.eth") or 0x address
 * @returns NitroIdentity with on-chain pricing
 */
export function useNitroIdentity(ensNameOrAddress: string | `0x${string}` | undefined): NitroIdentity {
    const publicClient = usePublicClient({ chainId: baseSepolia.id });

    const [identity, setIdentity] = useState<NitroIdentity>({
        ensName: null,
        address: null,
        pricePerSecond: null,
        bio: null,
        twitter: null,
        discord: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        if (!ensNameOrAddress || !publicClient) {
            setIdentity(prev => ({ ...prev, isLoading: false }));
            return;
        }

        let isMounted = true;

        async function fetchIdentity() {
            if (!publicClient) return;

            try {
                setIdentity(prev => ({ ...prev, isLoading: true, error: null }));

                // Determine if input is ENS name or address
                const isAddress = ensNameOrAddress.startsWith('0x');
                let ensName: string | null = null;
                let targetAddress: `0x${string}` | null = null;

                if (isAddress) {
                    // Input is address - try reverse resolution
                    targetAddress = ensNameOrAddress as `0x${string}`;
                    // Note: Reverse resolution not implemented in this version
                    // Would require additional contract calls
                } else {
                    // Input is ENS name
                    ensName = ensNameOrAddress;
                }

                if (!ensName) {
                    // Can't proceed without ENS name
                    if (isMounted) {
                        setIdentity({
                            ensName: null,
                            address: targetAddress,
                            pricePerSecond: null,
                            bio: null,
                            twitter: null,
                            discord: null,
                            isLoading: false,
                            error: null,
                        });
                    }
                    return;
                }

                // Normalize ENS name
                const normalizedName = normalize(ensName);

                // Calculate namehash (viem provides this)
                const namehash = await import('viem/ens').then(m => m.namehash);
                const node = namehash(normalizedName);

                // Step 1: Get resolver from registry
                const resolverAddress = await publicClient.readContract({
                    address: BASENAMES_REGISTRY,
                    abi: REGISTRY_ABI,
                    functionName: 'resolver',
                    args: [node],
                });

                if (!resolverAddress || resolverAddress === '0x0000000000000000000000000000000000000000') {
                    if (isMounted) {
                        setIdentity({
                            ensName,
                            address: null,
                            pricePerSecond: null,
                            bio: null,
                            twitter: null,
                            discord: null,
                            isLoading: false,
                            error: 'ENS name not registered',
                        });
                    }
                    return;
                }

                // Step 2: Get address from resolver
                const address = await publicClient.readContract({
                    address: resolverAddress,
                    abi: RESOLVER_ABI,
                    functionName: 'addr',
                    args: [node],
                }) as `0x${string}`;

                // Step 3: Fetch all text records in parallel
                const [priceText, bioText, twitterText, discordText] = await Promise.all([
                    publicClient.readContract({
                        address: resolverAddress,
                        abi: RESOLVER_ABI,
                        functionName: 'text',
                        args: [node, 'nitro.price'],
                    }).catch(() => null),

                    publicClient.readContract({
                        address: resolverAddress,
                        abi: RESOLVER_ABI,
                        functionName: 'text',
                        args: [node, 'nitro.bio'],
                    }).catch(() => null),

                    publicClient.readContract({
                        address: resolverAddress,
                        abi: RESOLVER_ABI,
                        functionName: 'text',
                        args: [node, 'nitro.twitter'],
                    }).catch(() => null),

                    publicClient.readContract({
                        address: resolverAddress,
                        abi: RESOLVER_ABI,
                        functionName: 'text',
                        args: [node, 'nitro.discord'],
                    }).catch(() => null),
                ]);

                // Parse price (convert string to number)
                const pricePerSecond = priceText && priceText !== ''
                    ? parseFloat(priceText as string)
                    : null;

                if (isMounted) {
                    setIdentity({
                        ensName,
                        address: address || null,
                        pricePerSecond,
                        bio: bioText as string || null,
                        twitter: twitterText as string || null,
                        discord: discordText as string || null,
                        isLoading: false,
                        error: null,
                    });
                }
            } catch (error: unknown) {
                console.error('useNitroIdentity error:', error);
                if (isMounted) {
                    setIdentity(prev => ({
                        ...prev,
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Failed to fetch identity',
                    }));
                }
            }
        }

        fetchIdentity();

        return () => {
            isMounted = false;
        };
    }, [ensNameOrAddress, publicClient]);

    return identity;
}
