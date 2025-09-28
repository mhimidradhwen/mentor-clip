// components/VideoPlayer.tsx
'use client';

import { useState, useEffect } from 'react';

interface VideoPlayerProps {
    s3Key: string;
    videoTitle: string;
}

export default function VideoPlayer({ s3Key, videoTitle }: VideoPlayerProps) {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Function to fetch the secure, temporary video URL
        async function fetchPresignedUrl() {
            setIsLoading(true);
            setError(null);

            try {
                // API call to your backend to generate a secure, temporary streaming URL from the s3Key
                const response = await fetch(`/api/video/stream?key=${s3Key}`);

                if (!response.ok) {
                    throw new Error('Failed to get video streaming URL.');
                }

                const data = await response.json();

                if (data.url) {
                    setVideoUrl(data.url);
                } else {
                    throw new Error('Streaming URL not provided by the API.');
                }
            } catch (err: any) {
                console.error("Video stream error:", err);
                setError('Cannot load video stream.');
            } finally {
                setIsLoading(false);
            }
        }

        if (s3Key) {
            fetchPresignedUrl();
        } else {
            setError('Missing S3 key.');
            setIsLoading(false);
        }
    }, [s3Key]);

    if (isLoading) {
        return <div className="flex items-center justify-center w-full h-full bg-gray-900 text-white">Loading Video... 🎥</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center w-full h-full bg-red-900 text-white p-4">Error: {error}</div>;
    }

    if (!videoUrl) {
        return <div className="flex items-center justify-center w-full h-full bg-gray-800 text-white">Video not available.</div>;
    }

    return (
        <video
            controls
            src={videoUrl}
            title={videoTitle}
            className="w-full h-full object-cover"
        >
            Your browser does not support the video tag.
        </video>
    );
}