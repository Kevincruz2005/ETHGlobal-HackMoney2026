/**
 * Hook to read USDC balance on Ethereum Sepolia
 */

import { useReadContract, useAccount } from 'wagmi';
import { formatUnits } from 'viem';

// USDC contract on Ethereum Sepolia
const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const;

const USDC_ABI = [
    {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        type: 'function',
    },
] as const;

export function useUSDCBalance() {
    const { address } = useAccount();

    const { data: balance, isLoading, refetch } = useReadContract({
        address: USDC_SEPOLIA,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // USDC has 6 decimals
    const formattedBalance = balance ? parseFloat(formatUnits(balance, 6)) : 0;

    return {
        balance: formattedBalance,
        rawBalance: balance,
        isLoading,
        refetch,
    };
}
