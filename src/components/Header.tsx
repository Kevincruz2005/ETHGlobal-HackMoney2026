"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";

export default function Header() {
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/25817603-2654-4e83-8f50-c59a008a9f80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'B',location:'src/components/Header.tsx:Header.useEffect',message:'Header mounted; connect button should be present',data:{origin: typeof window !== 'undefined' ? window.location.origin : 'ssr'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-white/10">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tighter text-white">
          NitroGate<span className="text-yellow-400">.</span>
        </span>
      </Link>

      <ConnectButton />
    </header>
  );
}
