"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button" // Assuming this is your Shadcn button
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import { toast } from "sonner" // 👈 NEW: Sonner import
import { useRouter } from "next/navigation" // 👈 NEW: Router import for redirection

interface PresignedUrlResponse {
    presignedUrl: string;
    key: string;
}

function UploadVideoPage() {
    // 👈 NEW: Initialize the Next.js router
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        video: null as File | null,
    })
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        setError(null);
    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setFormData((prev) => ({
            ...prev,
            video: file,
        }))
        setError(null);
        setUploadProgress(null);
    }

    // 1. Function to request the presigned URL from your API (UNCHANGED)
    const getPresignedUrl = async (file: File): Promise<PresignedUrlResponse> => {
        const response = await fetch("/api/upload-video", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fileName: file.name,
                contentType: file.type,
                size: file.size,
                isImage: file.type.startsWith("image/"),
            }),
        });

        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (!response.ok) {
            if (isJson) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: Status ${response.status}`);
            } else {
                const text = await response.text();
                console.error("Non-JSON Server Response:", text);
                throw new Error(`API call failed (Status: ${response.status}). Check API route path and server logs.`);
            }
        }

        if (isJson) {
            return response.json();
        } else {
            throw new Error("API returned a successful but non-JSON response.");
        }
    }

    // 2. Function to upload the file to S3 using XMLHttpRequest for progress (UNCHANGED)
    const uploadFileToS3 = (presignedUrl: string, file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open("PUT", presignedUrl);
            xhr.setRequestHeader("Content-Type", file.type);

            // Progress tracking
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded * 100) / event.total);
                    setUploadProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`S3 upload failed with status ${xhr.status}. Response: ${xhr.responseText}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error("Network error during S3 upload."));
            };

            xhr.send(file);
        });
    }

    // 3. Handle Submit with Final Steps (UPDATED)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const videoFile = formData.video;

        if (!videoFile) {
            setError("Please select a video file to upload.");
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            // STEP 1 & 2: Get URL and Upload to S3
            const { presignedUrl, key } = await getPresignedUrl(videoFile);
            await uploadFileToS3(presignedUrl, videoFile);

            // STEP 3: Save metadata to your own database
            const metadataResponse = await fetch('/api/videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    s3Key: key,
                    fileSize: videoFile!.size,
                    contentType: videoFile!.type,
                }),
            });

            if (!metadataResponse.ok) {
                const errorData = await metadataResponse.json();
                throw new Error(`Failed to save metadata: ${errorData.error || 'Unknown server error'}`);
            }

            // SUCCESS ACTIONS
            toast.success(`Video "${formData.title}" uploaded and saved successfully!`); // 👈 NEW: Success toast

            // Reset form
            setFormData({ title: "", description: "", video: null })
            setUploadProgress(null);

            // Reset file input element
            const fileInput = document.getElementById("video-upload") as HTMLInputElement
            if (fileInput) {
                fileInput.value = ""
            }

            // 👈 NEW: Redirect the user to the videos page
            router.push('/dashboard/student/videos');

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            console.error("Upload failed:", err);

            // 👈 NEW: Error toast notification
            toast.error("Upload Failed", {
                description: errorMessage.split(': ')[0] === 'Failed to save metadata'
                    ? `Metadata Error: ${errorMessage.split(': ').slice(1).join(': ')}`
                    : `Upload Error: ${errorMessage}`
            });

            setError(`Upload failed: ${errorMessage}`);
            setUploadProgress(null);
        } finally {
            setIsUploading(false);
        }
    }

    // Helper to format file size (UNCHANGED)
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div>
            {/* ... (Rest of the JSX form remains the same) ... */}
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">New Video</h1>
                        <p className="text-muted-foreground mt-1">Upload and manage your video content</p>
                    </div>
                </div>
                <div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Video Title</Label>
                            <Input
                                id="title"
                                name="title"
                                type="text"
                                placeholder="Enter video title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                disabled={isUploading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe your video content"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                disabled={isUploading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="video-upload">Video File</Label>
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="video-upload"
                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 transition-colors ${
                                        isUploading ? 'border-gray-300' : 'border-border hover:bg-muted/80'
                                    }`}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground">MP4, AVI, MOV, etc.</p>
                                    </div>
                                    <Input
                                        id="video-upload"
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoChange}
                                        className="hidden"
                                        required
                                        disabled={isUploading}
                                    />
                                </label>
                            </div>
                            {formData.video && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Selected: **{formData.video.name}** ({formatFileSize(formData.video.size)})
                                </p>
                            )}
                        </div>

                        {/* Progress Bar Display */}
                        {isUploading && uploadProgress !== null && (
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Upload Progress: {uploadProgress}%</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                        className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Error Message Display */}
                        {error && (
                            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md" role="alert">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isUploading || !formData.video || !formData.title}>
                            {isUploading
                                ? uploadProgress !== null
                                    ? `Uploading ${uploadProgress}%...`
                                    : "Preparing Upload..."
                                : "Upload Video"
                            }
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default UploadVideoPage