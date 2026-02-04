"use client";

import { Lock, Play, Pause, SkipForward, SkipBack, Maximize, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
    isUnlocked?: boolean;
    isPlaying?: boolean;
    onVideoTimeUpdate?: (currentTime: number) => void; // Yellow Network heartbeat callback
    onPlayStateChange?: (playing: boolean) => void; // Sync play/pause state with parent
    watchedSegments?: [number, number][]; // Segments that have been paid for
}

export default function VideoPlayer({
    isUnlocked = false,
    isPlaying = false,
    onVideoTimeUpdate,
    onPlayStateChange,
    watchedSegments = []
}: VideoPlayerProps) {
    const [videoError, setVideoError] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoadingSource, setIsLoadingSource] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // High-reliability video sources (in priority order)
    const videoSources = [
        { url: "https://lp-playback.com/hls/f5eese9wwl88k4g8/index.m3u8", type: "hls", label: "HLS" },
        { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", type: "mp4", label: "MP4-1" },
        { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", type: "mp4", label: "MP4-2" }
    ];

    const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
    const currentSource = videoSources[currentSourceIndex];

    // Cleanup HLS instance
    const cleanupHls = () => {
        if (hlsRef.current) {
            console.log('Cleaning up HLS instance');
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
    };

    // Load video source based on type (HLS or MP4)
    const loadVideoSource = (source: typeof videoSources[0]) => {
        const video = videoRef.current;
        if (!video) return;

        console.log(`Loading video source: ${source.label} (${source.type})`);
        setIsLoadingSource(true);
        setVideoLoaded(false);

        // Cleanup previous HLS instance
        cleanupHls();

        if (source.type === "hls") {
            // HLS playback
            if (Hls.isSupported()) {
                console.log('HLS is supported, using hls.js');
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    debug: false
                });

                hls.loadSource(source.url);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log('HLS manifest parsed successfully');
                    setVideoLoaded(true);
                    setIsLoadingSource(false);
                    setVideoError(false);
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.error('Fatal HLS error:', data.type, data.details);
                        handleSourceError();
                    } else {
                        console.warn('Non-fatal HLS error:', data.type, data.details);
                    }
                });

                hlsRef.current = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                console.log('Using native HLS playback (Safari)');
                video.src = source.url;
            } else {
                console.log('HLS not supported, trying next source...');
                handleSourceError();
            }
        } else {
            // MP4 playback
            console.log('Using standard MP4 playback');
            video.src = source.url;
        }
    };

    // Handle source loading error - try next source
    const handleSourceError = () => {
        setIsLoadingSource(false);

        if (currentSourceIndex < videoSources.length - 1) {
            console.log(`Switching to next source (${currentSourceIndex + 1}/${videoSources.length})`);
            setCurrentSourceIndex(prev => prev + 1);
        } else {
            console.error('All video sources failed');
            setVideoError(true);
        }
    };

    // Handle video element errors
    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const videoElement = e.currentTarget;
        const errorCode = videoElement.error?.code;
        const errorMessage = videoElement.error?.message;

        // Only log if there's actual error data
        if (errorCode || errorMessage) {
            console.error('Video playback error:', {
                code: errorCode,
                message: errorMessage,
                src: videoElement.src,
                currentSource: currentSource.label
            });
        }

        handleSourceError();
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
        console.log('Video metadata loaded');
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setVideoLoaded(true);
            setIsLoadingSource(false);
        }
    };

    // Handle video can play
    const handleCanPlay = () => {
        console.log('Video can play');
        setVideoLoaded(true);
        setIsLoadingSource(false);
    };

    // Load source when index changes
    useEffect(() => {
        loadVideoSource(currentSource);

        return () => {
            cleanupHls();
        };
    }, [currentSourceIndex]);

    // Control video playback based on stream state
    useEffect(() => {
        if (videoRef.current && videoLoaded) {
            if (isPlaying && isUnlocked) {
                console.log('Starting video playback...');
                videoRef.current.play().then(() => {
                    console.log('Video playing');
                }).catch(err => {
                    console.warn('Video play error:', err);
                    // Try muted play as fallback
                    videoRef.current!.muted = true;
                    videoRef.current!.play().catch(mutedErr => {
                        console.warn('Muted play also failed:', mutedErr);
                    });
                });
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying, isUnlocked, videoLoaded]);

    // Control handlers
    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                onPlayStateChange?.(false);
            } else {
                videoRef.current.play();
                onPlayStateChange?.(true);
            }
        }
    };

    const handleSeekForward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
        }
    };

    const handleSeekBackward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        }
    };

    const handleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    };

    const handleDownload = async () => {
        if (!currentSource || isDownloading) return;

        try {
            setIsDownloading(true);
            console.log('Starting download...', currentSource.url);

            const response = await fetch(currentSource.url, {
                mode: 'cors'
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `video-${Date.now()}.${currentSource.type === 'hls' ? 'm3u8' : 'mp4'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            console.log('Download complete');
        } catch (error) {
            console.error('Download error:', error);
            // Fallback: open in new tab
            window.open(currentSource.url, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    // Manual source switching
    const switchSource = () => {
        const nextIndex = (currentSourceIndex + 1) % videoSources.length;
        console.log(`Manual switch to source ${nextIndex}`);
        setCurrentSourceIndex(nextIndex);
    };

    if (videoError) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Video Unavailable</h3>
                    <p className="text-zinc-400 text-sm">All video sources failed to load</p>
                    <button
                        onClick={() => {
                            setVideoError(false);
                            setCurrentSourceIndex(0);
                        }}
                        className="mt-4 px-4 py-2 bg-[#4DA2FF] text-black rounded-lg hover:bg-[#3A8BEE] transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-2xl"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            {/* Video Source Indicator & Controls */}
            <div className="absolute top-2 right-2 z-20 flex gap-2">
                <div className="px-2 py-1 bg-black/60 rounded text-[10px] font-mono">
                    {currentSource.label}
                </div>
                <button
                    onClick={switchSource}
                    className="px-2 py-1 bg-[#4DA2FF]/20 hover:bg-[#4DA2FF]/30 rounded text-[10px] font-mono text-[#4DA2FF] border border-[#4DA2FF]/30 transition-colors"
                    title="Switch video source"
                >
                    SWITCH
                </button>
            </div>

            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                controls={false}
                autoPlay={false}
                muted={true}
                loop
                playsInline
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={handleCanPlay}
                onError={handleVideoError}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => console.log('Video play event')}
                onPause={() => console.log('Video pause event')}
            />

            {/* Video Progress Bar with Watched Segments */}
            {isUnlocked && videoLoaded && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800 z-20">
                    {/* Watched segments (green) */}
                    {watchedSegments.map(([start, end], index) => {
                        const startPercent = (start / duration) * 100;
                        const widthPercent = ((end - start + 1) / duration) * 100;
                        return (
                            <div
                                key={index}
                                className="absolute h-full bg-green-500/60"
                                style={{
                                    left: `${startPercent}%`,
                                    width: `${widthPercent}%`
                                }}
                            />
                        );
                    })}
                    {/* Current playback position */}
                    <div
                        className="h-full bg-[#4DA2FF] transition-all duration-300"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    />
                </div>
            )}

            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute bottom-8 left-2 z-20 px-2 py-1 bg-black/80 rounded text-[8px] font-mono text-green-400 max-w-xs">
                    <div>Source: {currentSource.label} ({currentSource.type})</div>
                    <div>Loaded: {videoLoaded ? 'YES' : 'NO'}</div>
                    <div>Playing: {isPlaying ? 'YES' : 'NO'}</div>
                    <div>Unlocked: {isUnlocked ? 'YES' : 'NO'}</div>
                    <div>Time: {Math.floor(currentTime)}s / {Math.floor(duration)}s</div>
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
                        <p className="text-[#4DA2FF] text-xs font-mono">Balance: $0.0000 USDC</p>
                    </div>
                </div>
            )}

            {/* Ready to Play State */}
            {isUnlocked && !isPlaying && !isLoadingSource && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#4DA2FF]/20 flex items-center justify-center">
                            <Play className="w-8 h-8 text-[#4DA2FF]" />
                        </div>
                        <p className="text-white text-sm font-medium">Click "Start Stream" to begin</p>
                        <p className="text-zinc-400 text-xs mt-1">{currentSource.label} stream ready</p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoadingSource && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-[#4DA2FF] border-t-transparent animate-spin"></div>
                        <p className="text-white text-sm font-medium">Loading stream...</p>
                        <p className="text-zinc-400 text-xs mt-1">Connecting to {currentSource.label}</p>
                    </div>
                </div>
            )}

            {/* Custom Control Bar */}
            {isUnlocked && videoLoaded && showControls && (
                <div className="absolute bottom-12 left-0 right-0 z-30 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm">
                    <button
                        onClick={handleSeekBackward}
                        className="p-2 rounded-full bg-black/60 hover:bg-[#4DA2FF]/20 border border-[#4DA2FF]/30 transition-all hover:scale-110"
                        title="Rewind 10 seconds (FREE)"
                    >
                        <SkipBack className="w-5 h-5 text-[#4DA2FF]" />
                    </button>

                    <button
                        onClick={handlePlayPause}
                        className="p-3 rounded-full bg-[#4DA2FF]/20 hover:bg-[#4DA2FF]/30 border border-[#4DA2FF] transition-all hover:scale-110 shadow-lg shadow-[#4DA2FF]/20"
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6 text-[#4DA2FF]" />
                        ) : (
                            <Play className="w-6 h-6 text-[#4DA2FF]" />
                        )}
                    </button>

                    <button
                        onClick={handleSeekForward}
                        className="p-2 rounded-full bg-black/60 hover:bg-[#4DA2FF]/20 border border-[#4DA2FF]/30 transition-all hover:scale-110"
                        title="Forward 10 seconds"
                    >
                        <SkipForward className="w-5 h-5 text-[#4DA2FF]" />
                    </button>

                    <div className="flex-1" />

                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="p-2 rounded-full bg-black/60 hover:bg-[#4DA2FF]/20 border border-[#4DA2FF]/30 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isDownloading ? "Downloading..." : "Download Video"}
                    >
                        <Download className={`w-5 h-5 text-[#4DA2FF] ${isDownloading ? 'animate-bounce' : ''}`} />
                    </button>

                    <button
                        onClick={handleFullscreen}
                        className="p-2 rounded-full bg-black/60 hover:bg-[#4DA2FF]/20 border border-[#4DA2FF]/30 transition-all hover:scale-110"
                        title="Toggle Fullscreen"
                    >
                        <Maximize className="w-5 h-5 text-[#4DA2FF]" />
                    </button>
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
