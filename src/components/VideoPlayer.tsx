"use client";

import { Lock, Play } from "lucide-react";
import { useState, useEffect } from "react";

interface VideoPlayerProps {
    isUnlocked?: boolean;
    isPlaying?: boolean;
}

export default function VideoPlayer({ isUnlocked = false, isPlaying = false }: VideoPlayerProps) {
    const [videoError, setVideoError] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    
    // Try multiple video sources for reliability
    const videoSources = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
    ];
    
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoSrc = videoSources[currentVideoIndex];

    const handleVideoError = () => {
        console.log(`Video ${currentVideoIndex} failed, trying next...`);
        if (currentVideoIndex < videoSources.length - 1) {
            setCurrentVideoIndex(prev => prev + 1);
        } else {
            setVideoError(true);
        }
    };

    useEffect(() => {
        // Reset video states when source changes
        const resetStates = () => {
            setVideoLoaded(false);
            setVideoError(false);
        };
        resetStates();
    }, [currentVideoIndex]);

    if (videoError) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Video Unavailable</h3>
                    <p className="text-zinc-400 text-sm">Unable to load video stream</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
            <video
                key={videoSrc} // Force re-render when source changes
                className="w-full h-full object-cover"
                src={videoSrc}
                controls={false} // Hide default controls for matrix feel
                autoPlay={false}
                muted={true} // Muted to allow autoplay in most browsers
                loop
                playsInline
                onLoadStart={() => setVideoLoaded(false)}
                onCanPlay={() => setVideoLoaded(true)}
                onError={handleVideoError}
                ref={(el) => {
                    if (el && videoLoaded) {
                        if (isPlaying && isUnlocked) {
                            void el.play().catch(err => console.log('Video play error:', err));
                        } else {
                            el.pause();
                        }
                    }
                }}
            />

            {!isUnlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-10 transition-all duration-500">
                    <div className="p-4 bg-black/80 rounded-full mb-4 border border-[#4DA2FF]/30 shadow-lg">
                        <Lock className="w-8 h-8 text-[#4DA2FF]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Content Locked</h3>
                    <p className="text-zinc-400 text-sm font-medium">Add USDC and start stream to watch</p>
                    <div className="mt-4 px-4 py-2 bg-[#4DA2FF]/10 rounded-lg border border-[#4DA2FF]/20">
                        <p className="text-[#4DA2FF] text-xs font-mono">Balance: ${isUnlocked ? "UNLOCKED" : "0.0000 USDC"}</p>
                    </div>
                </div>
            )}

            {isUnlocked && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#4DA2FF]/20 flex items-center justify-center">
                            <Play className="w-8 h-8 text-[#4DA2FF]" />
                        </div>
                        <p className="text-white text-sm font-medium">Click &quot;Start Stream&quot; to begin</p>
                        <p className="text-zinc-400 text-xs mt-1">Video ready to play</p>
                    </div>
                </div>
            )}

            {isUnlocked && isPlaying && !videoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-[#4DA2FF] border-t-transparent animate-spin"></div>
                        <p className="text-white text-sm font-medium">Loading stream...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
