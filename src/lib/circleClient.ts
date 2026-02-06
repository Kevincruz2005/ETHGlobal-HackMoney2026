import { ethers } from 'ethers';

/**
 * Circle CCTP (Cross-Chain Transfer Protocol) Client
 * Handles burn-and-mint USDC transfers from Base Sepolia to Arc Testnet
 */

// Contract addresses on Base Sepolia
const USDC_BASE_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const TOKEN_MESSENGER_BASE = '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5';
const MESSAGE_TRANSMITTER_BASE = '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD';

// Arc Testnet domain (Circle's identifier for Arc)
const ARC_DOMAIN_ID = 7; // This is a placeholder - check Circle docs for actual Arc domain

// Contract ABIs
const USDC_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)',
];

const TOKEN_MESSENGER_ABI = [
    'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken) external returns (uint64)',
];

const MESSAGE_TRANSMITTER_ABI = [
    'function receiveMessage(bytes message, bytes attestation) external returns (bool)',
];

export interface BridgeTransfer {
    burnTxHash: string;
    messageHash: string;
    attestation?: string;
    status: 'approving' | 'burning' | 'attesting' | 'ready_to_mint' | 'complete' | 'failed';
    amount: string;
}

export class CircleBridgeClient {
    private provider: ethers.BrowserProvider;
    private signer: ethers.Signer | null = null;
    private apiKey: string;

    constructor(provider: ethers.BrowserProvider) {
        this.provider = provider;
        this.apiKey = process.env.NEXT_PUBLIC_CIRCLE_API_KEY || '';

        if (!this.apiKey) {
            console.warn('[Circle] No API key found in environment');
        }
    }

    /**
     * Initialize signer from connected wallet
     */
    async init(): Promise<void> {
        this.signer = await this.provider.getSigner();
        const address = await this.signer.getAddress();
        console.log('[Circle] Initialized for address:', address);
    }

    /**
     * Get USDC balance on Base Sepolia
     */
    async getBalance(): Promise<string> {
        if (!this.signer) {
            throw new Error('Client not initialized');
        }

        const usdcContract = new ethers.Contract(
            USDC_BASE_SEPOLIA,
            USDC_ABI,
            this.signer
        );

        const address = await this.signer.getAddress();
        const balance = await usdcContract.balanceOf(address);

        return ethers.formatUnits(balance, 6); // USDC has 6 decimals
    }

    /**
     * Step 1: Approve USDC spending
     */
    async approveUSDC(amount: string): Promise<string> {
        if (!this.signer) {
            throw new Error('Client not initialized');
        }

        console.log('[Circle] Approving USDC...', amount);

        const usdcContract = new ethers.Contract(
            USDC_BASE_SEPOLIA,
            USDC_ABI,
            this.signer
        );

        const amountWei = ethers.parseUnits(amount, 6);
        const tx = await usdcContract.approve(TOKEN_MESSENGER_BASE, amountWei);

        console.log('[Circle] Approval tx:', tx.hash);
        const receipt = await tx.wait();

        return receipt.hash;
    }

    /**
     * Step 2: Burn USDC on Base Sepolia
     */
    async burnUSDC(amount: string, recipientAddress: string): Promise<{ txHash: string; messageHash: string }> {
        if (!this.signer) {
            throw new Error('Client not initialized');
        }

        console.log('[Circle] Burning USDC...', amount);

        const tokenMessenger = new ethers.Contract(
            TOKEN_MESSENGER_BASE,
            TOKEN_MESSENGER_ABI,
            this.signer
        );

        const amountWei = ethers.parseUnits(amount, 6);

        // Convert recipient address to bytes32
        const mintRecipient = ethers.zeroPadValue(recipientAddress, 32);

        const tx = await tokenMessenger.depositForBurn(
            amountWei,
            ARC_DOMAIN_ID,
            mintRecipient,
            USDC_BASE_SEPOLIA
        );

        console.log('[Circle] Burn tx:', tx.hash);
        const receipt = await tx.wait();

        // Extract message hash from logs
        // The MessageSent event should contain the message hash
        let messageHash = '';
        for (const log of receipt.logs) {
            if (log.topics[0]) {
                // This is a simplified approach - in production, decode the event properly
                messageHash = log.topics[1] || '';
                if (messageHash) break;
            }
        }

        if (!messageHash) {
            // Fallback: use transaction hash as message identifier
            messageHash = tx.hash;
        }

        return {
            txHash: receipt.hash,
            messageHash
        };
    }

    /**
     * Step 3: Get attestation from Circle API
     */
    async getAttestation(messageHash: string): Promise<string> {
        console.log('[Circle] Fetching attestation for:', messageHash);

        const maxRetries = 60; // 2 minutes with 2s intervals
        const retryDelay = 2000;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(
                    `https://iris-api-sandbox.circle.com/v1/attestations/${messageHash}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                        }
                    }
                );

                if (!response.ok) {
                    console.warn('[Circle] Attestation API error:', response.status);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                }

                const data = await response.json();
                console.log('[Circle] Attestation response:', data);

                if (data.attestation && data.status === 'complete') {
                    console.log('[Circle] Attestation received!');
                    return data.attestation;
                }

                // Still pending
                console.log(`[Circle] Attestation pending... (${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));

            } catch (error) {
                console.error('[Circle] Attestation fetch error:', error);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }

        throw new Error('Attestation timeout - please try again later');
    }

    /**
     * Complete bridge transfer: approve + burn + get attestation
     */
    async bridgeToArc(amount: string, recipientAddress: string, onProgress?: (status: string) => void): Promise<BridgeTransfer> {
        try {
            // Step 1: Approve
            onProgress?.('approving');
            await this.approveUSDC(amount);

            // Step 2: Burn
            onProgress?.('burning');
            const { txHash, messageHash } = await this.burnUSDC(amount, recipientAddress);

            // Step 3: Get attestation
            onProgress?.('attesting');
            const attestation = await this.getAttestation(messageHash);

            onProgress?.('ready_to_mint');

            return {
                burnTxHash: txHash,
                messageHash,
                attestation,
                status: 'ready_to_mint',
                amount
            };

        } catch (error) {
            console.error('[Circle] Bridge error:', error);
            throw error;
        }
    }

    /**
     * Check if user has approved sufficient USDC
     */
    async checkAllowance(amount: string): Promise<boolean> {
        if (!this.signer) {
            throw new Error('Client not initialized');
        }

        const usdcContract = new ethers.Contract(
            USDC_BASE_SEPOLIA,
            USDC_ABI,
            this.signer
        );

        const address = await this.signer.getAddress();
        const allowance = await usdcContract.allowance(address, TOKEN_MESSENGER_BASE);
        const amountWei = ethers.parseUnits(amount, 6);

        return allowance >= amountWei;
    }
}

// Factory function
export function createCircleBridgeClient(provider: ethers.BrowserProvider): CircleBridgeClient {
    return new CircleBridgeClient(provider);
}
