export interface Movie {
    id: string;
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    videoUrl: string;
    videoType: 'hls' | 'mp4';
    duration: number; // seconds
    category: 'Action' | 'Documentary' | 'New on Base' | 'Trending';
    creatorAddress: `0x${string}`;
    pricePerMinute: number; // USDC
    featured?: boolean;
    rating?: number; // 1-5
    views?: number;
}

export interface StreamingHistory {
    id: string;
    movieId: string;
    movieTitle: string;
    duration: number; // seconds watched
    amountPaid: number; // USDC
    timestamp: number;
}

export interface CreatorStats {
    totalEarned: number;
    monthlyEarned: number;
    todayEarned: number;
    totalStreams: number;
    topVideos: {
        movieId: string;
        title: string;
        views: number;
        revenue: number;
        avgWatchTime: number;
    }[];
}
