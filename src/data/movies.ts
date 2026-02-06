import { Movie } from '@/types/movie';

export const DEMO_CREATOR_ADDRESS = '0x4184bb731b3ed0e22eDC425901510A65a4f4aFA2' as const;

export const movies: Movie[] = [
    {
        id: '1',
        slug: 'big-buck-bunny',
        title: 'Big Buck Bunny',
        description: 'A large and lovable rabbit deals with three tiny bullies who enjoy harassing him in this animated comedy.',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        videoType: 'mp4',
        duration: 596, // 9:56
        category: 'Action',
        creatorAddress: DEMO_CREATOR_ADDRESS,
        pricePerMinute: 0.00001,
        featured: true,
        rating: 4.8,
        views: 12543
    },
    {
        id: '2',
        slug: 'elephants-dream',
        title: 'Elephants Dream',
        description: 'Two strange characters explore their surreal world in this experimental short film.',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        videoType: 'mp4',
        duration: 653, // 10:53
        category: 'Documentary',
        creatorAddress: DEMO_CREATOR_ADDRESS,
        pricePerMinute: 0.00001,
        rating: 4.2,
        views: 8421
    },
    {
        id: '3',
        slug: 'for-bigger-blazes',
        title: 'For Bigger Blazes',
        description: 'Experience the thrill of fire and action in this high-octane adventure.',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        videoType: 'mp4',
        duration: 15,
        category: 'Action',
        creatorAddress: DEMO_CREATOR_ADDRESS,
        pricePerMinute: 0.00001,
        rating: 4.9,
        views: 23456
    },
    {
        id: '4',
        slug: 'sintel',
        title: 'Sintel',
        description: 'A lonely young woman named Sintel helps and befriends a dragon in this epic fantasy tale.',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        videoType: 'mp4',
        duration: 888, // 14:48
        category: 'Action',
        creatorAddress: DEMO_CREATOR_ADDRESS,
        pricePerMinute: 0.00001,
        featured: true,
        rating: 4.7,
        views: 15234
    },
    {
        id: '5',
        slug: 'subaru-outback',
        title: 'Subaru Outback On Street',
        description: 'Documentary footage of the Subaru Outback navigating city streets.',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        videoType: 'mp4',
        duration: 28,
        category: 'Documentary',
        creatorAddress: DEMO_CREATOR_ADDRESS,
        pricePerMinute: 0.00001,
        rating: 4.1,
        views: 5432
    },
    {
        id: '6',
        slug: 'tears-of-steel',
        title: 'Tears of Steel',
        description: 'Sci-fi thriller set in a post-apocalyptic world where reality and synthetic worlds collide.',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        videoType: 'mp4',
        duration: 734, // 12:14
        category: 'New on Base',
        creatorAddress: DEMO_CREATOR_ADDRESS,
        pricePerMinute: 0.00001,
        rating: 4.6,
        views: 9876
    },
    {
        id: '7',
        slug: 'volkswagen-gti',
        title: 'Volkswagen GTI Review',
        description: 'An in-depth review of the iconic Volkswagen GTI sports car.',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/VolkswagenGTIReview.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
        videoType: 'mp4',
        duration: 22,
        category: 'Trending',
        creatorAddress: DEMO_CREATOR_ADDRESS,
        pricePerMinute: 0.00001,
        rating: 4.4,
        views: 11234
    },
    {
        id: '8',
        slug: 'we-are-going-on-bullrun',
        title: 'We Are Going On Bullrun',
        description: 'Follow the excitement of the ultimate car rally across stunning landscapes.',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WeAreGoingOnBullrun.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        videoType: 'mp4',
        duration: 20,
        category: 'Trending',
        creatorAddress: DEMO_CREATOR_ADDRESS,
        pricePerMinute: 0.00001,
        rating: 4.5,
        views: 18765
    },
    {
        id: '9',
        slug: 'what-car-can-you-get',
        title: 'What Car Can You Get For A Grand',
        description: 'Exploring the best cars you can buy on a tight budget.',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WhatCarCanYouGetForAGrand.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
        videoType: 'mp4',
        duration: 21,
        category: 'Documentary',
        creatorAddress: DEMO_CREATOR_ADDRESS,
        pricePerMinute: 0.00001,
        rating: 4.3,
        views: 6543
    },
    {
        id: '10',
        slug: 'livestream-demo',
        title: 'Livestream Demo (HLS)',
        description: 'High-quality livestream demonstration using HLS adaptive streaming.',
        thumbnail: 'https://lp-playback.com/hls/f5eese9wwl88k4g8/static360.jpg',
        videoUrl: 'https://lp-playback.com/hls/f5eese9wwl88k4g8/index.m3u8',
        videoType: 'hls',
        duration: 0, // live stream
        category: 'New on Base',
        creatorAddress: DEMO_CREATOR_ADDRESS,
        pricePerMinute: 0.00001,
        featured: true,
        rating: 5.0,
        views: 34567
    }
];

// Helper functions
export function getMovieBySlug(slug: string): Movie | undefined {
    return movies.find(m => m.slug === slug);
}

export function getMoviesByCategory(category: Movie['category']): Movie[] {
    return movies.filter(m => m.category === category);
}

export function getFeaturedMovies(): Movie[] {
    return movies.filter(m => m.featured);
}

export function searchMovies(query: string): Movie[] {
    const lowerQuery = query.toLowerCase();
    return movies.filter(m =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery)
    );
}
