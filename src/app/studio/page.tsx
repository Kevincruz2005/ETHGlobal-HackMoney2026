"use client";

import { useState } from "react";
import { Upload, DollarSign, Eye, Clock, TrendingUp, Download } from "lucide-react";

export default function StudioPage() {
    const [activeTab, setActiveTab] = useState<"upload" | "revenue" | "settlements">("upload");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Simulate upload
            setIsUploading(true);
            setUploadProgress(0);

            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setIsUploading(false);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 300);
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
                            className={`px-6 py-3 font-medium capitalize transition-colors relative ${activeTab === tab
                                ? "text-amber-400"
                                : "text-zinc-400 hover:text-white"
                                }`}
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

                                <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                                <p className="text-white font-medium mb-2">Drag video file here</p>
                                <p className="text-sm text-zinc-400 mb-4">or click to browse</p>
                                <p className="text-xs text-zinc-500">Supports .mp4, .mov (max 2GB)</p>
                            </div>

                            {/* Upload Progress */}
                            {isUploading && (
                                <div className="mt-6">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-zinc-400">Pinning to IPFS...</span>
                                        <span className="text-amber-400 font-mono">{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Metadata Form */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6">Video Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter video title"
                                        className="w-full px-4 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                                    <textarea
                                        placeholder="Describe your video"
                                        rows={4}
                                        className="w-full px-4 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
                                        <select className="w-full px-4 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-amber-500/50">
                                            <option>Action</option>
                                            <option>Documentary</option>
                                            <option>New on Base</option>
                                            <option>Trending</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">Price (USDC/min)</label>
                                        <input
                                            type="number"
                                            name="pricePerMinute"
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
                                            className="w-full px-4 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-amber-500/20 file:text-amber-400 file:cursor-pointer hover:file:bg-amber-500/30"
                                        />
                                    </div>

                                    <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg font-bold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20">
                                        Publish to NitroGate
                                    </button>
                                </div>
                            </div>
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
                                            style={{ height: `${(item.amount / 10) * 100}%` }}
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
                        <div className="font-bold">Yellow Network Settlement</div>
                        <div className="text-xs text-zinc-400">Last settled 4 days ago</div>
                    </div>
                </div>
            </div>
        </div>

                                {/* Settlement History */ }
    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8">
        <h2 className="text-xl font-bold text-white mb-6">Settlement History</h2>

        <div className="space-y-4">
            {settlements.map((settlement) => (
                <div key={settlement.id} className="p-4 bg-zinc-800/30 rounded-lg border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{settlement.date}</span>
                        <span className="text-emerald-400 font-mono font-bold">+${settlement.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>TX:</span>
                        <span className="font-mono">{settlement.txHash}</span>
                        <button className="text-indigo-400 hover:text-indigo-300">View ↗</button>
                    </div>
                </div>
            ))}
        </div>

        <button className="w-full mt-6 px-4 py-2 bg-zinc-800/50 border border-white/10 text-zinc-400 rounded-lg hover:text-white hover:border-white/20 transition-colors text-sm">
            Export History
        </button>
    </div>
                            </div >
                        )
}
                    </div >
            </div >
        </div >
    );
}
