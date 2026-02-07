# 🎯 Quick Start: Deploy VideoRegistry Contract

## Option 1: Quick Deploy (Recommended for Testing)

I've prepared everything! Just run these commands:

### 1. Install Dependencies:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
```

### 2. Get Your Private Key:
- Open MetaMask
- Click the 3 dots → Account Details → Export Private Key
- **⚠️ NEVER share this key!**

### 3. Add to `.env.local`:
```bash
# Add this line (replace with your actual key):
PRIVATE_KEY=your_private_key_here_without_0x_prefix
```

### 4. Get Base Sepolia ETH:
Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### 5. Create Hardhat Config:
```bash
# Already created hardhat.config.ts for you!
# Just need to run:
npx hardhat compile
```

### 6. Deploy Contract:
```bash
npx hardhat run scripts/deploy-video-registry.ts --network baseSepolia
```

### 7. Copy the Contract Address:
After deployment, you'll see:
```
✅ VideoRegistry deployed to: 0xABCD...
```

### 8. Add Address to `.env.local`:
```bash
NEXT_PUBLIC_VIDEO_REGISTRY_ADDRESS=0xYourContractAddressHere
```

### 9. Restart Dev Server:
```bash
# Ctrl+C to stop
npm run dev
```

## ✅ Done!

Your videos will now be stored on-chain and follow your wallet everywhere!

## Testing:

1. **Upload a video** in Studio page
2. **Check transaction** on https://sepolia.basescan.org
3. **Switch browsers** or devices
4. **Connect same wallet** → Your videos appear!

---

## Option 2: Use Pre-Deployed Contract (Skip Deployment)

If deployment is too complex, I can deploy a shared contract for testing. Let me know!
