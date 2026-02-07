"use client";

import { useEffect, useState, use, useRef } from "react";
import { notFound } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { BrowserProvider } from "ethers";
import Link from "next/link";
import { ArrowLeft, Star, Eye, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { getMovieBySlug, getMoviesByCategory } from "@/data/movies";
import { getYellowClient } from "@/lib/yellowClient";
import { useNitroCreatorMetadata } from "@/hooks/useNitroCreatorMetadata";
import VideoPlayer from "@/components/VideoPlayer";
import CinemaControls from "@/components/CinemaControls";
import MovieCard from "@/components/MovieCard";

// Real-time log entry
interface LogEntry {
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    data?: any;
}

export default function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    // First try to get from hardcoded movies
    let movie = getMovieBySlug(slug);

    // If not found, check if it's an IPFS video
    const [ipfsMovie, setIpfsMovie] = useState<any>(null);
    const [isLoadingIPFS, setIsLoadingIPFS] = useState(!movie); // Only load if movie not found

    // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();

    // Yellow Network state
    const yellowClient = useRef(getYellowClient());
    const [isYellowConnected, setIsYellowConnected] = useState(false);
    const [sessionActive, setSessionActive] = useState(false);
    const [totalPaid, setTotalPaid] = useState(0);
    const [sessionBalance, setSessionBalance] = useState(5.0); // Initial deposit

    // Logs for terminal display
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Video state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const paymentIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!movie) {
            setIsLoadingIPFS(true);
            // Check localStorage for IPFS videos
            const saved = localStorage.getItem('nitrogate_published_videos');
            if (saved) {
                try {
                    const videos = JSON.parse(saved);
                    const ipfsVideo = videos.find((v: any) => v.ipfsHash === slug);
                    if (ipfsVideo) {
                        // Format IPFS video to match Movie type
                        setIpfsMovie({
                            id: `ipfs-${ipfsVideo.ipfsHash}`,
                            slug: ipfsVideo.ipfsHash,
                            title: ipfsVideo.title || ipfsVideo.name,
                            thumbnail: '/placeholder-video.svg',
                            videoUrl: `https://gateway.pinata.cloud/ipfs/${ipfsVideo.ipfsHash}`,
                            pricePerMinute: parseFloat(ipfsVideo.price) || 0.00001,
                            description: ipfsVideo.description || 'No description',
                            category: ipfsVideo.category || 'Entertainment',
                            creator: 'Your Upload',
                            creatorAddress: '0x0000000000000000000000000000000000000000',
                            duration: 120,
                            views: 0,
                            rating: 0,
                        });
                    }
                } catch (error) {
                    console.error('Error loading IPFS video:', error);
                }
            }
            setIsLoadingIPFS(false);
        }
    }, [slug, movie]);

    // Use either hardcoded movie or IPFS movie
    const finalMovie = movie || ipfsMovie;

    // Use connected wallet address as streamer, or fallback to demo address
    const STREAMER_ADDRESS = address || "0x4184bb731b3ed0e22eDC425901510A65a4f4aFA2";

    // Call creator metadata hook (must be called unconditionally)
    const creatorMetadata = useNitroCreatorMetadata(finalMovie?.creatorAddress || '0x0000000000000000000000000000000000000000');

    // Auto-scroll logs (must be called before any returns)
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // Send payment every second while playing (must be called before any returns)
    useEffect(() => {
        if (!isPlaying || !sessionActive || !finalMovie) {
            if (paymentIntervalRef.current) {
                clearInterval(paymentIntervalRef.current);
                paymentIntervalRef.current = null;
            }
            return;
        }

        // Payment rate: $0.0001 per second
        const ratePerSecond = finalMovie.pricePerMinute / 60;

        addLog('info', 'Starting micropayments...', {
            rate: `$${ratePerSecond.toFixed(6)}/second`
        });

        paymentIntervalRef.current = setInterval(async () => {
            try {
                const result = await yellowClient.current.sendPayment(
                    ratePerSecond.toString(),
                    STREAMER_ADDRESS
                );

                setTotalPaid(prev => prev + ratePerSecond);
                setSessionBalance(prev => Math.max(0, prev - ratePerSecond));

                addLog('success', `Payment sent: $${ratePerSecond.toFixed(6)}`, result);

            } catch (error: any) {
                addLog('error', 'Payment failed', error.message);
            }
        }, 1000); // Every 1 second

        return () => {
            if (paymentIntervalRef.current) {
                clearInterval(paymentIntervalRef.current);
            }
        };
    }, [isPlaying, sessionActive, finalMovie?.pricePerMinute]);

    // Close session when component unmounts (must be called before any returns)
    useEffect(() => {
        return () => {
            if (sessionActive) {
                yellowClient.current.closeSession()
                    .catch(err => console.error('[Yellow] Error closing session:', err));
            }
        };
    }, [sessionActive]);

    // NOW we can do conditional returns after all hooks are called
    // Show loading while checking for IPFS video
    if (isLoadingIPFS) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-white text-xl">Loading video...</div>
            </div>
        );
    }

    if (!finalMovie) {
        notFound();
    }

    // Add log entry
    const addLog = (type: LogEntry['type'], message: string, data?: any) => {
        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });

        setLogs(prev => [...prev, { timestamp, type, message, data }]);
        console.log(`[${type.toUpperCase()}]`, message, data || '');
    };

    // Initialize Yellow Network connection
    const connectToYellow = async () => {
        if (!walletClient || !address) {
            addLog('error', 'Wallet not connected');
            return;
        }

        try {
            addLog('info', 'Connecting to Yellow Network Sandbox...');

            // Convert WalletClient to ethers signer
            const provider = new BrowserProvider(walletClient as any);
            const signer = await provider.getSigner();

            await yellowClient.current.init(signer);
            setIsYellowConnected(true);
            addLog('success', 'Connected to Yellow Network', {
                endpoint: process.env.NEXT_PUBLIC_YELLOW_SANDBOX_URL
            });

        } catch (error: any) {
            addLog('error', 'Failed to connect to Yellow Network', error.message);
            console.error('[Yellow] Connection error:', error);
        }
    };

    // Create payment session (open channel)
    const startStreamingSession = async () => {
        if (!isYellowConnected || !address) {
            addLog('warning', 'Please connect to Yellow Network first');
            return;
        }

        try {
            addLog('info', 'Creating state channel session...');

            const sessionId = await yellowClient.current.createSession({
                counterparty: STREAMER_ADDRESS,
                initialAmount: '5.0' // 5 USDC deposit
            });

            setSessionActive(true);
            addLog('success', 'State channel opened!', {
                sessionId,
                deposit: '5.0 USDC',
                streamer: STREAMER_ADDRESS
            });

            // Start the video
            setIsPlaying(true);

        } catch (error: any) {
            addLog('error', 'Failed to create session', error.message);
            console.error('[Yellow] Session creation error:', error);
        }
    };

    // Send payment every second while playing
    // Video event handlers
    const handlePlay = () => {
        if (!sessionActive) {
            startStreamingSession();
        } else {
            setIsPlaying(true);
        }
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    const handleTimeUpdate = (time: number) => {
        setCurrentTime(time);
    };

    // Get related movies
    const relatedMovies = getMoviesByCategory(finalMovie.category)
        .filter(m => m.id !== finalMovie.id)
        .slice(0, 4);

    return (
        <div className="min-h-screen bg-[#050505] pb-12">
            {/* Back Button */}
            <div className="px-6 py-4">
                <Link
                    href="/browse"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Browse
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Connection Status Banner */}
                {!isConnected && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                        <div className="text-sm text-amber-400">
                            Please connect your wallet to start streaming
                        </div>
                    </div>
                )}

                {isConnected && !isYellowConnected && (
                    <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-indigo-400" />
                            <div className="text-sm text-indigo-400">
                                Connect to Yellow Network to enable gasless streaming
                            </div>
                        </div>
                        <button
                            onClick={connectToYellow}
                            className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                        >
                            Connect Yellow
                        </button>
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Video + Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Player */}
                        <div className="relative">
                            <VideoPlayer
                                videoUrl={finalMovie.videoUrl}
                                videoType={finalMovie.videoType}
                                movieTitle={finalMovie.title}
                                poster={finalMovie.thumbnail}
                                onPlay={handlePlay}
                                onPause={handlePause}
                                onTimeUpdate={handleTimeUpdate}
                                balance={sessionBalance}
                                selectedQuality="Premium"
                                watchedSegments={[]}
                            />

                            {/* Live Payment Indicator */}
                            {isPlaying && sessionActive && (
                                <div className="absolute top-4 right-4 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg backdrop-blur-md">
                                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        Streaming Live • ${totalPaid.toFixed(4)} paid
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Movie Info */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                            <h1 className="text-3xl font-bold text-white mb-4">{finalMovie.title}</h1>

                            <div className="flex items-center gap-4 mb-4 text-sm text-zinc-400">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    <span className="text-white font-medium">{finalMovie.rating || 4.5}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    <span>{finalMovie.views?.toLocaleString() || '1.2K'} views</span>
                                </div>
                                <div className="px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded text-indigo-400">
                                    {finalMovie.category}
                                </div>
                            </div>

                            <p className="text-zinc-300 leading-relaxed mb-4">
                                {finalMovie.description}
                            </p>

                            {/* Creator */}
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {creatorMetadata?.ensName?.[0]?.toUpperCase() || 'C'}
                                    </div>
                                    <div>
                                        <div className="text-sm text-zinc-500">Created by</div>
                                        <div className="text-white font-medium">
                                            {creatorMetadata?.ensName || STREAMER_ADDRESS.slice(0, 10) + '...'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Live Terminal */}
                    <div className="space-y-6">
                        {/* Session Stats */}
                        <div className="bg-zinc-950/95 border border-amber-500/30 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Session Stats</h3>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-zinc-500 mb-1">Status</div>
                                    <div className="flex items-center gap-2">
                                        {sessionActive ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                <span className="text-emerald-400 font-medium">Channel Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-4 h-4 border-2 border-zinc-600 rounded-full" />
                                                <span className="text-zinc-500">No Active Session</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-zinc-500 mb-1">Balance</div>
                                    <div className="text-2xl font-bold text-amber-400 font-mono">
                                        ${sessionBalance.toFixed(4)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-zinc-500 mb-1">Total Paid</div>
                                    <div className="text-lg font-bold text-white font-mono">
                                        ${totalPaid.toFixed(6)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-zinc-500 mb-1">Rate</div>
                                    <div className="text-sm text-zinc-300 font-mono">
                                        ${(finalMovie.pricePerMinute / 60).toFixed(6)}/sec
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Terminal */}
                        <div className="bg-black border border-emerald-500/30 rounded-xl overflow-hidden">
                            <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/30 flex items-center justify-between">
                                <span className="text-emerald-400 font-mono text-xs font-bold">
                                    YELLOW NETWORK LOGS
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-emerald-400 text-xs">LIVE</span>
                                </div>
                            </div>

                            <div className="p-4 h-96 overflow-y-auto font-mono text-xs space-y-1 scrollbar-hide">
                                {logs.length === 0 ? (
                                    <div className="text-zinc-600 italic">Waiting for connection...</div>
                                ) : (
                                    logs.map((log, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="text-zinc-600">[{log.timestamp}]</span>
                                            <span className={
                                                log.type === 'success' ? 'text-emerald-400' :
                                                    log.type === 'error' ? 'text-red-400' :
                                                        log.type === 'warning' ? 'text-amber-400' :
                                                            'text-zinc-400'
                                            }>
                                                {log.message}
                                            </span>
                                            {log.data && (
                                                <span className="text-zinc-600">
                                                    {typeof log.data === 'string' ? log.data : JSON.stringify(log.data)}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                                <div ref={logsEndRef} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Movies */}
                {relatedMovies.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-white mb-6">More {finalMovie.category}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedMovies.map((relatedMovie) => (
                                <MovieCard key={relatedMovie.id} movie={relatedMovie} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
