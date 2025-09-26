// app/api/videos/[videoId]/notes/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from "@/lib/generated/prisma";
import { getSession } from "@/lib/session";

const prisma = new PrismaClient();

interface Context {
    params: {
        videoId: string;
    }
}

export async function POST(request: Request, context: Context) {
    try {
        const session = await getSession();

        if (!session || session.user.role !== 'supervisor') {
            return NextResponse.json({ error: "Unauthorized access. Supervisor required." }, { status: 403 });
        }

        const videoId = context.params.videoId;
        const supervisorId = session.user.id;

        const { content, timestampMs } = await request.json();

        if (!content || !videoId) {
            return NextResponse.json({ error: "Missing content or video ID." }, { status: 400 });
        }

        // Create the note
        const newNote = await prisma.videoNote.create({
            data: {
                content,
                timestampMs: timestampMs, // Can be null
                videoId,
                supervisorId,
            },
            // We select the fields the client component needs
            select: {
                id: true,
                content: true,
                timestampMs: true,
                createdAt: true,
                supervisorId: true,
            }
        });

        return NextResponse.json(newNote, { status: 201 });

    } catch (error) {
        console.error("Database error adding note:", error);
        return NextResponse.json({
            error: "Failed to add note."
        }, { status: 500 });
    }
}