"use client"
import React, { useState, useEffect } from 'react';
import { Info, X, Play, MessageSquare, Loader2, Video, FileText, ChevronDown } from 'lucide-react';

// Shadcn/ui Components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
// Assuming you have or can add the Skeleton and Accordion components from shadcn/ui
import { Skeleton } from "@/components/ui/skeleton";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// --- Configuration Constant ---
// NOTE: This constant relies on process.env being available in your Next.js environment
const S3_PRESIGNED_BASE_URL = process.env.S3_PRESIGNED_BASE_URL || "https://mentor-clip.t3.storage.dev";

// --- Type Definitions (UPDATED: Added s3Key to VideoData) ---

interface VideoData {
    id: string;
    title: string;
    createdAt: Date;
    s3Key: string; // Added S3 key for video playback
}

interface NoteData {
    id: string;
    content: string;
    timestampMs: number | null;
    video: { title: string };
}

export interface UserDetails {
    id: string;
    name: string;
    email: string;
    role: string;
    studentId: string | null;
    professionalId: string | null;
    class: string | null;
    createdAt: string;
    updatedAt: string;
    uploadedVideos: VideoData[];
    createdNotes: NoteData[];
}

// --- Utility Functions ---

const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatTimestamp = (ms: number | null) => {
    if (ms === null) return 'N/A';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// --- Player Component (Simple HTML5 implementation) ---

interface PlayerProps {
    src: string;
    title: string;
}

const Player: React.FC<PlayerProps> = ({ src, title }) => (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
        <video
            controls
            src={src}
            title={title}
            className="w-full h-full object-contain"
        >
            Your browser does not support the video tag.
        </video>
    </div>
);

// --- Loading Skeleton Component ---

const UserDetailsLoadingSkeleton: React.FC = () => (
    <div className="p-6 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
            {/* Basic Info Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-52" />
                <div className="flex space-x-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                </div>
            </div>
            {/* Identifiers Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
            </div>
        </div>
        <Separator />
        {/* List Skeleton */}
        <div className="space-y-4">
            <Skeleton className="h-6 w-56" />
            <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    </div>
);


// --- User Details Modal Component ---

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserDetails | null;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user }) => {
    const isLoading = !user;

    // State for the collapsible video player
    const [activeVideo, setActiveVideo] = useState<VideoData | null>(null);

    // Close the video player when the entire modal closes
    useEffect(() => {
        if (!isOpen) {
            setActiveVideo(null);
        }
    }, [isOpen]);

    const getRoleVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'professional':
            case 'supervisor':
                return 'default';
            case 'student':
            default:
                return 'secondary';
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Adjusted max-width for better use of space */}
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-2xl font-extrabold flex items-center tracking-tight">
                        <Info className="w-5 h-5 mr-3 text-primary" />
                        {isLoading ? 'Loading User Details...' : user.name}
                    </DialogTitle>
                    {!isLoading && (
                        <p className="text-sm text-muted-foreground mt-1">
                            Detailed profile and activity log for {user.email}.
                        </p>
                    )}
                </DialogHeader>

                <Separator />

                {/* Collapsible Video Player Section */}
                {!isLoading && (
                    <Accordion
                        type="single"
                        collapsible
                        // Control Accordion state based on whether a video is active
                        value={activeVideo ? 'video-player' : ''}
                        onValueChange={(value) => {
                            if (value !== 'video-player') setActiveVideo(null);
                        }}
                        className="w-full px-6 pt-4 border-b"
                    >
                        <AccordionItem value="video-player" className="border-b-0">
                            <AccordionTrigger
                                className="flex justify-between items-center text-base font-semibold text-gray-800 hover:no-underline p-0"
                                // Disable trigger if no video is selected
                                disabled={!activeVideo}
                            >
                                <span className="flex items-center">
                                    <Play className={`w-4 h-4 mr-2 ${activeVideo ? 'text-primary' : 'text-muted-foreground'}`} />
                                    {activeVideo ? `Playing: ${activeVideo.title}` : 'Select a video to preview'}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 pb-0">
                                {/* Strict check for activeVideo and a valid s3Key string */}
                                {activeVideo && typeof activeVideo.s3Key === 'string' && activeVideo.s3Key.length > 0 ? (
                                    <Player
                                        src={`${S3_PRESIGNED_BASE_URL}/${activeVideo.s3Key}`}
                                        title={activeVideo.title}
                                    />
                                ) : (
                                    <p className="text-center text-red-500 py-4 text-sm">Error: Video file reference is invalid. Check the data source for a missing S3 key.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
                {/* End of Collapsible Video Player Section */}

                {isLoading ? (
                    <UserDetailsLoadingSkeleton />
                ) : (
                    <ScrollArea className="flex-1 px-6 pt-4 pb-6">
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold border-b pb-2 mb-2">Basic Information</h4>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Email:</strong> <span className="text-muted-foreground">{user.email}</span></p>
                                    <p className="flex items-center">
                                        <strong>Role:</strong>
                                        <Badge
                                            variant={getRoleVariant(user.role)}
                                            className="ml-2 capitalize"
                                        >
                                            {user.role}
                                        </Badge>
                                    </p>
                                    <p><strong>Joined:</strong> <span className="text-muted-foreground">{formatDate(user.createdAt)}</span></p>
                                    <p><strong>Last Update:</strong> <span className="text-muted-foreground">{formatDate(user.updatedAt)}</span></p>
                                </div>
                            </div>

                            {/* Identifiers */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold border-b pb-2 mb-2">Identifiers & Grouping</h4>
                                <div className="space-y-2 text-sm">
                                    <p><strong>User ID:</strong> <span className="font-mono text-xs break-all text-muted-foreground">{user.id}</span></p>
                                    <p><strong>Student ID:</strong> <span className="text-muted-foreground">{user.studentId || 'N/A'}</span></p>
                                    <p><strong>Professional ID:</strong> <span className="text-muted-foreground">{user.professionalId || 'N/A'}</span></p>
                                    <p><strong>Class/Group:</strong> <span className="text-muted-foreground">{user.class || 'N/A'}</span></p>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Uploaded Videos Section - Interaction with s3Key check */}
                        <section className="mb-8">
                            <h3 className="text-xl font-bold flex items-center text-gray-800 mb-4">
                                <Video className="w-5 h-5 mr-2 text-primary/80" />
                                Uploaded Videos ({user.uploadedVideos.length})
                            </h3>
                            {user.uploadedVideos.length > 0 ? (
                                <div className="space-y-2">
                                    {user.uploadedVideos.map(video => {
                                        // Strict check for a playable video
                                        const isPlayable = typeof video.s3Key === 'string' && video.s3Key.length > 0;

                                        return (
                                            <div
                                                key={video.id}
                                                className={`p-3 border rounded-lg flex justify-between items-center transition-colors group ${
                                                    isPlayable
                                                        ? 'hover:bg-accent/50 cursor-pointer'
                                                        : 'bg-muted/30 text-muted-foreground cursor-not-allowed'
                                                }`}
                                                // Only set activeVideo if it is playable
                                                onClick={() => {
                                                    if (isPlayable) {
                                                        setActiveVideo(video);
                                                    }
                                                }}
                                            >
                                                <span className="flex items-center text-sm font-medium text-foreground truncate">
                                                    {isPlayable ? (
                                                        <Play className="w-4 h-4 mr-3 text-primary group-hover:text-primary-foreground transition-colors" />
                                                    ) : (
                                                        <X className="w-4 h-4 mr-3 text-destructive" />
                                                    )}
                                                    {video.title}
                                                    {!isPlayable && <Badge variant="destructive" className="ml-3">Missing File</Badge>}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                                    {formatDate(video.createdAt.toString())}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic text-sm">No videos uploaded by this user.</p>
                            )}
                        </section>

                        <Separator className="my-6" />

                        {/* Provided Notes Section */}
                        <section className="mb-6">
                            <h3 className="text-xl font-bold flex items-center text-gray-800 mb-4">
                                <FileText className="w-5 h-5 mr-2 text-primary/80" />
                                Provided Notes ({user.createdNotes.length})
                            </h3>
                            {user.createdNotes.length > 0 ? (
                                <div className="space-y-3">
                                    {user.createdNotes.map(note => (
                                        <div
                                            key={note.id}
                                            className="p-4 border-l-4 border-accent bg-card transition-shadow hover:shadow-sm rounded-lg"
                                        >
                                            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center">
                                                <MessageSquare className="w-3 h-3 mr-1 text-accent-foreground" />
                                                <span className="font-semibold text-foreground/90 mr-2">{note.video.title}</span>
                                                @ {formatTimestamp(note.timestampMs)}
                                            </p>
                                            <p className="text-sm text-foreground/80 leading-relaxed mt-1">
                                                {note.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic text-sm">No notes provided by this user (acting as supervisor).</p>
                            )}
                        </section>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
};