// api/student/videos/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import {getSession} from "@/lib/session";
import {PrismaClient} from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// Helper to get authenticated user (same as before)
const getAuthenticatedUser = async () => {
    const session = await getSession();
    return session?.user || null;
};

// GET /api/student/videos - READ videos uploaded by the current student
export async function GET(request: Request) {
    const user = await getAuthenticatedUser();

    if (!user || !user.id) {
        return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    try {
        const studentVideos = await prisma.video.findMany({
            where: {
                userId: user.id,
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                // Include submission status if needed, but for simplicity, we just list uploaded videos
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(studentVideos);
    } catch (error) {
        console.error('Error reading student videos:', error);
        return NextResponse.json({ message: 'Failed to retrieve videos.' }, { status: 500 });
    }
}