'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns'; // Renamed import from 'formatDate' to 'format' for consistency

// --- shadcn/ui Imports ---
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Loader2, Video, Upload, Send } from 'lucide-react';

interface Video {
    id: string;
    title: string;
    createdAt: string;
}

interface VideoSubmissionFormProps {
    challengeId: string;
    studentId: string; // The ID of the authenticated student
}

export default function VideoSubmissionForm({ challengeId, studentId }: VideoSubmissionFormProps) {
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedVideoId, setSelectedVideoId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVideosLoading, setIsVideosLoading] = useState(true);

    // --- Fetch Student's Videos ---
    useEffect(() => {
        async function fetchVideos() {
            setIsVideosLoading(true);
            try {
                const response = await fetch('/api/student/videos');
                if (!response.ok) throw new Error('Failed to fetch videos.');

                const data: Video[] = await response.json();
                setVideos(data);
                if (data.length > 0) {
                    setSelectedVideoId(data[0].id); // Select first video by default
                }
            } catch (e: any) {
                toast.error('Video Load Error', {
                    description: `Could not load your videos: ${e.message}`,
                });
            } finally {
                setIsVideosLoading(false);
            }
        }
        fetchVideos();
    }, []);

    // --- Submission Handler ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedVideoId) {
            toast.error('Selection Required', {
                description: 'Please select a video to submit before continuing.',
            });
            return;
        }

        setIsSubmitting(true);
        const submitToastId = toast.loading('Submitting video to challenge...');

        try {
            const response = await fetch('/api/student/challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoId: selectedVideoId, challengeId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Submission failed.');
            }

            toast.success(result.message || 'Video submitted successfully! 🎉', {
                id: submitToastId,
                description: `Video ID: ${selectedVideoId}`,
            });
        } catch (e: any) {
            toast.error(`Submission Error`, {
                id: submitToastId,
                description: e.message || "An unknown error occurred during submission.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isVideosLoading) {
        return (
            <div className="p-4 flex items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading your video library...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center text-foreground">
                <Video className="w-5 h-5 mr-2 text-primary" /> Submit Your Solution
            </h3>

            {videos.length === 0 ? (
                <div className="p-4 bg-muted rounded-lg border border-dashed text-center space-y-2">
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                        You haven't uploaded any videos yet.
                    </p>
                    <Button variant="link" className="text-sm">
                        Go to Upload Page
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="video-select" className="mb-2 block">
                            Select one of your uploaded videos:
                        </Label>

                        {/* Shadcn Select Component */}
                        <Select
                            value={selectedVideoId}
                            onValueChange={setSelectedVideoId}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger id="video-select">
                                <SelectValue placeholder="Choose a video..." />
                            </SelectTrigger>
                            <SelectContent>
                                {videos.map((video) => (
                                    <SelectItem key={video.id} value={video.id}>
                                        {video.title} ({format(new Date(video.createdAt), 'MMM dd, yyyy')})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit Video to Challenge
                            </>
                        )}
                    </Button>
                </form>
            )}
        </div>
    );
}