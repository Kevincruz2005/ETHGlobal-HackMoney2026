"use client";

import { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";

interface CategoryRowProps {
    title: string;
    movies: Movie[];
}

export default function CategoryRow({ title, movies }: CategoryRowProps) {
    if (movies.length === 0) return null;

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 px-6">{title}</h2>

            <div className="relative px-6">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {movies.map((movie) => (
                        <div key={movie.id} className="flex-shrink-0 w-72">
                            <MovieCard movie={movie} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
