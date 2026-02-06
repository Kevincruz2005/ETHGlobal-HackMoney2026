import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'commondatastorage.googleapis.com',
        pathname: '/gtv-videos-bucket/**',
      },
      {
        protocol: 'https',
        hostname: 'lp-playback.com',
        pathname: '/hls/**',
      },
    ],
  },
};

export default nextConfig;
