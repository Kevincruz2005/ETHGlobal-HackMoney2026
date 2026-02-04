"use client";

import { Lock, Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface VideoPlayerProps {
    isUnlocked?: boolean;
    isPlaying?: boolean;
    onVideoTimeUpdate?: (currentTime: number) => void; // Yellow Network heartbeat callback
}

export default function VideoPlayer({
    isUnlocked = false,
    isPlaying = false,
    onVideoTimeUpdate
}: VideoPlayerProps) {
    const [videoError, setVideoError] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Livepeer playback ID for Big Buck Bunny
    const livepeerPlaybackId = "f5eese9wwl88k4g8";
    const livepeerSrc = `https://livepeercdn.com/hls/${livepeerPlaybackId}/index.m3u8`;

    // Fallback video sources (more reliable)
    const fallbackSources = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
        "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
    ];

    const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
    const [useLivepeer, setUseLivepeer] = useState(false); // Start with fallback for reliability

    const getVideoSrc = () => {
        if (useLivepeer) {
            return livepeerSrc;
        }
        return fallbackSources[currentSourceIndex];
    };

    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const videoElement = e.currentTarget;
        const errorCode = videoElement.error?.code;
        const errorMessage = videoElement.error?.message;

        // Only log if there's actual error data to prevent empty object console errors
        if (errorCode || errorMessage) {
            console.error('Video error details:', {
                code: errorCode,
                message: errorMessage,
                src: videoElement.src,
                networkState: videoElement.networkState,
                readyState: videoElement.readyState
            });
            console.log(`Video source failed: ${getVideoSrc()}`);
        }
        // Otherwise, silently try next source without logging

        // Try next source
        if (useLivepeer) {
            setUseLivepeer(false);
        } else if (currentSourceIndex < fallbackSources.length - 1) {
            setCurrentSourceIndex(prev => prev + 1);
        } else {
            // Only show error state if we have exhausted all sources
            setVideoError(true);
        }
    };

    // Yellow Network heartbeat: Trigger payment logic on video time update
    const handleTimeUpdate = () => {
        if (videoRef.current && onVideoTimeUpdate) {
            const newCurrentTime = videoRef.current.currentTime;

            // Only trigger heartbeat if time has actually moved forward
            if (Math.floor(newCurrentTime) > Math.floor(currentTime)) {
                onVideoTimeUpdate(newCurrentTime);
                setCurrentTime(newCurrentTime);
            }
        }
    };

    // Handle video metadata loaded
    const handleLoadedMetadata = () => {
        console.log('Video metadata loaded successfully');
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setVideoLoaded(true);
        }
    };

    // Handle video can play
    const handleCanPlay = () => {
        console.log('Video can play');
        setVideoLoaded(true);
    };

    // Control video playback based on stream state
    useEffect(() => {
        if (videoRef.current && videoLoaded) {
            if (isPlaying && isUnlocked) {
                console.log('Attempting to play video...');
                videoRef.current.play().then(() => {
                    console.log('Video playing successfully');
                }).catch(err => {
                    console.warn('Video play error:', err);
                    // Try muted play as fallback
                    videoRef.current!.muted = true;
                    videoRef.current!.play().catch(mutedErr => {
                        console.warn('Muted video play also failed:', mutedErr);
                    });
                });
            } else {
                console.log('Pausing video...');
                videoRef.current.pause();
            }
        }
    }, [isPlaying, isUnlocked, videoLoaded]);

    // Reset states when source changes
    useEffect(() => {
        const resetStates = () => {
            setVideoLoaded(false);
            setVideoError(false);
            setCurrentTime(0);
            setDuration(0);
        };
        resetStates();

        // Add timeout to handle cases where video doesn't load
        const timeout = setTimeout(() => {
            if (!videoLoaded && !videoError) {
                // Try next source silently
                if (useLivepeer) {
                    setUseLivepeer(false);
                } else if (currentSourceIndex < fallbackSources.length - 1) {
                    setCurrentSourceIndex(prev => prev + 1);
                } else {
                    setVideoError(true);
                }
            }
        }, 10000); // 10 second timeout

        return () => clearTimeout(timeout);
    }, [useLivepeer, currentSourceIndex]);

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
            {/* Video Source Indicator & Controls */}
            <div className="absolute top-2 right-2 z-20 flex gap-2">
                <div className="px-2 py-1 bg-black/60 rounded text-[10px] font-mono">
                    {useLivepeer ? "LIVEPEER" : `FALLBACK ${currentSourceIndex + 1}`}
                </div>
                <button
                    onClick={() => {
                        console.log('Toggling video source...');
                        setUseLivepeer(!useLivepeer);
                        setCurrentSourceIndex(0);
                    }}
                    className="px-2 py-1 bg-[#4DA2FF]/20 hover:bg-[#4DA2FF]/30 rounded text-[10px] font-mono text-[#4DA2FF] border border-[#4DA2FF]/30 transition-colors"
                    title="Toggle between Livepeer and fallback sources"
                >
                    SWITCH
                </button>
            </div>

            {/* Video Element */}
            <video
                ref={videoRef}
                key={getVideoSrc()}
                className="w-full h-full object-cover"
                src={getVideoSrc()}
                crossOrigin="anonymous" // Handle cross-origin issues
                controls={false} // Hide default controls for matrix feel
                autoPlay={false}
                muted={true} // Start muted for autoplay compatibility
                loop
                playsInline
                preload="metadata" // Load metadata for better performance
                onLoadStart={() => {
                    console.log('Video load start:', getVideoSrc());
                    setVideoLoaded(false);
                }}
                onCanPlay={handleCanPlay}
                onLoadedMetadata={handleLoadedMetadata}
                onError={handleVideoError}
                onTimeUpdate={handleTimeUpdate} // Yellow Network heartbeat trigger
                onPlay={() => console.log('Video play event fired')}
                onPause={() => console.log('Video pause event fired')}
                onEnded={() => console.log('Video ended')}
                onStalled={() => console.log('Video stalled - network issue')}
                onSuspend={() => console.log('Video suspended - browser paused loading')}
                onAbort={() => console.log('Video loading aborted')}
                onEmptied={() => console.log('Video emptied')}
            />

            {/* Video Progress Bar (Yellow Network integration) */}
            {isUnlocked && videoLoaded && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800 z-20">
                    <div
                        className="h-full bg-[#4DA2FF] transition-all duration-300"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    />
                </div>
            )}

            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute bottom-8 left-2 z-20 px-2 py-1 bg-black/80 rounded text-[8px] font-mono text-green-400 max-w-xs">
                    <div>Src: {useLivepeer ? 'LIVEPEER' : `FALLBACK${currentSourceIndex + 1}`}</div>
                    <div>Loaded: {videoLoaded ? 'YES' : 'NO'}</div>
                    <div>Playing: {isPlaying ? 'YES' : 'NO'}</div>
                    <div>Unlocked: {isUnlocked ? 'YES' : 'NO'}</div>
                    <div>Time: {Math.floor(currentTime)}s</div>
                    <div>Duration: {Math.floor(duration)}s</div>
                </div>
            )}

            {/* Locked State */}
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

            {/* Ready to Play State */}
            {isUnlocked && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#4DA2FF]/20 flex items-center justify-center">
                            <Play className="w-8 h-8 text-[#4DA2FF]" />
                        </div>
                        <p className="text-white text-sm font-medium">Click &quot;Start Stream&quot; to begin</p>
                        <p className="text-zinc-400 text-xs mt-1">Livepeer stream ready • {useLivepeer ? "HLS" : "MP4"}</p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isUnlocked && isPlaying && !videoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-[#4DA2FF] border-t-transparent animate-spin"></div>
                        <p className="text-white text-sm font-medium">Loading stream...</p>
                        <p className="text-zinc-400 text-xs mt-1">{useLivepeer ? "Connecting to Livepeer" : "Loading video"}</p>
                    </div>
                </div>
            )}

            {/* Yellow Network Active Indicator */}
            {isUnlocked && isPlaying && videoLoaded && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 backdrop-blur-glass px-3 py-1.5 rounded-full border border-[#4DA2FF]/30">
                    <div className="w-2 h-2 rounded-full bg-[#4DA2FF] animate-pulse" />
                    <span className="text-[10px] font-bold text-[#4DA2FF] tracking-wider">YELLOW::ACTIVE</span>
                </div>
            )}
        </div>
    );
}
