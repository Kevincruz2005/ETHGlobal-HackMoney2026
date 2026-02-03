"use client";

import { Lock } from "lucide-react";

interface VideoPlayerProps {
    isUnlocked?: boolean;
    isPlaying?: boolean;
}

export default function VideoPlayer({ isUnlocked = false, isPlaying = false }: VideoPlayerProps) {
    // Using a sample video that works (Big Buck Bunny)
    const videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
            <video
                className="w-full h-full object-cover"
                src={videoSrc}
                // controls={isUnlocked} // Hide default controls for matrix feel
                autoPlay={false}
                muted={false}
                loop
                ref={(el) => {
                    if (el) {
                        isPlaying ? el.play() : el.pause();
                    }
                }}
            />

            {!isUnlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-10 transition-all duration-500">
                    <div className="p-4 bg-zinc-900/80 rounded-full mb-4 border border-zinc-700 shadow-lg glow-md">
                        <Lock className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Content Locked</h3>
                    <p className="text-zinc-400 text-sm font-medium">Connect wallet and start stream to watch</p>
                </div>
            )}
        </div>
    );
}
