// app/api/videos/[videoId]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from "@/lib/generated/prisma";
import { getSession } from "@/lib/session";

const prisma = new PrismaClient();

// Define the type for the request parameters
interface Context {
    params: {
        videoId: string;
    }
}

export async function GET(request: Request, context: Context) {
    try {
        const session = await getSession();

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
        }

        const userId = session.user.id;
        const videoId = context.params.videoId;

        if (!videoId) {
            return NextResponse.json({ error: "Missing video ID." }, { status: 400 });
        }

        // 🎯 Prisma call to fetch the specific video and its notes
        const video = await prisma.video.findFirst({
            where: {
                id: videoId,
                userId: userId, // CRUCIAL: Ensure the video belongs to the logged-in student
            },
            include: {
                notes: {
                    include: {
                        supervisor: {
                            select: {
                                name: true, // Get the supervisor's name
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc', // Show notes in chronological order
                    }
                },
            },
        });

        if (!video) {
            return NextResponse.json({ error: "Video not found or access denied." }, { status: 404 });
        }

        return NextResponse.json(video, { status: 200 });

    } catch (error) {
        console.error("Database error fetching video details:", error);
        return NextResponse.json({
            error: "Failed to fetch video details."
        }, { status: 500 });
    }
}