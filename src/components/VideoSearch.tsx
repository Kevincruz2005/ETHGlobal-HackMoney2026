"use client";

import { Search, Clock } from "lucide-react";
import { useState } from "react";

const VIDEO_LIBRARY = [
    {
        title: "Big Buck Bunny",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        duration: 596,
        type: "mp4" as const,
        description: "Animated adventure of a giant rabbit"
    },
    {
        title: "Elephants Dream",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        duration: 653,
        type: "mp4" as const,
        description: "Surreal fantasy short film"
    },
    {
        title: "Sintel",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        duration: 888,
        type: "mp4" as const,
        description: "Epic fantasy adventure"
    },
    {
        title: "Tears of Steel",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        duration: 734,
        type: "mp4" as const,
        description: "Sci-fi action short film"
    },
    {
        // Using a reliable HLS demo stream
        title: "VOD HLS Demo",
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        duration: 634,
        type: "hls" as const,
        description: "HLS streaming demo (VOD)"
    }
];

interface VideoSearchProps {
    onVideoSelect: (url: string, title: string, type: 'hls' | 'mp4') => void;
}

export default function VideoSearch({ onVideoSelect }: VideoSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showResults, setShowResults] = useState(false);

    const filteredVideos = searchQuery
        ? VIDEO_LIBRARY.filter(video =>
            video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : VIDEO_LIBRARY.slice(0, 3); // Show top 3 by default

    const formatDuration = (seconds: number) => {
        if (seconds === 0) return "LIVE";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-black/40 border border-[#4DA2FF]/30 rounded-lg hover:border-[#4DA2FF]/50 transition-colors">
                <Search className="w-4 h-4 text-[#4DA2FF]" />
                <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
                />
                {searchQuery && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setShowResults(false);
                        }}
                        className="text-zinc-400 hover:text-white text-xs"
                    >
                        Clear
                    </button>
                )}
            </div>

            {showResults && (
                <div className="absolute top-full mt-2 w-full bg-black/95 border border-[#4DA2FF]/30 rounded-lg overflow-hidden z-50 shadow-2xl backdrop-blur-sm">
                    {filteredVideos.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto">
                            {filteredVideos.map((video) => (
                                <button
                                    key={video.url}
                                    onClick={() => {
                                        onVideoSelect(video.url, video.title, video.type);
                                        setShowResults(false);
                                        setSearchQuery("");
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-[#4DA2FF]/10 transition-colors border-b border-zinc-800 last:border-b-0 group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-white font-medium group-hover:text-[#4DA2FF] transition-colors">
                                                {video.title}
                                            </p>
                                            <p className="text-zinc-500 text-xs mt-0.5">
                                                {video.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-3">
                                            <Clock className="w-3 h-3 text-zinc-600" />
                                            <span className="text-xs text-zinc-400 font-mono">
                                                {formatDuration(video.duration)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${video.type === 'hls'
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            }`}>
                                            {video.type.toUpperCase()}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-6 text-center">
                            <p className="text-zinc-400 text-sm">No videos found</p>
                            <p className="text-zinc-600 text-xs mt-1">Try a different search term</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
