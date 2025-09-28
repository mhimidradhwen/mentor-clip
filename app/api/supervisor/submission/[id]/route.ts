// api/supervisor/submission/[id]/route.ts

import { NextResponse } from 'next/server';

import { getSession } from "@/lib/session";
import {PrismaClient} from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// =======================================================
// AUTHORIZATION HELPER: Only allow 'supervisor' or 'admin' role for scoring
// =======================================================
const authorizeScorer = async () => {
    const session = await getSession();
    const authorizedRoles = ['supervisor', 'admin'];

    if (!session || !session.user) {
        return { authorized: false, message: 'Authentication required.', status: 401 };
    }

    const userRole = (session.user as any).role;

    if (!authorizedRoles.includes(userRole)) {
        return { authorized: false, message: 'Access denied. Requires Supervisor or Admin role.', status: 403 };
    }

    return { authorized: true, user: session.user };
};

// =======================================================
// PUT /api/supervisor/submission/[id] - ADD/UPDATE Feedback/Score
// =======================================================
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const authCheck = await authorizeScorer();
    if (!authCheck.authorized) {
        return NextResponse.json({ message: authCheck.message }, { status: authCheck.status });
    }

    const supervisor = authCheck.user;
    const submissionId = params.id; // This is the VideoSubmission ID

    try {
        const body = await request.json();
        // Frontend sends 'note', which maps to schema's 'content'
        const { score, note } = body;

        // Validation
        if (score === undefined || note === undefined) {
            return NextResponse.json({ message: 'Missing required fields: score and note.' }, { status: 400 });
        }
        if (typeof score !== 'number' || score < 0 || score > 100) {
            return NextResponse.json({ message: 'Score must be a number between 0 and 100.' }, { status: 400 });
        }

        // 1. Find the Submission to get the linked videoId
        const submission = await prisma.videoSubmission.findUnique({
            where: { id: submissionId },
            select: { videoId: true }
        });

        if (!submission) {
            return NextResponse.json({ message: 'Video submission not found.' }, { status: 404 });
        }

        const videoId = submission.videoId;

        // 2. Check if a VideoNote (score/feedback) already exists for this specific Video ID
        let feedback = await prisma.videoNote.findFirst({
            where: { videoId: videoId },
        });

        if (feedback) {
            // 3. If it exists, UPDATE the record
            feedback = await prisma.videoNote.update({
                where: { id: feedback.id },
                data: {
                    score: score,
                    content: note,
                    supervisorId: supervisor?.id,
                },
            });
        } else {
            // 4. If it doesn't exist, CREATE a new record linked to the Video ID
            feedback = await prisma.videoNote.create({
                data: {
                    score: score,
                    content: note,
                    videoId: videoId,
                    supervisorId: supervisor?.id,
                },
            });
        }

        return NextResponse.json({
            message: 'Feedback and score successfully saved to the video.',
            feedback
        }, { status: 200 });

    } catch (error) {
        console.error('Error adding supervisor feedback:', error);
        return NextResponse.json({ message: 'Failed to add supervisor feedback.' }, { status: 500 });
    }
}