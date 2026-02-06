import { ethers } from 'ethers';

/**
 * Yellow Network State Channel Client
 * Connects to Yellow Network Sandbox for real-time micropayments
 */

interface SessionConfig {
    counterparty: string;
    initialAmount: string; // In USDC (e.g., "5.0")
}

interface PaymentMessage {
    sessionId: string;
    amount: string;
    recipient: string;
    timestamp: number;
}

export class YellowStreamClient {
    private ws: WebSocket | null = null;
    private signer: ethers.Signer | null = null;
    private sessionId: string | null = null;
    private connected: boolean = false;
    private messageHandlers: Map<string, (data: any) => void> = new Map();

    constructor() {
        // Singleton pattern - only one connection
    }

    /**
     * Initialize connection to Yellow Network Sandbox
     */
    async init(signer: ethers.Signer): Promise<void> {
        this.signer = signer;
        const address = await signer.getAddress();

        return new Promise((resolve, reject) => {
            const wsUrl = process.env.NEXT_PUBLIC_YELLOW_SANDBOX_URL || 'wss://clearnet-sandbox.yellow.com/ws';

            console.log('[Yellow] Connecting to sandbox:', wsUrl);
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = async () => {
                console.log('[Yellow] WebSocket connected');

                try {
                    // Send authentication handshake
                    const timestamp = Date.now();
                    const message = `Yellow Network Auth: ${address} at ${timestamp}`;
                    const signature = await signer.signMessage(message);

                    const authPayload = {
                        jsonrpc: '2.0',
                        method: 'auth',
                        params: {
                            address,
                            message,
                            signature,
                            timestamp
                        },
                        id: 1
                    };

                    this.ws?.send(JSON.stringify(authPayload));
                    this.connected = true;
                    console.log('[Yellow] Authentication sent');
                    resolve();
                } catch (error) {
                    console.error('[Yellow] Auth error:', error);
                    reject(error);
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('[Yellow] Received:', data);

                    // Handle different message types
                    if (data.method) {
                        const handler = this.messageHandlers.get(data.method);
                        if (handler) {
                            handler(data.params);
                        }
                    }

                    // Handle RPC responses
                    if (data.result && data.id) {
                        const handler = this.messageHandlers.get(`response_${data.id}`);
                        if (handler) {
                            handler(data.result);
                            this.messageHandlers.delete(`response_${data.id}`);
                        }
                    }
                } catch (error) {
                    console.error('[Yellow] Message parse error:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('[Yellow] WebSocket error:', error);
                reject(error);
            };

            this.ws.onclose = () => {
                console.log('[Yellow] WebSocket closed');
                this.connected = false;
            };

            // Timeout after 10 seconds
            setTimeout(() => {
                if (!this.connected) {
                    reject(new Error('Connection timeout'));
                }
            }, 10000);
        });
    }

    /**
     * Create a new payment session (state channel)
     */
    async createSession(config: SessionConfig): Promise<string> {
        if (!this.ws || !this.signer) {
            throw new Error('Client not initialized');
        }

        const address = await this.signer.getAddress();
        const amountWei = ethers.parseUnits(config.initialAmount, 6); // USDC has 6 decimals

        return new Promise((resolve, reject) => {
            const id = Date.now();

            const sessionPayload = {
                jsonrpc: '2.0',
                method: 'createSession',
                params: {
                    protocol: 'nitrogate-stream-v1',
                    participants: [address, config.counterparty],
                    allocations: {
                        [address]: amountWei.toString(),
                        [config.counterparty]: '0'
                    },
                    challengePeriod: 300 // 5 minutes
                },
                id
            };

            // Set response handler
            this.messageHandlers.set(`response_${id}`, (result: any) => {
                this.sessionId = result.sessionId || `session_${Date.now()}`;
                console.log('[Yellow] Session created:', this.sessionId);
                resolve(this.sessionId);
            });

            this.ws?.send(JSON.stringify(sessionPayload));
            console.log('[Yellow] Creating session...');

            // Timeout after 30 seconds
            setTimeout(() => {
                if (!this.sessionId) {
                    reject(new Error('Session creation timeout'));
                }
            }, 30000);
        });
    }

    /**
     * Send a micropayment through the state channel
     */
    async sendPayment(amount: string, recipient: string): Promise<any> {
        if (!this.ws || !this.signer || !this.sessionId) {
            throw new Error('No active session');
        }

        const address = await this.signer.getAddress();
        const amountWei = ethers.parseUnits(amount, 6);

        return new Promise((resolve, reject) => {
            const id = Date.now();

            const paymentPayload = {
                jsonrpc: '2.0',
                method: 'sendPayment',
                params: {
                    sessionId: this.sessionId,
                    from: address,
                    to: recipient,
                    amount: amountWei.toString(),
                    timestamp: Date.now()
                },
                id
            };

            // Set response handler
            this.messageHandlers.set(`response_${id}`, (result: any) => {
                console.log('[Yellow] Payment sent:', result);
                resolve(result);
            });

            this.ws?.send(JSON.stringify(paymentPayload));

            // Timeout after 5 seconds
            setTimeout(() => {
                this.messageHandlers.delete(`response_${id}`);
                // Don't reject - payments can be async
                resolve({ status: 'pending' });
            }, 5000);
        });
    }

    /**
     * Close the payment session and settle on-chain
     */
    async closeSession(): Promise<void> {
        if (!this.ws || !this.sessionId) {
            return;
        }

        const closePayload = {
            jsonrpc: '2.0',
            method: 'closeSession',
            params: {
                sessionId: this.sessionId
            },
            id: Date.now()
        };

        this.ws.send(JSON.stringify(closePayload));
        console.log('[Yellow] Closing session...');

        this.sessionId = null;
    }

    /**
     * Subscribe to incoming messages
     */
    onMessage(eventType: string, handler: (data: any) => void): void {
        this.messageHandlers.set(eventType, handler);
    }

    /**
     * Disconnect from Yellow Network
     */
    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.sessionId = null;
        this.connected = false;
        this.messageHandlers.clear();
    }

    /**
     * Check if client is connected and has active session
     */
    isActive(): boolean {
        return this.connected && this.sessionId !== null;
    }

    /**
     * Get current session ID
     */
    getSessionId(): string | null {
        return this.sessionId;
    }
}

// Singleton instance
let yellowClientInstance: YellowStreamClient | null = null;

export function getYellowClient(): YellowStreamClient {
    if (!yellowClientInstance) {
        yellowClientInstance = new YellowStreamClient();
    }
    return yellowClientInstance;
}
