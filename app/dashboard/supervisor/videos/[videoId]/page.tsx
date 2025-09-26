// app/dashboard/supervisor/videos/[videoId]/page.tsx

import { notFound } from 'next/navigation'
import { getSession } from "@/lib/session"
import { PrismaClient } from "@/lib/generated/prisma"
import { Separator } from "@/components/ui/separator"
import VideoDetailClient from "@/components/supervisor/VideoDetailClient";

const prisma = new PrismaClient()
const S3_PRESIGNED_BASE_URL = process.env.S3_PRESIGNED_BASE_URL || "https://mentor-clip.t3.storage.dev"

// Define the types for the data fetched from the database
interface NoteSupervisor {
    name: string
}

interface VideoNote {
    id: string
    content: string
    timestampMs: number | null
    createdAt: Date
    supervisor: NoteSupervisor // The supervisor who wrote the note
}

interface Uploader {
    id: string
    name: string
    email: string
}

interface VideoDetail {
    id: string
    title: string
    description: string | null
    s3Key: string
    fileSize: number
    contentType: string
    createdAt: Date
    uploader: Uploader // The student who uploaded the video
    notes: VideoNote[]
}

interface VideoDetailPageProps {
    params: {
        videoId: string
    }
}

// Server Component to fetch data
async function fetchVideoDetails(videoId: string): Promise<VideoDetail | null> {
    try {
        // We do NOT need to check the uploader ID here because the supervisor is allowed to see all videos.
        const video = await prisma.video.findFirst({
            where: {
                id: videoId,
            },
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                notes: {
                    include: {
                        supervisor: {
                            select: {
                                name: true, // Name of the note creator
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc', // Show notes in chronological order
                    }
                },
            },
        })

        if (!video) return null

        // Ensure notes dates are serialized correctly (Date object to string for client)
        const serializableNotes: VideoNote[] = video.notes.map(note => ({
            ...note,
            createdAt: note.createdAt, // This will be passed to the client which handles Date objects
        }))

        // Return a clean, typed object
        return {
            ...video,
            createdAt: video.createdAt,
            notes: serializableNotes,
        } as VideoDetail

    } catch (error) {
        console.error("Database error fetching video details:", error)
        return null
    }
}

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
    const session = await getSession()

    // 1. Authorization Check (Supervisor)
    if (!session || session.user.role !== 'supervisor') {
        // Redirect or show a general error if not authorized
        return notFound()
    }

    // 2. Data Fetching
    const videoData = await fetchVideoDetails(params.videoId)

    if (!videoData) {
        return notFound()
    }

    const videoUrl = `${S3_PRESIGNED_BASE_URL}/${videoData.s3Key}`

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900">{videoData.title}</h1>
                <p className="text-lg text-neutral-600 mt-1">
                    Uploaded by: <span className="font-medium text-blue-600">{videoData.uploader.name}</span>
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                    Uploaded on: {videoData.createdAt.toLocaleDateString()}
                </p>
                {videoData.description && (
                    <p className="text-neutral-700 mt-4">{videoData.description}</p>
                )}
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Video Player (takes 2/3 space) */}
                <div className="lg:col-span-2">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                        <video
                            src={videoUrl}
                            controls
                            className="w-full h-full object-contain"
                            poster="/api/video-thumbnail" // Placeholder for an actual thumbnail endpoint
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>

                {/* Notes and Form (takes 1/3 space) */}
                <div className="lg:col-span-1">
                    {/* The client component handles interactivity (adding notes) */}
                    <VideoDetailClient
                        initialVideoData={videoData}
                        currentSupervisorId={session.user.id}
                        currentSupervisorName={session.user.name}
                        videoUrl={videoUrl}
                    />
                </div>
            </div>
        </div>
    )
}