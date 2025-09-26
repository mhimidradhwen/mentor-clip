"use client"

import type { Session } from "@/lib/session"
import { Play, Calendar, MessageSquare, Upload } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

const S3_PRESIGNED_BASE_URL = process.env.S3_PRESIGNED_BASE_URL || "https://mentor-clip.t3.storage.dev"

interface StudentRecentsVideosProps {
    session: Session
}

interface Video {
    id: string
    title: string
    description?: string
    s3Key: string
    fileSize: number
    contentType: string
    userId: string
    createdAt: string
    updatedAt: string
    notes: Array<{
        id: string
        content: string
        timestampMs: number
        createdAt: string
    }>
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

export default function StudentRecentsVideos({ session }: StudentRecentsVideosProps) {
    const [videos, setVideos] = useState<Video[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const response = await fetch("/api/videos")

                if (!response.ok) {
                    throw new Error("Failed to fetch videos")
                }

                const data = await response.json()
                setVideos(data.slice(0, 6))
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setIsLoading(false)
            }
        }

        fetchVideos()
    }, [])

    if (isLoading) {
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-medium text-neutral-900">Recent Videos</h2>
                        <p className="text-neutral-600 text-sm mt-1">Your latest uploads</p>
                    </div>
                    <Link
                        href="/dashboard/student/videos"
                        className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                        View All
                    </Link>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                        <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto"></div>
                        <p className="text-neutral-600 text-sm">Loading videos</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-medium text-neutral-900">Recent Videos</h2>
                        <p className="text-neutral-600 text-sm mt-1">Your latest uploads</p>
                    </div>
                    <Link
                        href="/dashboard/student/videos"
                        className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                        View All
                    </Link>
                </div>
                <div className="text-center py-12 space-y-4 max-w-md mx-auto">
                    <p className="text-neutral-900 font-medium">Unable to load videos</p>
                    <p className="text-neutral-600 text-sm">{error}</p>
                </div>
            </div>
        )
    }

    if (!videos || videos.length === 0) {
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-medium text-neutral-900">Recent Videos</h2>
                        <p className="text-neutral-600 text-sm mt-1">Your latest uploads</p>
                    </div>
                    <Link
                        href="/dashboard/student/videos"
                        className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                        View All
                    </Link>
                </div>
                <div className="text-center py-12 space-y-6">
                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-neutral-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-medium text-neutral-900">No videos yet</h3>
                        <p className="text-neutral-600 text-sm max-w-sm mx-auto">
                            Upload your first video to get started and receive feedback from your mentor.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/student/upload"
                        className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                    >
                        <Upload className="h-4 w-4" />
                        Upload Video
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-medium text-neutral-900">Recent Videos</h2>
                    <p className="text-neutral-600 text-sm mt-1">
                        {videos.length} recent video{videos.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Link
                    href="/dashboard/student/videos"
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <div key={video.id} className="group">
                        <Link href={`/dashboard/student/videos/${video.id}`} className="block">
                            <div className="relative aspect-video bg-neutral-100 rounded-xl overflow-hidden mb-4 group-hover:shadow-lg transition-all duration-300">
                                <video
                                    src={`${S3_PRESIGNED_BASE_URL}/${video.s3Key}`}
                                    preload="metadata"
                                    className="w-full h-full object-cover"
                                >
                                    Your browser does not support the video tag.
                                </video>

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Play className="w-5 h-5 text-neutral-900 ml-0.5" />
                                    </div>
                                </div>

                                <div className="absolute top-3 right-3">
                  <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                    {formatFileSize(video.fileSize)}
                  </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-medium text-neutral-900 line-clamp-2 group-hover:text-neutral-700 transition-colors">
                                    {video.title}
                                </h3>

                                <div className="flex items-center gap-4 text-xs text-neutral-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(video.createdAt)}</span>
                                    </div>
                                    {video.notes.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" />
                                            <span>
                        {video.notes.length} note{video.notes.length !== 1 ? "s" : ""}
                      </span>
                                        </div>
                                    )}
                                </div>

                                {video.description && <p className="text-sm text-neutral-600 line-clamp-2">{video.description}</p>}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}
