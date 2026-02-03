import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NitroGate",
  description: "The Netflix of Web3 - Pay per second streaming.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-zinc-950 text-white min-h-screen antialiased")}>
        <Header />
        <main className="min-h-screen pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
