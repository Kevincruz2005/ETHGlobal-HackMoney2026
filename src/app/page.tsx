"use client";

import VideoPlayer from "@/components/VideoPlayer";
import VideoSearch from "@/components/VideoSearch";
import VaultDashboard from "@/components/VaultDashboard";
import CinemaControls from "@/components/CinemaControls";
import NetworkMatrix from "@/components/NetworkMatrix";
import SmartTopUp from "@/components/SmartTopUp";
import { useStreamSession } from "@/hooks/useStreamSession";
import { useNitroCreatorMetadata } from "@/hooks/useNitroCreatorMetadata";
import { useState, useEffect } from "react";
import { useAccount, useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";

// Demo creator address
const DEMO_CREATOR_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';

export default function Home() {
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [currentVideoTitle, setCurrentVideoTitle] = useState("");
  const [currentVideoType, setCurrentVideoType] = useState<'hls' | 'mp4'>('mp4');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const {
    balance,
    logs,
    isPlaying,
    startSession,
    stopSession,
    topUp,
    totalPaid,
    ratePerSecond,
    hasSeasonPass,
    watchedSegments,
    selectedQuality,
    setSelectedQuality,
    validateSeasonPass,
    onVideoTick,
    getTotalWatchedSeconds,
    getEffectiveRate,
    refillStatus,
    setRefillStatus,
    autopilotEnabled,
    minBalance,
    setRatePerSecond
  } = useStreamSession();

  const creatorMetadata = useNitroCreatorMetadata(DEMO_CREATOR_ADDRESS);
  const { address: buyerAddress } = useAccount();
  const { data: buyerEnsName } = useEnsName({
    address: buyerAddress,
    chainId: mainnet.id,
  });

  // Validate season pass
  useEffect(() => {
    if (buyerEnsName && creatorMetadata?.seasonPassDomain) {
      validateSeasonPass(buyerEnsName, creatorMetadata.seasonPassDomain);
    }
  }, [buyerEnsName, creatorMetadata?.seasonPassDomain, validateSeasonPass]);

  // Enhancement 1: Omnichain Autopilot - Auto-open top-up when low balance
  useEffect(() => {
    if (refillStatus === 'prompting' && !isTopUpOpen) {
      setIsTopUpOpen(true);
    }
  }, [refillStatus, isTopUpOpen]);

  // Enhancement 2: ENS Dynamic Metadata - Apply creator's sale rate if available
  useEffect(() => {
    if (creatorMetadata?.saleRate !== undefined) {
      setRatePerSecond(creatorMetadata.saleRate);
    }
  }, [creatorMetadata?.saleRate, setRatePerSecond]);

  const handleTip = () => {
    topUp(-1); // Deduct 1 USDC as a tip
  };

  return (
    <div className="min-h-screen bg-[#050505] p-6">
      {/* Header */}
      <header className="mb-6 space-y-4">
        {/* Top Row: Logo and ENS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">N</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">NitroGate DeFi</h1>
          </div>

          {/* ENS Display */}
          {buyerEnsName && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-white/5 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <span className="text-indigo-400 text-xs">👤</span>
              </div>
              <span className="text-indigo-400 text-sm font-medium">{buyerEnsName}</span>
            </div>
          )}
        </div>

        {/* Centered Search Bar */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <VideoSearch
              onVideoSelect={(url, title, type) => {
                setCurrentVideoUrl(url);
                setCurrentVideoTitle(title);
                setCurrentVideoType(type);
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Layout - Full width video */}
      <div className="space-y-4">
        {/* Cinema Video Player */}
        <div className="relative">
          {/* Radial Glow Behind Video */}
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 via-transparent to-transparent pointer-events-none rounded-xl blur-3xl" />

          {/* Video Player Card */}
          <div className="relative bg-zinc-900/50 border border-white/5 rounded-xl p-4">
            <VideoPlayer
              isUnlocked={balance > 0 || hasSeasonPass}
              isPlaying={isPlaying}
              watchedSegments={watchedSegments}
              selectedQuality={selectedQuality}
              onQualityChange={setSelectedQuality}
              totalPaid={totalPaid}
              getTotalWatchedSeconds={getTotalWatchedSeconds}
              currentVideoTitle={currentVideoTitle || "Video"}
              onVideoTimeUpdate={(currentTime) => {
                onVideoTick(currentTime);
              }}
              onPlayStateChange={(playing) => {
                if (playing && !isPlaying) {
                  startSession();
                } else if (!playing && isPlaying) {
                  stopSession();
                }
              }}
            />
          </div>
        </div>

        {/* Cinema Controls */}
        <CinemaControls
          selectedQuality={selectedQuality}
          onQualityChange={setSelectedQuality}
          onTip={handleTip}
          creatorEns={creatorMetadata?.ensName}
          ratePerSecond={getEffectiveRate()}
        />

        {/* Network Matrix */}
        <NetworkMatrix logs={logs} />
      </div>

      {/* Floating Vault Dashboard (Collapsible) */}
      <VaultDashboard
        balance={balance}
        onTopUp={() => setIsTopUpOpen(true)}
      />

      {/* Smart Top-Up Modal (Omnichain Autopilot) */}
      <SmartTopUp
        isOpen={isTopUpOpen}
        onClose={() => {
          setIsTopUpOpen(false);
          setRefillStatus('idle');
        }}
        onSimulateCredit={(amount) => {
          topUp(amount);
          setRefillStatus('credited');
          setTimeout(() => setRefillStatus('idle'), 800);
        }}
      />
    </div>
  );
}
