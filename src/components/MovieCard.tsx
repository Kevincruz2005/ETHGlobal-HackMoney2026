"use client";

import Link from "next/link";
import Image from "next/image";
import { Movie } from "@/types/movie";
import { Play, Clock, DollarSign, Zap } from "lucide-react";

interface MovieCardProps {
    movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
    const formatDuration = (seconds: number) => {
        if (seconds === 0) return "LIVE";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    return (
        <Link
            href={`/watch/${movie.slug}`}
            className="group relative block bg-zinc-900/50 border border-white/5 rounded-lg overflow-hidden hover:border-amber-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-zinc-800">
                <Image
                    src={movie.thumbnail}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:brightness-110 transition-all"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-black fill-black" />
                        </div>
                    </div>
                </div>

                {/* Featured Badge */}
                {movie.featured && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/90 backdrop-blur-sm rounded text-xs font-bold text-black">
                        FEATURED
                    </div>
                )}

                {/* Live Badge */}
                {movie.duration === 0 && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/90 backdrop-blur-sm rounded text-xs font-bold text-white flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-2 line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {movie.title}
                </h3>

                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-zinc-400">
                        {/* Duration */}
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(movie.duration)}
                        </span>

                        {/* Rating */}
                        <span className="flex items-center gap-1">
                            <span className="text-amber-400">★</span>
                            {movie.rating?.toFixed(1)}
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                        <Zap className="w-3 h-3 text-purple-400" />
                        {movie.pricePerMinute.toFixed(6)}/min
                    </div>
                </div>
            </div>
        </Link>
    );
}
