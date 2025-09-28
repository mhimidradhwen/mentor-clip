// api/admin/challenge/route.ts

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PrismaClient } from "@/lib/generated/prisma";
import { getSession } from "@/lib/session";

// Initialize Prisma Client
const prisma = new PrismaClient()

// =======================================================
// AUTHENTICATION AND AUTHORIZATION HELPER
// Checks for roles that can MANAGE/REVIEW challenges.
// =======================================================
const authorizeManagerOrReviewer = async () => {
    const session = await getSession();
    // Roles authorized to access this API route and view submissions
    const authorizedRoles = ['admin', 'professional', 'supervisor'];

    if (!session || !session.user) {
        return { authorized: false, message: 'Authentication required.', status: 401 };
    }

    const userRole = (session.user as any).role;

    if (!authorizedRoles.includes(userRole)) {
        return {
            authorized: false,
            message: `Access denied. Requires one of the following roles: ${authorizedRoles.join(', ')}.`,
            status: 403
        };
    }

    return { authorized: true, user: session.user, role: userRole };
};

// =======================================================
// POST /api/admin/challenge - CREATE a new Challenge (Admin/Professional Only)
// =======================================================
export async function POST(request: Request) {
    const authCheck = await authorizeManagerOrReviewer();

    // Restricting POST to Admin/Professional (excluding Supervisor)
    if (!authCheck.authorized || authCheck.role === 'supervisor') {
        return NextResponse.json({ message: 'Access denied. Only Admin or Professional can create challenges.' }, { status: 403 });
    }

    const creator = authCheck.user;

    try {
        const body = await request.json();
        const { title, description, startDate, endDate, isActive } = body;

        if (!title || !startDate || !endDate) {
            return NextResponse.json({ message: 'Missing required fields: title, startDate, and endDate.' }, { status: 400 });
        }

        const newChallenge = await prisma.challenge.create({
            data: {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: isActive !== undefined ? isActive : true,
                creatorId: creator?.id as string,
            },
        });

        return NextResponse.json(newChallenge, { status: 201 });
    } catch (error) {
        console.error('Error creating challenge:', error);
        return NextResponse.json({ message: 'Failed to create challenge.', error }, { status: 500 });
    }
}


// =======================================================
// GET /api/admin/challenge - READ Challenges (List or Detail)
// =======================================================
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const authCheck = await authorizeManagerOrReviewer();
    // CRITICAL: True for Admin, Professional, and Supervisor
    const canViewSubmissions = authCheck.authorized;

    if (id) {
        // --- DETAIL VIEW: READ single challenge by ID ---
        try {
            const challenge = await prisma.challenge.findUnique({
                where: { id },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    startDate: true,
                    endDate: true,
                    isActive: true,
                    creator: { select: { id: true, name: true } },

                    // Include submissions only if authorized
                    submissions: canViewSubmissions ? {
                        select: {
                            id: true,
                            video: {
                                select: {
                                    id: true,
                                    title: true,
                                    s3Key: true, // Assuming this is needed for the player
                                    uploader: { select: { id: true, name: true } },
                                    notes: { // Notes linked via Video model
                                        take: 1,
                                        select: {
                                            id: true,
                                            score: true,
                                            content: true,
                                            updatedAt: true,
                                            supervisor: { select: { name: true } }
                                        }
                                    }
                                }
                            },
                        }
                    } : false,
                },
            });

            if (!challenge) {
                return NextResponse.json({ message: 'Challenge not found.' }, { status: 404 });
            }

            // Public access check: Only allow access to active challenges if not a reviewer
            if (!canViewSubmissions && !challenge.isActive) {
                return NextResponse.json({ message: 'Challenge not found or not active.' }, { status: 404 });
            }

            return NextResponse.json(challenge);
        } catch (error) {
            console.error('Error reading single challenge:', error);
            return NextResponse.json({ message: 'Failed to retrieve challenge.' }, { status: 500 });
        }

    } else {
        // --- LIST VIEW: READ all challenges (Requires authorization) ---
        if (!canViewSubmissions) {
            return NextResponse.json({ message: authCheck.message }, { status: authCheck.status });
        }

        try {
            const challenges = await prisma.challenge.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    creator: { select: { id: true, name: true } },
                    _count: {
                        select: { submissions: true }, // This provides the submissions count!
                    },
                },
            });
            return NextResponse.json(challenges);
        } catch (error) {
            console.error('Error reading all challenges:', error);
            return NextResponse.json({ message: 'Failed to retrieve challenges.' }, { status: 500 });
        }
    }
}

// =======================================================
// PUT /api/admin/challenge - UPDATE a Challenge (Admin/Professional Only)
// =======================================================
export async function PUT(request: Request) {
    const authCheck = await authorizeManagerOrReviewer();

    if (!authCheck.authorized || authCheck.role === 'supervisor') {
        return NextResponse.json({ message: 'Access denied. Only Admin or Professional can update challenges.' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { id, title, description, startDate, endDate, isActive } = body;

        if (!id) {
            return NextResponse.json({ message: 'Challenge ID is required for update.' }, { status: 400 });
        }

        const updatedChallenge = await prisma.challenge.update({
            where: { id },
            data: {
                title,
                description,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                isActive,
            },
        });

        return NextResponse.json(updatedChallenge);
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
            return NextResponse.json({ message: 'Challenge not found.' }, { status: 404 });
        }
        console.error('Error updating challenge:', error);
        return NextResponse.json({ message: 'Failed to update challenge.', error }, { status: 500 });
    }
}

// =======================================================
// DELETE /api/admin/challenge - DELETE a Challenge (Admin/Professional Only)
// =======================================================
export async function DELETE(request: Request) {
    const authCheck = await authorizeManagerOrReviewer();

    if (!authCheck.authorized || authCheck.role === 'supervisor') {
        return NextResponse.json({ message: 'Access denied. Only Admin or Professional can delete challenges.' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Challenge ID is required for deletion.' }, { status: 400 });
        }

        await prisma.challenge.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Challenge successfully deleted.' }, { status: 200 });
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
            return NextResponse.json({ message: 'Challenge not found.' }, { status: 404 });
        }
        console.error('Error deleting challenge:', error);
        return NextResponse.json({ message: 'Failed to delete challenge.', error }, { status: 500 });
    }
}