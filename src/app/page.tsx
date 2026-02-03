"use client";

import VideoPlayer from "@/components/VideoPlayer";

export default function Home() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
        {/* Main Content: Video + Controls */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="relative w-full">
            <VideoPlayer isUnlocked={false} />
          </div>

          {/* Stream Controls */}
          <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 backdrop-blur-sm shadow-sm ring-1 ring-white/5">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Stream Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="font-bold text-white text-sm tracking-wide">LIVE</span>
                </div>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Balance</p>
                <span className="font-mono text-xl text-white font-bold tracking-tight">$0.0000</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-all uppercase tracking-tight text-sm shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                Start Stream
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Logs / Chat */}
        <div className="lg:col-span-1 bg-zinc-900/50 rounded-xl border border-zinc-800 backdrop-blur-sm flex flex-col overflow-hidden h-full ring-1 ring-white/5">
          <div className="p-3 border-b border-zinc-800 bg-zinc-900/80">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">System Logs</span>
          </div>
          <div className="flex-1 p-4 font-mono text-xs text-zinc-500 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            <p className="opacity-50">[SYSTEM] Initializing secure channel...</p>
            <p className="opacity-50">[SYSTEM] Waiting for wallet connection...</p>
            <p className="text-yellow-400/50">[WARN] No session active</p>
          </div>
          <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-zinc-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
