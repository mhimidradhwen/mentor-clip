import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// ASSUME: Better Auth instance is exported from this path
import { auth } from '@/lib/auth';
import {PrismaClient} from "@/lib/generated/prisma";
import {getSession} from "@/lib/session";

const prisma = new PrismaClient();

// =======================================================
// AUTHENTICATION HELPER
// =======================================================
const getAuthenticatedUser = async () => {
    const session = await getSession();

    if (!session || !session.user) {
        return { authorized: false, user: null, message: 'Authentication required.', status: 401 };
    }

    // Return the authenticated user object
    return { authorized: true, user: session.user };
};

// =======================================================
// GET /api/student/challenge - READ all Active Challenges
// =======================================================
export async function GET(request: Request) {
    try {
        // We fetch all *active* challenges that haven't passed their end date.
        // NOTE: This endpoint is generally open to all logged-in users, but we don't
        // require the full admin/professional role check.
        const challenges = await prisma.challenge.findMany({
            where: {
                isActive: true,
                endDate: {
                    gt: new Date(), // Only challenges where the end date is greater than the current date
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                creator: {
                    select: { name: true }
                }
            },
            orderBy: { startDate: 'asc' },
        });

        return NextResponse.json(challenges);
    } catch (error) {
        console.error('Error reading challenges for student:', error);
        return NextResponse.json({ message: 'Failed to retrieve challenges.' }, { status: 500 });
    }
}

// =======================================================
// POST /api/student/challenge - SUBMIT a Video to a Challenge
// =======================================================
export async function POST(request: Request) {
    const authCheck = await getAuthenticatedUser();
    if (!authCheck.authorized || !authCheck.user) {
        return NextResponse.json({ message: authCheck.message }, { status: authCheck.status });
    }

    const student = authCheck.user;

    // Optional: Enforce that only 'student' role can submit, though the logic below
    // should handle the check implicitly since only students can upload videos tied to their ID.
    const userRole = (student as any).role;
    if (userRole !== 'student' && userRole !== 'professional') { // Allow professional if they can submit, otherwise strictly 'student'
        return NextResponse.json({ message: 'Only students can submit videos to challenges.' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { videoId, challengeId } = body;

        if (!videoId || !challengeId) {
            return NextResponse.json({ message: 'Missing required fields: videoId and challengeId.' }, { status: 400 });
        }

        // 1. Verify the challenge is active and accepting submissions
        const challenge = await prisma.challenge.findUnique({
            where: { id: challengeId },
        });

        if (!challenge) {
            return NextResponse.json({ message: 'Challenge not found.' }, { status: 404 });
        }

        const now = new Date();
        if (!challenge.isActive || challenge.endDate < now) {
            return NextResponse.json({ message: 'This challenge is not currently open for submissions.' }, { status: 403 });
        }

        // 2. Verify the video exists and belongs to the authenticated user
        const video = await prisma.video.findUnique({
            where: { id: videoId },
        });

        if (!video || video.userId !== student.id) {
            return NextResponse.json({ message: 'Video not found or does not belong to the current user.' }, { status: 403 });
        }

        // 3. Create the VideoSubmission record
        const submission = await prisma.videoSubmission.create({
            data: {
                challengeId,
                videoId,
                // Optional: you can set isFinal: true here if you only allow one final submission
            },
            include: {
                challenge: { select: { title: true } },
            }
        });

        return NextResponse.json({
            message: `Video successfully submitted to challenge: ${submission.challenge.title}`,
            submissionId: submission.id
        }, { status: 201 });

    } catch (error) {
        // Handle Prisma unique constraint error (P2002) if the video is already submitted to this challenge
        if (error instanceof Error && 'code' in error && error.code === 'P2002') {
            return NextResponse.json({ message: 'This video has already been submitted to this challenge.' }, { status: 409 });
        }

        console.error('Error submitting video:', error);
        return NextResponse.json({ message: 'Failed to submit video to challenge.' }, { status: 500 });
    }
}