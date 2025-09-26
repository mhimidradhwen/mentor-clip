"use client"

import React, { useEffect, useState } from "react"
import { Upload, Calendar, MessageSquare, ListVideo, Play, User } from "lucide-react" // Added 'User' icon
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

const S3_PRESIGNED_BASE_URL = process.env.S3_PRESIGNED_BASE_URL || "https://mentor-clip.t3.storage.dev"

interface VideoNote {
    id: string
}

interface Uploader {
    name: string
    email: string
}

interface Video {
    id: string
    title: string
    description: string | null
    s3Key: string
    fileSize: number
    contentType: string
    createdAt: string
    notes: VideoNote[]
    // 🎯 NEW: Added the uploader relationship
    uploader: Uploader
}

function SupervisorVideosPage() {
    const [videos, setVideos] = useState<Video[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // NOTE: Using /api/videos as per the comprehensive GET logic we established
                const response = await fetch("/api/supervisor/videos", { method: "GET" })

                if (!response.ok) {
                    // Check if the error is due to authorization (403 or 401)
                    if (response.status === 403 || response.status === 401) {
                        throw new Error("You are not authorized to view all student videos. (Supervisor access required)")
                    }
                    const errorData = await response.json()
                    throw new Error(errorData.error || `Failed to fetch videos. Status: ${response.status}`)
                }

                const data: Video[] = await response.json()
                setVideos(data)
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred."
                setError(errorMessage)
            } finally {
                setIsLoading(false)
            }
        }

        fetchVideos()
    }, [])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
    }

    // --- Loading, Error, and Empty States (Unchanged) ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto"></div>
                    <p className="text-neutral-600 text-sm">Loading videos</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                    <p className="text-neutral-900 font-medium">Unable to load videos</p>
                    <p className="text-neutral-600 text-sm">{error}</p>
                </div>
            </div>
        )
    }

    if (videos.length === 0) {
        return (
            <div className="min-h-screen">
                <div className="border-b border-neutral-100 bg-white">
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-medium text-neutral-900">Videos</h1>
                                <p className="text-neutral-600 text-sm mt-1">Student's videos</p>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 py-24">
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto">
                            <ListVideo className="w-8 h-8 text-neutral-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-medium text-neutral-900">No videos yet</h2>
                            <p className="text-neutral-600 text-sm max-w-sm mx-auto">
                                No videos have been uploaded by students.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        )
    }

    // --- Main Display ---
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900">All Student Videos</h1>
                        <p className="text-neutral-600 text-sm mt-1">
                            Reviewing {videos.length} video{videos.length !== 1 ? "s" : ""} from students.
                        </p>
                    </div>
                    {/* Assuming this page is ONLY for supervisors, we can remove the student upload link */}
                    {/* If a supervisor can also upload videos, change the href */}
                    {/* <Link href="/dashboard/student/upload" className={buttonVariants({ variant: "default" })}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Video
                    </Link> */}
                </div>
            </div>

            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {videos.map((video) => (
                        <div key={video.id} className="group">
                            {/* Assuming the supervisor uses a different path to view videos */}
                            <Link href={`/dashboard/supervisor/videos/${video.id}`} className="block">
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

                                    {/* 🎯 NEW: Display Student Name */}
                                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                                        <User className="h-3.5 w-3.5" />
                                        <span>{video.uploader.name}</span>
                                    </div>
                                    {/* ----------------------------- */}

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
        </div>
    )
}

export default SupervisorVideosPage