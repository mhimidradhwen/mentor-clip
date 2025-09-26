// app/dashboard/supervisor/videos/[videoId]/video-detail-client.tsx
"use client"

import React, { useState, useRef } from 'react'
import { MessageSquare, Clock, Plus, Loader2 } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner' // Assuming you use a toast notification library

// Re-defining the shared types for the client component
interface NoteSupervisor {
    name: string
}

interface VideoNote {
    id: string
    content: string
    timestampMs: number | null
    createdAt: string | Date // Use string/Date for consistency
    supervisor: NoteSupervisor
}

interface VideoDetail {
    id: string
    title: string
    description: string | null
    s3Key: string
    fileSize: number
    contentType: string
    createdAt: Date
    uploader: { id: string, name: string, email: string }
    notes: VideoNote[]
}

interface VideoDetailClientProps {
    initialVideoData: VideoDetail
    currentSupervisorId: string
    currentSupervisorName: string
    videoUrl: string
}

const VideoDetailClient: React.FC<VideoDetailClientProps> = ({
                                                                 initialVideoData,
                                                                 currentSupervisorId,
                                                                 currentSupervisorName,
                                                             }) => {
    const [notes, setNotes] = useState<VideoNote[]>(initialVideoData.notes)
    const [newNoteContent, setNewNoteContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Helper to format milliseconds to a display time (e.g., 00:30)
    const formatTime = (ms: number | null) => {
        if (ms === null) return 'General'
        const totalSeconds = Math.floor(ms / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    // Function to seek the video player to the timestamp of the note
    const handleSeekToNote = (timestampMs: number | null) => {
        if (videoRef.current && timestampMs !== null) {
            videoRef.current.currentTime = timestampMs / 1000
            videoRef.current.play()
        }
    }

    // API Call to add a new note
    const handleAddNote = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!newNoteContent.trim()) return

        setIsSubmitting(true)
        const videoElement = videoRef.current

        // Optionally capture the current video timestamp
        const currentTimestampMs = videoElement ? Math.floor(videoElement.currentTime * 1000) : null

        const noteData = {
            content: newNoteContent.trim(),
            timestampMs: currentTimestampMs,
            videoId: initialVideoData.id,
            supervisorId: currentSupervisorId,
        }

        try {
            // Assuming you create a new POST endpoint at /api/videos/{videoId}/notes
            const response = await fetch(`/api/supervisor/videos/${initialVideoData.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to add note.')
            }

            const newNote = await response.json()

            // Add the new note (including the supervisor's name for display) to the state
            const noteWithSupervisor: VideoNote = {
                ...newNote,
                supervisor: { name: currentSupervisorName },
                createdAt: new Date().toISOString(), // Use client time for immediate display
            }

            setNotes([...notes, noteWithSupervisor].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()))
            setNewNoteContent('')
            toast.success('Note added successfully!')

        } catch (error) {
            console.error('Error adding note:', error)
            toast.error('Could not add note. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Add Feedback</h2>

            <form onSubmit={handleAddNote} className="space-y-4">
                <Textarea
                    placeholder="Type your feedback here..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={4}
                    disabled={isSubmitting}
                />
                <Button
                    type="submit"
                    className="w-full"
                    disabled={!newNoteContent.trim() || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Note at Current Time ({formatTime(videoRef.current ? Math.floor(videoRef.current.currentTime * 1000) : null)})
                        </>
                    )}
                </Button>
            </form>

            <h2 className="text-2xl font-semibold border-b pb-2 pt-4">Video Notes ({notes.length})</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {notes.length === 0 ? (
                    <p className="text-neutral-500">No feedback added yet.</p>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} className="p-3 border rounded-lg bg-neutral-50 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-sm font-semibold text-neutral-900">
                                    {note.supervisor.name}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => handleSeekToNote(note.timestampMs)}
                                    disabled={note.timestampMs === null}
                                >
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatTime(note.timestampMs)}
                                </Button>
                            </div>
                            <p className="text-sm text-neutral-700 whitespace-pre-wrap">{note.content}</p>
                            <p className="text-xs text-neutral-500 mt-2">
                                {new Date(note.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default VideoDetailClient