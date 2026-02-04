# NitroGate

> **The Netflix of Web3** — Pay per second, not per month.


---

## 🎬 What is NitroGate?

NitroGate is an **omnichain video streaming platform** where money flows from viewer to creator in real-time. Watch for 10 seconds, pay for 10 seconds. Stop watching, stop paying.


## ✨ Key Features

- **Pay-Per-Second**: Deduct 0.0001 USDC every second from your state channel.
- **Matrix Log**: Real-time visualization of off-chain signatures.
- **Smart Top-Up**: Auto-bridge funds from any chain when balance is low.
- **ENS Profiles**: Display creator avatars, names, and bios.
- **Agent Mode**: JSON API stream for AI agents to consume content.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/nitrogate.git
cd nitrogate

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💰 Pricing Model

| Duration | Cost (USDC) | Transactions |
|----------|-------------|--------------|
| 1 second | $0.0001 | 1 state update |
| 1 minute | $0.006 | 60 state updates |
| 1 hour | $0.36 | 3,600 state updates |
| Movie (2hr) | $0.72 | 7,200 state updates |

> All transactions happen **off-chain** via Yellow Network state channels. Only 2 on-chain transactions: **Open Channel** and **Close Channel**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Components | Shadcn UI, Framer Motion |
| Wallet | RainbowKit, Wagmi v2, Viem |
| State Channels | Yellow Network (Nitrolite) |
| Bridging | LI.FI Widget |
| Identity | ENS (Ethereum Name Service) |

---

## 📁 Project Structure

```
nitrogate/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main dashboard
│   │   └── layout.tsx        # Root layout + Web3Provider
│   ├── components/
│   │   ├── VideoPlayer.tsx   # Video with lock overlay
│   │   ├── MatrixLog.tsx     # Terminal-style log viewer
│   │   ├── SmartTopUp.tsx    # LI.FI bridge modal
│   │   ├── CreatorProfile.tsx # ENS-powered profile
│   │   ├── AgentView.tsx     # JSON API for AI
│   │   └── Header.tsx        # Connect button
│   ├── hooks/
│   │   └── useStreamSession.ts # State channel simulation
│   └── providers/
│       └── Web3Provider.tsx  # Wagmi + RainbowKit config
```

---

