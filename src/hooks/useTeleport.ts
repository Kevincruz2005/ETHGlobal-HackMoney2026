import { useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits, pad, isAddress } from 'viem';

/**
 * useTeleport - Bridge USDC from Base Sepolia to Ethereum Sepolia via Circle CCTP
 * 
 * This hook handles the complete flow:
 * 1. Check USDC allowance for TokenMessenger
 * 2. Approve USDC spending (if needed)
 * 3. Burn USDC on Base Sepolia for minting on Ethereum
 */

// Contract addresses on Base Sepolia
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;
const TOKEN_MESSENGER = '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5' as const;
const ETH_SEPOLIA_DOMAIN = 0; // Circle's domain ID for Ethereum Sepolia

// ABIs
const USDC_ABI = [
    {
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' }
        ],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

const TOKEN_MESSENGER_ABI = [
    {
        inputs: [
            { name: 'amount', type: 'uint256' },
            { name: 'destinationDomain', type: 'uint32' },
            { name: 'mintRecipient', type: 'bytes32' },
            { name: 'burnToken', type: 'address' }
        ],
        name: 'depositForBurn',
        outputs: [{ name: '_nonce', type: 'uint64' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;

export interface UseTeleportReturn {
    teleport: (amount: string, recipient: string) => Promise<void>;
    isApproving: boolean;
    isBurning: boolean;
    error: string | null;
    txHash: string | null;
}

export const useTeleport = (): UseTeleportReturn => {
    const [isApproving, setIsApproving] = useState(false);
    const [isBurning, setIsBurning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { address } = useAccount();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const teleport = useCallback(async (amount: string, recipient: string) => {
        try {
            setError(null);
            setTxHash(null);

            // Validation
            if (!address || !publicClient || !walletClient) {
                throw new Error('Wallet not connected');
            }

            if (!isAddress(recipient)) {
                throw new Error('Invalid recipient address');
            }

            const amountBigInt = parseUnits(amount, 6); // USDC has 6 decimals

            console.log('[useTeleport] Starting bridge:', {
                amount,
                recipient,
                from: address,
            });

            // Step 1: Check current allowance
            const allowance = await publicClient.readContract({
                address: USDC_ADDRESS,
                abi: USDC_ABI,
                functionName: 'allowance',
                args: [address, TOKEN_MESSENGER],
            });

            console.log('[useTeleport] Current allowance:', allowance.toString());

            // Step 2: Approve if needed
            if (allowance < amountBigInt) {
                console.log('[useTeleport] Insufficient allowance, requesting approval...');
                setIsApproving(true);

                const approveTx = await walletClient.writeContract({
                    address: USDC_ADDRESS,
                    abi: USDC_ABI,
                    functionName: 'approve',
                    args: [TOKEN_MESSENGER, amountBigInt],
                });

                console.log('[useTeleport] Approval TX sent:', approveTx);

                await publicClient.waitForTransactionReceipt({ hash: approveTx });
                console.log('[useTeleport] Approval confirmed');
                setIsApproving(false);
            } else {
                console.log('[useTeleport] Sufficient allowance, skipping approval');
            }

            // Step 3: Format recipient to bytes32 using Viem's pad
            const bytes32Recipient = pad(recipient as `0x${string}`, { size: 32 });
            console.log('[useTeleport] Recipient as bytes32:', bytes32Recipient);

            // Step 4: Burn USDC on Base Sepolia
            setIsBurning(true);
            console.log('[useTeleport] Initiating burn...');

            const burnTx = await walletClient.writeContract({
                address: TOKEN_MESSENGER,
                abi: TOKEN_MESSENGER_ABI,
                functionName: 'depositForBurn',
                args: [amountBigInt, ETH_SEPOLIA_DOMAIN, bytes32Recipient, USDC_ADDRESS],
            });

            console.log('[useTeleport] Burn TX sent:', burnTx);

            await publicClient.waitForTransactionReceipt({ hash: burnTx });
            console.log('[useTeleport] Burn confirmed');

            setTxHash(burnTx);
            setIsBurning(false);

            console.log('[useTeleport] ✓ Bridge complete! TX:', burnTx);

        } catch (err: any) {
            console.error('[useTeleport] Error:', err);
            setError(err.message || 'Transfer failed');
            setIsApproving(false);
            setIsBurning(false);
        }
    }, [address, publicClient, walletClient]);

    return {
        teleport,
        isApproving,
        isBurning,
        error,
        txHash,
    };
};
