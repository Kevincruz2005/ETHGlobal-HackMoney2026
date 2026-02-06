// Mock user data for Circle Gateway demo
export const mockUser = {
    name: 'kevincruz.eth',
    avatar: 'https://euc.li/kevincruz.eth', // ENS avatar URL
    address: '0x4184bb731b3ed0e22eDC425901510A65a4f4aFA2' as `0x${string}`,
};

// Initial balances
export const initialBalances = {
    externalBalance: 154.20, // Base Sepolia Wallet
    arcBalance: 0.00,         // Circle Arc Wallet
};

// Mock transaction history
export const mockTransactions = [
    {
        id: '1',
        type: 'deposit' as const,
        amount: 50.00,
        from: 'Base Sepolia',
        to: 'Circle Arc',
        timestamp: new Date('2026-02-05T18:30:00'),
        txHash: '0x8a3f2b1c...',
    },
    {
        id: '2',
        type: 'stream' as const,
        amount: -0.0045,
        movie: 'Big Buck Bunny',
        timestamp: new Date('2026-02-05T19:15:00'),
        txHash: '0x7b2e1a9d...',
    },
    {
        id: '3',
        type: 'deposit' as const,
        amount: 100.00,
        from: 'Arbitrum',
        to: 'Circle Arc',
        timestamp: new Date('2026-02-04T14:22:00'),
        txHash: '0x6c1d0b8e...',
    },
];
