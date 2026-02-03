"use client";

import VideoPlayer from "@/components/VideoPlayer";
import MatrixLog from "@/components/MatrixLog";
import SmartTopUp from "@/components/SmartTopUp";
import CreatorProfile from "@/components/CreatorProfile";
import AgentView from "@/components/AgentView";
import { useStreamSession } from "@/hooks/useStreamSession";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Coins, Monitor, Bot } from "lucide-react";

// Vitalik's address for demo ENS resolution
const DEMO_CREATOR_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as const;

export default function Home() {
  const { balance, logs, isPlaying, startSession, stopSession, topUp, totalPaid } = useStreamSession();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"Human" | "Agent">("Human");

  // Auto-trigger Smart Top-Up when balance is low
  useEffect(() => {
    if (isPlaying && balance < 0.0010 && balance > 0) {
      // Defer state updates to avoid synchronous setState-in-effect lint errors
      setTimeout(() => {
        stopSession();
        setIsTopUpOpen(true);
      }, 0);
    }
  }, [balance, isPlaying, stopSession]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <SmartTopUp isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />

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
              <CreatorProfile address={DEMO_CREATOR_ADDRESS} />
            </>
          ) : (
            <AgentView
              balance={balance}
              isPlaying={isPlaying}
              totalPaid={totalPaid}
              logs={logs}
              creatorAddress={DEMO_CREATOR_ADDRESS}
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
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">State Channel Balance</p>
                <span className={cn("font-mono text-xl font-bold tracking-tight transition-colors",
                  balance < 0.5 ? "text-red-400" : "text-white"
                )}>
                  ${balance.toFixed(4)} <span className="text-sm text-zinc-600 font-normal">USDC</span>
                </span>
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
            <MatrixLog logs={logs} />
          </div>

          {/* Hidden Demo God Button */}
          <div className="p-2 border-t border-zinc-900 bg-zinc-950 flex justify-end">
            <button
              onClick={() => topUp(5.0000)}
              className="opacity-10 hover:opacity-100 transition-opacity p-1 text-zinc-600 hover:text-yellow-400"
              title="Simulation Mode: Add +5 USDC"
            >
              <Coins size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
