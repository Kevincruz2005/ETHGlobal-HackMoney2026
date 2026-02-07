"use client";

import { useEffect, useState } from "react";
import { Upload, DollarSign, TrendingUp, Video, CheckCircle, Loader2 } from "lucide-react";
import { usePinataUpload } from "@/hooks/usePinataUpload";
import { useVideoRegistry } from "@/hooks/useVideoRegistry";
import { useAccount } from "wagmi";

export default function StudioPage() {
    const [activeTab, setActiveTab] = useState<"upload" | "revenue" | "settlements">("upload");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [videoTitle, setVideoTitle] = useState("");
    const [videoDescription, setVideoDescription] = useState("");
    const [videoPrice, setVideoPrice] = useState("0.00001");
    const [uploadedVideos, setUploadedVideos] = useState<any[]>([]);
    const [videoCategory, setVideoCategory] = useState("Entertainment");

    // Wallet connection
    const { address, isConnected } = useAccount();

    // Pinata upload hook
    const { uploadVideo, progress, isUploading: isPinataUploading, error, result } = usePinataUpload();

    // VideoRegistry blockchain hook
    const { publishVideo, isPublishing, isSuccess: isPublishSuccess } = useVideoRegistry();

    // Load uploaded videos from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('nitrogate_uploaded_videos');
        if (saved) {
            try {
                setUploadedVideos(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load uploaded videos', e);
            }
        }
    }, []);

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate title
        if (!videoTitle.trim()) {
            alert('Please enter a video title first');
            return;
        }

        // Check wallet connection
        if (!isConnected || !address) {
            alert('⚠️ Please connect your wallet first to publish on-chain!');
            return;
        }

        try {
            // Upload to Pinata IPFS
            const uploadResult = await uploadVideo(file, {
                name: videoTitle,
                description: videoDescription,
                price: videoPrice,
            });

            if (uploadResult) {
                console.log('Video uploaded to IPFS:', uploadResult);

                // Publish to blockchain
                console.log('Publishing to blockchain...');
                await publishVideo(
                    uploadResult.ipfsHash,
                    videoTitle,
                    videoDescription,
                    videoCategory,
                    videoPrice
                );

                console.log('Video published to blockchain!');

                // Auto-publish to browse page (backwards compatibility with localStorage)
                const publishedVideo = {
                    ...uploadResult,
                    title: videoTitle,
                    description: videoDescription,
                    price: videoPrice,
                    category: videoCategory,
                    published: true,
                    uploadedAt: new Date().toISOString(),
                    onChain: true, // Mark as on-chain
                };

                // Save to uploaded videos (avoid duplicates)
                const currentUploaded = [...uploadedVideos];
                const existingIndex = currentUploaded.findIndex(v => v.ipfsHash === uploadResult.ipfsHash);
                if (existingIndex >= 0) {
                    currentUploaded[existingIndex] = publishedVideo;
                } else {
                    currentUploaded.unshift(publishedVideo);
                }
                setUploadedVideos(currentUploaded);
                localStorage.setItem('nitrogate_uploaded_videos', JSON.stringify(currentUploaded));

                alert('✅ Video uploaded to IPFS and published on-chain! Your videos now follow your wallet everywhere! 🎉');

                // Reset form
                setVideoTitle('');
                setVideoDescription('');
                setVideoPrice('0.00001');
            }
        } catch (error: any) {
            console.error('Upload/publish error:', error);
            alert(`❌ Error: ${error.message || 'Failed to upload/publish video'}`);
        }
    };

    // Mock data
    const stats = {
        totalEarned: 124.53,
        monthlyEarned: 45.20,
        todayEarned: 8.15,
        totalStreams: 1523,
    };

    const topVideos = [
        { id: "1", title: "Big Buck Bunny", views: 12543, revenue: 74.82, avgWatchTime: 8.5 },
        { id: "2", title: "Sintel", views: 15234, revenue: 32.18, avgWatchTime: 12.3 },
        { id: "3", title: "Tears of Steel", views: 9876, revenue: 17.53, avgWatchTime: 10.1 },
    ];

    const settlements = [
        { id: "1", date: "Feb 5, 2026", amount: 45.20, txHash: "0x8a3f..." },
        { id: "2", date: "Feb 1, 2026", amount: 32.15, txHash: "0x7b2e..." },
        { id: "3", date: "Jan 28, 2026", amount: 47.18, txHash: "0x6c1d..." },
    ];

    const revenueData = [
        { date: "Feb 1", amount: 5.2 },
        { date: "Feb 2", amount: 7.8 },
        { date: "Feb 3", amount: 6.5 },
        { date: "Feb 4", amount: 9.2 },
        { date: "Feb 5", amount: 8.1 },
    ];

    return (
        <div className="min-h-screen bg-[#050505] p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Creator Studio</h1>
                    <p className="text-zinc-400">Manage your content and track your earnings</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-white/10">
                    {(["upload", "revenue", "settlements"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px - 6 py - 3 font - medium capitalize transition - colors relative ${activeTab === tab
                                ? "text-amber-400"
                                : "text-zinc-400 hover:text-white"
                                } `}
                        >
                            {tab === "upload" && "Upload"}
                            {tab === "revenue" && "Revenue Dashboard"}
                            {tab === "settlements" && "Settlements"}

                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === "upload" && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Upload Section */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6">Upload Video</h2>

                            {/* Drag & Drop Zone */}
                            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-12 text-center hover:border-amber-500/50 transition-colors cursor-pointer bg-zinc-800/20 relative">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                                <p className="text-zinc-400 mb-1">Drag and drop or click to upload</p>
                                <p className="text-sm text-zinc-600">MP4, WebM, or OGG (max 2GB)</p>
                            </div>

                            {/* Upload Progress */}
                            {isPinataUploading && (
                                <div className="mt-6">
                                    <div className="flex justify-between text-sm text-zinc-400 mb-2">
                                        <span>Uploading to IPFS...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {result && !isPinataUploading && (
                                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <p className="text-sm text-emerald-400 mb-2">✓ Upload complete!</p>
                                    <p className="text-xs text-zinc-400 font-mono break-all">IPFS: {result.ipfsHash}</p>
                                </div>
                            )}
                        </div>

                        {/* Video Metadata */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6">Video Details</h2>

                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Title *</label>
                                    <input
                                        type="text"
                                        value={videoTitle}
                                        onChange={(e) => setVideoTitle(e.target.value)}
                                        placeholder="Enter video title"
                                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                                    <textarea
                                        rows={3}
                                        value={videoDescription}
                                        onChange={(e) => setVideoDescription(e.target.value)}
                                        placeholder="Describe your video..."
                                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
                                        <select
                                            value={videoCategory}
                                            onChange={(e) => setVideoCategory(e.target.value)}
                                            className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                        >
                                            <option>Action</option>
                                            <option>Documentary</option>
                                            <option>Entertainment</option>
                                            <option>Education</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">Price (USDC/min)</label>
                                        <input
                                            type="number"
                                            value={videoPrice}
                                            onChange={(e) => setVideoPrice(e.target.value)}
                                            step="0.00001"
                                            placeholder="0.00001"
                                            className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">Thumbnail</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-zinc-400 focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-bold hover:from-purple-400 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/20"
                                >
                                    Publish to NitroGate
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === "revenue" && (
                    <div className="space-y-6">
                        {/* Earnings Summary */}
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                <DollarSign className="w-6 h-6 text-amber-400 mb-2" />
                                <div className="text-2xl font-bold text-white mb-1">${stats.totalEarned.toFixed(2)}</div>
                                <div className="text-sm text-zinc-400">Total Earned</div>
                            </div>

                            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                <TrendingUp className="w-6 h-6 text-emerald-400 mb-2" />
                                <div className="text-2xl font-bold text-white mb-1">${stats.monthlyEarned.toFixed(2)}</div>
                                <div className="text-sm text-zinc-400">This Month</div>
                            </div>

                            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                <Clock className="w-6 h-6 text-indigo-400 mb-2" />
                                <div className="text-2xl font-bold text-white mb-1">${stats.todayEarned.toFixed(2)}</div>
                                <div className="text-sm text-zinc-400">Today</div>
                            </div>

                            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                <Eye className="w-6 h-6 text-purple-400 mb-2" />
                                <div className="text-2xl font-bold text-white mb-1">{stats.totalStreams.toLocaleString()}</div>
                                <div className="text-sm text-zinc-400">Total Streams</div>
                            </div>
                        </div>

                        {/* Revenue Graph */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6">Earnings (Last 5 Days)</h2>

                            <div className="h-64 flex items-end gap-4">
                                {revenueData.map((item, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="text-xs text-amber-400 font-mono">${item.amount.toFixed(1)}</div>
                                        <div
                                            className="w-full bg-gradient-to-t from-amber-500 to-amber-600 rounded-t"
                                            style={{ height: `${(item.amount / 10) * 100}% ` }}
                                        />
                                        <span className="text-xs text-zinc-500">{item.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Videos */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6">Top Performing Videos</h2>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="text-left text-sm text-zinc-400 border-b border-white/5">
                                        <tr>
                                            <th className="pb-3 font-medium">Video</th>
                                            <th className="pb-3 font-medium">Views</th>
                                            <th className="pb-3 font-medium">Revenue</th>
                                            <th className="pb-3 font-medium">Avg. Watch Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {topVideos.map((video) => (
                                            <tr key={video.id} className="border-b border-white/5">
                                                <td className="py-4 text-white font-medium">{video.title}</td>
                                                <td className="py-4 text-zinc-400">{video.views.toLocaleString()}</td>
                                                <td className="py-4 text-amber-400 font-mono">${video.revenue.toFixed(2)}</td>
                                                <td className="py-4 text-zinc-400">{video.avgWatchTime} min</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "settlements" && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Available to Claim */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6">Available to Claim</h2>
                            <div className="text-center mb-8">
                                <div className="text-4xl font-bold text-amber-400 mb-2">
                                    ${stats.monthlyEarned.toFixed(2)}
                                </div>
                                <div className="text-sm text-zinc-400">USDC on Base Sepolia</div>
                            </div>

                            <button className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg font-bold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                                <Download className="w-5 h-5" />
                                Claim Earnings
                            </button>

                            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-amber-400">
                                    <span className="text-xl">🟡</span>
                                    <div>
                                        <strong>Yellow Network Settlement</strong>
                                        <br />
                                        Earnings are settled weekly to Base Sepolia via state channel closure.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settlement History */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6">Settlement History</h2>

                            <div className="space-y-4">
                                {settlements.map((settlement) => (
                                    <div
                                        key={settlement.id}
                                        className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-white/5"
                                    >
                                        <div>
                                            <div className="text-white font-medium mb-1">${settlement.amount.toFixed(2)} USDC</div>
                                            <div className="text-xs text-zinc-500">{settlement.date}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-zinc-500 mb-1">TX Hash</div>
                                            <a
                                                href={`https://sepolia.basescan.org/tx/${settlement.txHash}123456`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-purple-400 hover:text-purple-300 font-mono"
                                            >
                                                {settlement.txHash}
                                            </a >
                                        </div >
                                    </div >
                                ))}
                            </div >

                            <button className="w-full mt-6 px-6 py-3 bg-zinc-800 border border-white/10 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors">
                                Export History
                            </button>
                        </div >
                    </div >
                )}
            </div >
        </div >
    );
}
