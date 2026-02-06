import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { cn } from "@/lib/utils";
import { Web3Provider } from "@/providers/Web3Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NitroGate - Pay-Per-Second Cinema",
  description: "The Netflix of Web3 - Pay per second streaming powered by Yellow Network, Circle Arc, and ENS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-[#050505] text-white min-h-screen antialiased")}>
        <Web3Provider>
          <Navigation />
          <main className="min-h-screen pt-20">
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  );
}
