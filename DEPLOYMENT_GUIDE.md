# 🚀 VideoRegistry Contract Deployment Guide

This guide walks you through deploying the VideoRegistry smart contract to Base Sepolia testnet.

## Prerequisites

1. **Install Hardhat**:
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Initialize Hardhat** (if not already done):
   ```bash
   npx hardhat init
   ```
   - Choose "Create a TypeScript project"
   - Accept defaults

3. **Get Base Sepolia ETH**:
   - Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - Or: https://faucet.quicknode.com/base/sepolia

## Configuration

### 1. Create `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};

export default config;
```

### 2. Add to `.env.local`:

```bash
# Your wallet private key (KEEP SECRET!)
PRIVATE_KEY=your_private_key_here

# Optional: BaseScan API key for verification
BASESCAN_API_KEY=your_basescan_api_key_here
```

⚠️ **IMPORTANT**: Never commit your `.env.local` file!

## Deployment Steps

### 1. Move Contract to Hardhat Directory:
```bash
mkdir -p contracts
cp contracts/VideoRegistry.sol contracts/VideoRegistry.sol
```

### 2. Compile Contract:
```bash
npx hardhat compile
```

### 3. Deploy to Base Sepolia:
```bash
npx hardhat run scripts/deploy-video-registry.ts --network baseSepolia
```

### 4. Copy Contract Address:
The script will output:
```
✅ VideoRegistry deployed to: 0x1234567890abcdef...
```

### 5. Update `.env.local`:
```bash
NEXT_PUBLIC_VIDEO_REGISTRY_ADDRESS=0x1234567890abcdef...
```

### 6. Verify Contract (Optional but Recommended):
```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

## Testing the Contract

### Using Hardhat Console:
```bash
npx hardhat console --network baseSepolia
```

```javascript
const VideoRegistry = await ethers.getContractFactory("VideoRegistry");
const registry = await VideoRegistry.attach("YOUR_CONTRACT_ADDRESS");

// Test publish video
const tx = await registry.publishVideo(
  "QmTestHash123",
  "Test Video",
  "This is a test",
  "Entertainment",
  ethers.parseEther("0.00001")
);
await tx.wait();

// Get total videos
const total = await registry.getTotalVideos();
console.log("Total videos:", total.toString());
```

## Integration with Frontend

After deployment, your NitroGate app will automatically:
1. ✅ Write videos to blockchain when uploading
2. ✅ Read YOUR videos when wallet connects
3. ✅ Sync across all devices with same wallet

## Troubleshooting

### "Insufficient funds" Error:
- Get more Base Sepolia ETH from faucet
- Check your wallet has testnet ETH

### "Invalid nonce" Error:
- Reset MetaMask nonce: Settings → Advanced → Clear activity tab data

### "Contract not deployed" Error:
- Verify `NEXT_PUBLIC_VIDEO_REGISTRY_ADDRESS` is set correctly
- Check contract is deployed on Base Sepolia (chain ID 84532)

## Contract Functions

### Write Functions (Requires Gas):
- `publishVideo()` - Upload new video metadata
- `unpublishVideo()` - Remove video from public view

### Read Functions (Free):
- `getPublishedVideosByCreator(address)` - Get all videos by a creator
- `getVideo(uint256)` - Get specific video details
- `getTotalVideos()` - Get total number of videos

## Next Steps

Once deployed, test the integration:
1. Go to Studio page
2. Upload a video
3. Check transaction on BaseScan
4. Switch browsers/devices
5. Connect same wallet → See your videos!

🎉 Your videos now follow your wallet everywhere!
