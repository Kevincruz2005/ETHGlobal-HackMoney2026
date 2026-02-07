/**
 * Hook for interacting with VideoRegistry contract
 * Allows publishing and fetching videos from on-chain storage
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VIDEO_REGISTRY_ABI, VIDEO_REGISTRY_ADDRESS, VIDEO_REGISTRY_CHAIN_ID } from '@/lib/videoRegistryContract';
import { parseEther } from 'viem';

export interface OnChainVideo {
    ipfsHash: string;
    title: string;
    description: string;
    category: string;
    price: bigint;
    creator: string;
    timestamp: bigint;
    isPublished: boolean;
}

export function useVideoRegistry() {
    const { address } = useAccount();
    const { writeContract, data: hash, isPending: isPublishing } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    /**
     * Publish a video on-chain
     */
    const publishVideo = async (
        ipfsHash: string,
        title: string,
        description: string,
        category: string,
        pricePerMinute: string // Price as string (e.g., "0.00001")
    ) => {
        if (!address) {
            throw new Error('Wallet not connected');
        }

        // Convert price to wei (assuming price is in ETH)
        const priceInWei = parseEther(pricePerMinute);

        try {
            await writeContract({
                address: VIDEO_REGISTRY_ADDRESS as `0x${string}`,
                abi: VIDEO_REGISTRY_ABI,
                functionName: 'publishVideo',
                args: [ipfsHash, title, description, category, priceInWei],
                chainId: VIDEO_REGISTRY_CHAIN_ID,
            });

            return { success: true, hash };
        } catch (error) {
            console.error('Error publishing video:', error);
            throw error;
        }
    };

    return {
        publishVideo,
        isPublishing: isPublishing || isConfirming,
        isSuccess,
        transactionHash: hash,
    };
}

/**
 * Hook to fetch videos for a specific creator
 */
export function useCreatorVideos(creatorAddress?: `0x${string}`) {
    const { data: videos, isLoading, refetch } = useReadContract({
        address: VIDEO_REGISTRY_ADDRESS as `0x${string}`,
        abi: VIDEO_REGISTRY_ABI,
        functionName: 'getPublishedVideosByCreator',
        args: creatorAddress ? [creatorAddress] : undefined,
        chainId: VIDEO_REGISTRY_CHAIN_ID,
        query: {
            enabled: !!creatorAddress && creatorAddress !== '0x0000000000000000000000000000000000000000',
        },
    });

    return {
        videos: videos as OnChainVideo[] | undefined,
        isLoading,
        refetch,
    };
}

/**
 * Hook to fetch total video count
 */
export function useTotalVideos() {
    const { data: totalVideos } = useReadContract({
        address: VIDEO_REGISTRY_ADDRESS as `0x${string}`,
        abi: VIDEO_REGISTRY_ABI,
        functionName: 'getTotalVideos',
        chainId: VIDEO_REGISTRY_CHAIN_ID,
    });

    return {
        totalVideos: totalVideos ? Number(totalVideos) : 0,
    };
}
