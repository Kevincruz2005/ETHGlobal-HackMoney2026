import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-white/10">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tighter text-white">
          NitroGate<span className="text-yellow-400">.</span>
        </span>
      </Link>
      
      <button className="px-4 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors">
        Connect Wallet
      </button>
    </header>
  );
}
