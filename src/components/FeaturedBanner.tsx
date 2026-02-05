"use client";

import Link from "next/link";
import Image from "next/image";
import { Movie } from "@/types/movie";
import { Play, Clock, DollarSign, Star } from "lucide-react";

interface FeaturedBannerProps {
    movie: Movie;
}

export default function FeaturedBanner({ movie }: FeaturedBannerProps) {
    const formatDuration = (seconds: number) => {
        if (seconds === 0) return "LIVE STREAM";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="relative h-[500px] mb-12 overflow-hidden rounded-xl">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={movie.thumbnail}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center px-12">
                <div className="max-w-2xl">
                    {/* Featured Badge */}
                    <div className="inline-block px-3 py-1 bg-amber-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-black mb-4">
                        ⭐ BLOCKBUSTER
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                        {movie.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex items-center gap-6 text-sm text-zinc-300 mb-6">
                        <span className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            {movie.rating?.toFixed(1)}/5
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {formatDuration(movie.duration)}
                        </span>
                        <span className="px-2 py-1 bg-zinc-800/80 rounded text-amber-400 font-mono font-bold">
                            {movie.pricePerMinute.toFixed(4)} USDC/min
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-lg text-zinc-300 mb-8 leading-relaxed line-clamp-3">
                        {movie.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/watch/${movie.slug}`}
                            className="flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-bold text-lg transition-colors shadow-lg shadow-amber-500/20"
                        >
                            <Play className="w-5 h-5 fill-black" />
                            Watch Now
                        </Link>

                        <div className="px-4 py-3 bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-white/10">
                            <div className="text-xs text-zinc-400">Estimated cost for full movie</div>
                            <div className="text-lg font-mono font-bold text-amber-400">
                                ${(movie.pricePerMinute * (movie.duration / 60)).toFixed(2)} USDC
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
