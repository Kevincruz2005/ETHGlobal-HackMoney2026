"use client";

import VideoPlayer from "@/components/VideoPlayer";
import MatrixLog from "@/components/MatrixLog";
import SmartTopUp from "@/components/SmartTopUp";
import CreatorProfile from "@/components/CreatorProfile";
import AgentView from "@/components/AgentView";
import { useStreamSession } from "@/hooks/useStreamSession";
import { useNitroCreatorMetadata } from "@/hooks/useNitroCreatorMetadata";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { Monitor, Bot } from "lucide-react";
import { useAccount, useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";

// Vitalik's address for demo ENS resolution
const DEMO_CREATOR_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as const;

export default function Home() {
  const {
    balance,
    logs,
    isPlaying,
    startSession,
    stopSession,
    topUp,
    resetBalance,
    totalPaid,
    ratePerSecond,
    tickMs,
    minBalance,
    autopilotEnabled,
    refillStatus,
    hasSeasonPass,
    setTickMs,
    setMinBalance,
    setAutopilotEnabled,
    setRefillStatus,
    setRatePerSecond,
    validateSeasonPass,
  } = useStreamSession();
  const creatorMetadata = useNitroCreatorMetadata(DEMO_CREATOR_ADDRESS);
  const { address: buyerAddress } = useAccount();
  const { data: buyerEnsName } = useEnsName({
    address: buyerAddress,
    chainId: mainnet.id,
    query: { enabled: Boolean(buyerAddress) },
  });
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"Human" | "Agent">("Human");

  // ENS-driven dynamic rate (no on-chain writes)
  useEffect(() => {
    if (typeof creatorMetadata.saleRate === "number") {
      setRatePerSecond(creatorMetadata.saleRate);
    } else {
      setRatePerSecond(0.0001);
    }
  }, [creatorMetadata.saleRate, setRatePerSecond]);

  // Validate season pass when buyer ENS and creator metadata are available
  useEffect(() => {
    validateSeasonPass(buyerEnsName || undefined, creatorMetadata.seasonPassDomain);
  }, [buyerEnsName, creatorMetadata.seasonPassDomain, validateSeasonPass]);

  const buyerLabel = useMemo(() => {
    if (buyerEnsName) return buyerEnsName;
    if (!buyerAddress) return undefined;
    return `${buyerAddress.slice(0, 6)}...${buyerAddress.slice(-4)}`;
  }, [buyerAddress, buyerEnsName]);

  const sellerLabel = useMemo(() => {
    if (creatorMetadata.ensName) return creatorMetadata.ensName;
    return `${DEMO_CREATOR_ADDRESS.slice(0, 6)}...${DEMO_CREATOR_ADDRESS.slice(-4)}`;
  }, [creatorMetadata.ensName]);

  // Autopilot: prompt top-up when balance drops below user-defined minimum (skip for season pass holders)
  useEffect(() => {
    if (!isPlaying) return;
    if (!autopilotEnabled) return;
    if (hasSeasonPass) return; // Season pass holders don't need top-ups
    if (balance <= 0) return;
    if (balance < minBalance && refillStatus === "idle") {
      // Defer state updates to avoid synchronous setState-in-effect lint errors
      setTimeout(() => {
        setRefillStatus("prompting");
        setIsTopUpOpen(true);
      }, 0);
    }
  }, [autopilotEnabled, balance, isPlaying, minBalance, refillStatus, setRefillStatus, hasSeasonPass]);

  const simulationSpeedLabel = useMemo(() => {
    if (tickMs <= 100) return "HFT (100ms)";
    if (tickMs <= 250) return "FAST (250ms)";
    return "NORMAL (1000ms)";
  }, [tickMs]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <SmartTopUp
        isOpen={isTopUpOpen}
        onClose={() => {
          setIsTopUpOpen(false);
          // If user closes without crediting, keep autopilot armed but return to idle
          setTimeout(() => setRefillStatus("idle"), 0);
        }}
        onSimulateCredit={(amount) => {
          topUp(amount);
          setRefillStatus("credited");
          setTimeout(() => setRefillStatus("idle"), 800);
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
        {/* Main Content: Video + Controls */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {viewMode === "Human" ? (
            <>
              <div className="relative w-full shadow-[0_0_40px_-10px_rgba(250,204,21,0.15)] rounded-xl">
                <VideoPlayer isUnlocked={balance > 0} isPlaying={isPlaying} />

                {/* Overlay Badge for "Yellow Network" */}
                {isPlaying && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/30">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-yellow-400 tracking-wider">NITROLITE::CHANNEL_OPEN</span>
                  </div>
                )}
              </div>

              {/* Creator Profile */}
              <CreatorProfile address={DEMO_CREATOR_ADDRESS} metadata={creatorMetadata} />
            </>
          ) : (
            <AgentView
              balance={balance}
              isPlaying={isPlaying}
              totalPaid={totalPaid}
              logs={logs}
              creatorAddress={DEMO_CREATOR_ADDRESS}
              buyerLabel={buyerLabel}
              sellerLabel={sellerLabel}
              ratePerSecond={ratePerSecond}
              tickMs={tickMs}
            />
          )}

          {/* Stream Controls */}
          <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 backdrop-blur-sm shadow-sm ring-1 ring-white/5 transition-all hover:border-zinc-700">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={() => setViewMode("Human")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "Human"
                    ? "bg-yellow-400 text-black"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                )}
                title="Human View"
              >
                <Monitor size={16} />
              </button>
              <button
                onClick={() => setViewMode("Agent")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "Agent"
                    ? "bg-cyan-400 text-black"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                )}
                title="Agent View (JSON API)"
              >
                <Bot size={16} />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Stream Status</p>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-colors",
                    isPlaying ? "bg-red-500 animate-pulse" : "bg-zinc-600"
                  )} />
                  <span className="font-bold text-white text-sm tracking-wide">
                    {isPlaying ? "LIVE FEED" : "OFFLINE"}
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-zinc-800" />

              <div className="flex flex-col">
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Autopilot</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const next = !autopilotEnabled;
                      setAutopilotEnabled(next);
                      setRefillStatus("idle");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border transition-colors",
                      autopilotEnabled
                        ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                    )}
                    title="Intent-based Balance Guard (testnet/sim-safe)"
                  >
                    {autopilotEnabled ? "ON" : "OFF"}
                  </button>
                  {hasSeasonPass && (
                    <span className="px-2 py-1 text-[9px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-400/30 rounded-full font-bold">
                      SEASON PASS
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500">Min</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={minBalance}
                      onChange={(e) => setMinBalance(Number(e.target.value || 0))}
                      disabled={hasSeasonPass}
                      className={cn(
                        "w-16 px-2 py-1 rounded-md bg-zinc-950/60 border text-zinc-200 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-yellow-400/40",
                        hasSeasonPass ? "border-zinc-800 opacity-50 cursor-not-allowed" : "border-zinc-800"
                      )}
                    />
                    <span className="text-[10px] text-zinc-600">USDC</span>
                  </div>
                </div>
                {autopilotEnabled && (
                  <p className="text-[10px] text-zinc-600 mt-1">
                    {hasSeasonPass 
                      ? "Season pass active: unlimited viewing"
                      : refillStatus === "prompting" 
                        ? "Refill intent: prompting" 
                        : refillStatus === "credited" 
                          ? "Refill: credited" 
                          : "Guard active"
                    }
                  </p>
                )}
              </div>

              <div className="h-8 w-px bg-zinc-800" />

              <div className="flex flex-col">
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Engine Speed</p>
                <button
                  onClick={() => setTickMs(tickMs === 1000 ? 250 : tickMs === 250 ? 100 : 1000)}
                  className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold border border-zinc-700 transition-colors"
                  title="High-speed state updates (simulation)"
                >
                  {simulationSpeedLabel}
                </button>
              </div>

              <div className="flex flex-col">
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">State Channel Balance</p>
                <div className="flex items-center gap-2">
                  <span className={cn("font-mono text-xl font-bold tracking-tight transition-colors",
                    hasSeasonPass ? "text-gradient bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" :
                    balance < 0.5 ? "text-red-400" : "text-white"
                  )}>
                    {hasSeasonPass ? "∞" : `$${balance.toFixed(4)}`} 
                    <span className="text-sm text-zinc-600 font-normal ml-1">
                      {hasSeasonPass ? "FREE" : "USDC"}
                    </span>
                  </span>
                  {hasSeasonPass && (
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <button
                  onClick={startSession}
                  className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-all uppercase tracking-tight text-sm shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_20px_rgba(250,204,21,0.5)] active:scale-95"
                >
                  Start Stream
                </button>
              ) : (
                <button
                  onClick={stopSession}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-all uppercase tracking-tight text-sm border border-zinc-700 active:scale-95"
                >
                  Stop Stream
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Logs / Chat */}
        <div className="lg:col-span-1 bg-black rounded-xl border border-zinc-800 backdrop-blur-sm flex flex-col overflow-hidden h-full ring-1 ring-white/5 shadow-2xl">
          <div className="p-3 border-b border-zinc-900 bg-zinc-950 flex justify-between items-center">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Yellow Network Logs</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <MatrixLog 
              logs={logs} 
              buyerLabel={buyerLabel} 
              sellerLabel={sellerLabel}
              buyerEnsName={buyerEnsName || undefined}
              sellerEnsName={creatorMetadata.ensName || undefined}
            />
          </div>

          {/* Enhanced Demo Controls */}
          <div className="p-3 border-t border-zinc-900 bg-zinc-950">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-wider">Simulation Controls</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => topUp(5.0000)}
                className="flex-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-mono rounded transition-colors border border-zinc-700 hover:border-yellow-400/30"
                title="Simulate bridge credit: Add +5 USDC (Demo Mode)"
              >
                +5 USDC
              </button>
              <button
                onClick={() => topUp(1.0000)}
                className="flex-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-mono rounded transition-colors border border-zinc-700 hover:border-cyan-400/30"
                title="Simulate small top-up: Add +1 USDC"
              >
                +1 USDC
              </button>
              <button
                onClick={resetBalance}
                className="flex-1 px-2 py-1 bg-zinc-800 hover:bg-red-900/20 text-red-400 text-[9px] font-mono rounded transition-colors border border-zinc-700 hover:border-red-400/30"
                title="Reset balance to 0 (Test low balance)"
              >
                RESET
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
