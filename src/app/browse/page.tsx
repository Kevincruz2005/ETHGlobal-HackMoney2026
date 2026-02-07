"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X } from "lucide-react";
import FeaturedBanner from "@/components/FeaturedBanner";
import CategoryRow from "@/components/CategoryRow";
import { movies, getFeaturedMovies, getMoviesByCategory, searchMovies } from "@/data/movies";
import { Movie } from "@/types/movie";
import { useCreatorVideos } from "@/hooks/useVideoRegistry";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

export default function BrowsePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [publishedIPFSVideos, setPublishedIPFSVideos] = useState<any[]>([]);

    // Wallet connection
    const { address, isConnected } = useAccount();

    // Load videos from blockchain for connected wallet
    const { videos: onChainVideos, isLoading: isLoadingChain, refetch } = useCreatorVideos(address);

    // Load published IPFS videos from blockchain OR localStorage
    useEffect(() => {
        const loadVideos = () => {
            // Priority 1: Load from blockchain if wallet connected
            if (isConnected && onChainVideos && onChainVideos.length > 0) {
                console.log('📡 Loading videos from blockchain for:', address);
                const formattedVideos = onChainVideos.map((v) => ({
                    id: `ipfs-${v.ipfsHash}`,
                    slug: v.ipfsHash,
                    title: v.title,
                    thumbnail: '/placeholder-video.svg',
                    videoUrl: `https://gateway.pinata.cloud/ipfs/${v.ipfsHash}`,
                    pricePerMinute: parseFloat(formatEther(v.price)),
                    description: v.description,
                    category: v.category,
                    creator: 'Your Upload (On-Chain)',
                    duration: 120,
                    views: 0,
                    rating: 0,
                }));
                setPublishedIPFSVideos(formattedVideos);
                console.log(`✅ Loaded ${formattedVideos.length} video(s) from blockchain`);
                return;
            }

            // Priority 2: Fallback to localStorage if no blockchain videos
            try {
                const saved = localStorage.getItem('nitrogate_published_videos');
                if (saved) {
                    const videos = JSON.parse(saved);

                    // Remove duplicates based on IPFS hash
                    const uniqueVideos = [];
                    const seenHashes = new Set();

                    for (const v of videos) {
                        if (!seenHashes.has(v.ipfsHash)) {
                            seenHashes.add(v.ipfsHash);
                            uniqueVideos.push(v);
                        }
                    }

                    // If we removed duplicates, update localStorage
                    if (uniqueVideos.length < videos.length) {
                        console.log(`🧹 Cleaned ${videos.length - uniqueVideos.length} duplicate(s) from published videos`);
                        localStorage.setItem('nitrogate_published_videos', JSON.stringify(uniqueVideos));
                    }

                    const formattedVideos = uniqueVideos.map((v: any) => ({
                        id: `ipfs-${v.ipfsHash}`,
                        slug: v.ipfsHash, // Use IPFS hash as slug
                        title: v.title || v.name,
                        thumbnail: '/placeholder-video.svg', // Use placeholder since video can't be thumbnail
                        videoUrl: `https://gateway.pinata.cloud/ipfs/${v.ipfsHash}`,
                        pricePerMinute: parseFloat(v.price) || 0.00001,
                        description: v.description || 'No description',
                        category: v.category || 'Entertainment',
                        creator: 'Your Upload (LocalStorage)',
                        duration: 120,
                        views: 0,
                        rating: 0,
                    }));
                    setPublishedIPFSVideos(formattedVideos);
                    console.log(`✅ Loaded ${formattedVideos.length} video(s) from localStorage`);
                }
            } catch (error) {
                console.error('Error loading published videos:', error);
            }
        };

        loadVideos();
    }, [isConnected, address, onChainVideos]);

    const featuredMovie = getFeaturedMovies()[0];

    // Filter movies based on search and category
    const filteredMovies = useMemo(() => {
        let results = movies;

        // Apply search
        if (searchQuery.trim()) {
            results = searchMovies(searchQuery);
        }

        // Apply category filter
        if (selectedCategory !== "All") {
            results = results.filter(m => m.category === selectedCategory);
        }

        return results;
    }, [searchQuery, selectedCategory]);

    // Get movies by category for rows
    const actionMovies = getMoviesByCategory("Action");
    const documentaries = getMoviesByCategory("Documentary");
    // Combine IPFS videos with hardcoded movies (deduplicate by ID)
    const newOnBase = useMemo(() => {
        if (publishedIPFSVideos.length === 0) {
            return getMoviesByCategory("New on Base");
        }

        const combined = [...publishedIPFSVideos, ...getMoviesByCategory("New on Base")];
        const unique = [];
        const seenIds = new Set();

        for (const movie of combined) {
            if (!seenIds.has(movie.id)) {
                seenIds.add(movie.id);
                unique.push(movie);
            }
        }

        return unique;
    }, [publishedIPFSVideos]);

    const trending = getMoviesByCategory("Trending");

    const categories = ["All", "Action", "Documentary", "New on Base", "Trending"];

    return (
        <div className="min-h-screen bg-[#050505] pb-12">
            {/* Search & Filter Bar */}
            <div className="sticky top-16 z-40 bg-[#050505]/95 backdrop-blur-md border-b border-white/5 py-6 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search by title or creator ENS..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-zinc-900/50 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${selectedCategory === category
                                        ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                                        : "bg-zinc-900/50 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Results Count */}
                    {searchQuery && (
                        <div className="mt-4 text-sm text-zinc-400">
                            Found {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'} matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>

            {/* Featured Banner */}
            {!searchQuery && selectedCategory === "All" && featuredMovie && (
                <div className="px-6 mt-6">
                    <FeaturedBanner movie={featuredMovie} />
                </div>
            )}

            {/* Movie Grid (when searching or filtering) */}
            {(searchQuery || selectedCategory !== "All") && (
                <div className="px-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMovies.map((movie) => (
                            <div key={movie.id}>
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>

                    {filteredMovies.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🎬</div>
                            <h3 className="text-xl font-bold text-white mb-2">No movies found</h3>
                            <p className="text-zinc-400">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            )}

            {/* Category Rows (default view) */}
            {!searchQuery && selectedCategory === "All" && (
                <div className="mt-6">
                    <CategoryRow title="Action" movies={actionMovies} />
                    <CategoryRow title="Documentaries" movies={documentaries} />
                    <CategoryRow title="New on Base" movies={newOnBase} />
                    <CategoryRow title="Trending Now" movies={trending} />
                </div>
            )}
        </div>
    );
}

// Import MovieCard component (inline for now)
import MovieCard from "@/components/MovieCard";
