// app/dashboard/student/videos/[videoId]/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { Loader2, MessageSquare, Clock, Calendar, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Configuration: Replace with your actual S3 bucket public URL prefix
// Example: https://mentor-clip.s3.us-east-1.amazonaws.com
const S3_PRESIGNED_BASE_URL = process.env.S3_PRESIGNED_BASE_URL || "https://mentor-clip.t3.storage.dev" ;


// Define the complex structure of the fetched video data
interface Supervisor {
    name: string;
}

interface VideoNote {
    id: string;
    content: string;
    timestampMs: number | null;
    createdAt: string;
    supervisor: Supervisor;
}

interface VideoDetail {
    id: string;
    title: string;
    description: string | null;
    s3Key: string;
    fileSize: number;
    contentType: string;
    createdAt: string;
    notes: VideoNote[];
}

interface VideoDetailPageProps {
    params: {
        videoId: string;
    };
}

// Helper to convert milliseconds to a formatted time string (e.g., 01:30)
const formatTimestamp = (ms: number | null) => {
    if (ms === null) return 'N/A';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function VideoDetailPage({ params }: VideoDetailPageProps) {
    const { videoId } = params;
    const [video, setVideo] = useState<VideoDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideoDetails = async () => {
            try {
                const response = await fetch(`/api/videos/${videoId}`, { method: 'GET' });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Failed to fetch video. Status: ${response.status}`);
                }

                const data: VideoDetail = await response.json();
                setVideo(data);

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideoDetails();
    }, [videoId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
                <p>Loading video details...</p>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="p-4 text-red-700 bg-red-100 border border-red-200 rounded-md">
                <h2 className="font-bold mb-2">Error</h2>
                <p>{error || "Could not retrieve video details. It may have been deleted or you lack permission."}</p>
                <Link href="/dashboard/student/videos" className="mt-4 text-primary underline block">
                    Go back to video list
                </Link>
            </div>
        );
    }

    const videoUrl = `${S3_PRESIGNED_BASE_URL}/${video.s3Key}`;
    console.log(videoUrl);
    return (
        <div className="container mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/student/videos">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">{video.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Video Player */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-0">
                            {/* Video Player Section */}
                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                <video
                                    src={videoUrl}
                                    controls
                                    preload="metadata"
                                    className="w-full h-full object-contain"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Video Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Video Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <p className="text-muted-foreground">{video.description || "No detailed description provided."}</p>
                            <div className="flex items-center space-x-6 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span>Uploaded on: {formatDate(video.createdAt)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="secondary">
                                        {video.contentType.split('/')[1]?.toUpperCase() || 'VIDEO'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Supervisor Notes */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl">Supervisor Feedback</CardTitle>
                            <Badge variant={video.notes.length > 0 ? "default" : "secondary"}>
                                {video.notes.length} Note{video.notes.length !== 1 ? 's' : ''}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                            {video.notes.length === 0 ? (
                                <p className="text-muted-foreground italic">No feedback has been added by a supervisor yet.</p>
                            ) : (
                                video.notes.map((note) => (
                                    <div key={note.id} className="border-l-4 border-primary/70 pl-3 py-2 bg-muted/50 rounded-sm">
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="font-semibold text-primary">
                                                {note.supervisor.name}
                                            </span>
                                            <div className="flex items-center space-x-2 text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                <span>Time: {formatTimestamp(note.timestampMs)}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm">{note.content}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDate(note.createdAt)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}