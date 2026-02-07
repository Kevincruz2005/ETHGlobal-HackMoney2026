// Clean up duplicate IPFS videos in localStorage
// Run this in browser console: copy and paste, then press Enter

(() => {
    console.log('🧹 Cleaning up duplicate videos...');

    // Clean published videos
    const published = localStorage.getItem('nitrogate_published_videos');
    if (published) {
        try {
            const videos = JSON.parse(published);
            const unique = [];
            const seen = new Set();

            for (const video of videos) {
                if (!seen.has(video.ipfsHash)) {
                    seen.add(video.ipfsHash);
                    unique.push(video);
                }
            }

            localStorage.setItem('nitrogate_published_videos', JSON.stringify(unique));
            console.log(`✅ Published videos: ${videos.length} → ${unique.length} (removed ${videos.length - unique.length} duplicates)`);
        } catch (e) {
            console.error('Failed to clean published videos:', e);
        }
    }

    // Clean uploaded videos
    const uploaded = localStorage.getItem('nitrogate_uploaded_videos');
    if (uploaded) {
        try {
            const videos = JSON.parse(uploaded);
            const unique = [];
            const seen = new Set();

            for (const video of videos) {
                if (!seen.has(video.ipfsHash)) {
                    seen.add(video.ipfsHash);
                    unique.push(video);
                }
            }

            localStorage.setItem('nitrogate_uploaded_videos', JSON.stringify(unique));
            console.log(`✅ Uploaded videos: ${videos.length} → ${unique.length} (removed ${videos.length - unique.length} duplicates)`);
        } catch (e) {
            console.error('Failed to clean uploaded videos:', e);
        }
    }

    console.log('🎉 Cleanup complete! Refresh the page to see the changes.');
})();
