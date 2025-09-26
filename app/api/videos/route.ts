// app/api/videos/route.ts

import { NextResponse } from 'next/server';
import { z } from "zod";
import { PrismaClient } from "@/lib/generated/prisma"; // Updated import path
import { getSession } from "@/lib/session"; // Your session utility

// Instantiate PrismaClient once for the route handler
const prisma = new PrismaClient();

const saveVideoSchema = z.object({
    title: z.string().min(1, "Title is required."),
    description: z.string().optional(),
    s3Key: z.string().min(1, "S3 key is required."),
    fileSize: z.number().int().positive("File size must be a positive integer."),
    contentType: z.string().min(1, "Content type is required."),
});

export async function POST(request: Request) {
    try {
        const session = await getSession(); // Get the current session/user

        if (!session || !session.user || session.user.role !== 'student') {
            return NextResponse.json({ error: "Unauthorized access or incorrect role." }, { status: 403 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const validatedData = saveVideoSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                { error: "Invalid video metadata", details: validatedData.error.issues },
                { status: 400 }
            );
        }

        const { title, description, s3Key, fileSize, contentType } = validatedData.data;

        // Use the newly instantiated 'prisma' client
        const newVideo = await prisma.video.create({
            data: {
                title,
                description,
                s3Key,
                fileSize,
                contentType,
                userId: userId, // Link to the authenticated student's ID
            },
        });

        return NextResponse.json({
            message: "Video metadata saved successfully.",
            videoId: newVideo.id
        }, { status: 201 });

    } catch (error) {
        console.error("Database error saving video metadata:", error);
        return NextResponse.json({
            error: "Failed to save video metadata to the database."
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getSession();

        // ⚠️ IMPORTANT: Check for authenticated user and role
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
        }

        const userId = session.user.id;

        // 🎯 Prisma call to fetch videos uploaded ONLY by the logged-in user
        const videos = await prisma.video.findMany({
            where: {
                userId: userId,
            },
            // Include related notes to show feedback if needed
            include: {
                notes: {
                    select: {
                        id: true,
                        content: true,
                        timestampMs: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc', // Show newest videos first
            },
        });

        return NextResponse.json(videos, { status: 200 });

    } catch (error) {
        console.error("Database error fetching videos:", error);
        return NextResponse.json({
            error: "Failed to fetch video list."
        }, { status: 500 });
    }
}