import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "euc.li" }, // ENS avatars
      { protocol: "https", hostname: "*.ipfs.dweb.link" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "cloudflare-ipfs.com" },
      { protocol: "https", hostname: "metadata.ens.domains" },
    ],
  },
};

export default nextConfig;
