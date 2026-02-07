/**
 * Video Registry Contract Configuration
 * Stores video metadata on Base Sepolia testnet
 */

export const VIDEO_REGISTRY_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "_ipfsHash", "type": "string" },
            { "internalType": "string", "name": "_title", "type": "string" },
            { "internalType": "string", "name": "_description", "type": "string" },
            { "internalType": "string", "name": "_category", "type": "string" },
            { "internalType": "uint256", "name": "_price", "type": "uint256" }
        ],
        "name": "publishVideo",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_videoId", "type": "uint256" }],
        "name": "unpublishVideo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "_creator", "type": "address" }],
        "name": "getCreatorVideos",
        "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_videoId", "type": "uint256" }],
        "name": "getVideo",
        "outputs": [
            {
                "components": [
                    { "internalType": "string", "name": "ipfsHash", "type": "string" },
                    { "internalType": "string", "name": "title", "type": "string" },
                    { "internalType": "string", "name": "description", "type": "string" },
                    { "internalType": "string", "name": "category", "type": "string" },
                    { "internalType": "uint256", "name": "price", "type": "uint256" },
                    { "internalType": "address", "name": "creator", "type": "address" },
                    { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                    { "internalType": "bool", "name": "isPublished", "type": "bool" }
                ],
                "internalType": "struct VideoRegistry.Video",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "_creator", "type": "address" }],
        "name": "getPublishedVideosByCreator",
        "outputs": [
            {
                "components": [
                    { "internalType": "string", "name": "ipfsHash", "type": "string" },
                    { "internalType": "string", "name": "title", "type": "string" },
                    { "internalType": "string", "name": "description", "type": "string" },
                    { "internalType": "string", "name": "category", "type": "string" },
                    { "internalType": "uint256", "name": "price", "type": "uint256" },
                    { "internalType": "address", "name": "creator", "type": "address" },
                    { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                    { "internalType": "bool", "name": "isPublished", "type": "bool" }
                ],
                "internalType": "struct VideoRegistry.Video[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalVideos",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "videoId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string" },
            { "indexed": false, "internalType": "string", "name": "title", "type": "string" }
        ],
        "name": "VideoPublished",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "videoId", "type": "uint256" }
        ],
        "name": "VideoUnpublished",
        "type": "event"
    }
] as const;

// Shared test contract for NitroGate demo (Ethereum Sepolia)
// This is a shared contract for testing - videos will be public
export const VIDEO_REGISTRY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // PLACEHOLDER - will work once deployed

export const VIDEO_REGISTRY_CHAIN_ID = 11155111; // Ethereum Sepolia
