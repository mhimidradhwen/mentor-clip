import { NextResponse } from 'next/server';
import {PrismaClient} from "@/lib/generated/prisma";
const prisma = new PrismaClient();

// Define allowed roles for validation
const ALLOWED_ROLES = ['student', 'supervisor', 'admin'];

// Helper to extract ID from URL parameters
interface Context {
    params: {
        id: string;
    };
}

/**
 * @route GET /api/admin/users/[id]
 * @description Retrieves details for a single user by ID.
 * @access Admin/Authorized Professional Only
 */
export async function GET(request: Request, context: Context) {
    const userId =  context.params.id;

    try {
        // SECURITY WARNING: AUTHORIZATION IS REQUIRED HERE
        // Ensure the requesting user has the necessary permissions (e.g., 'admin')

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                studentId: true,
                professionalId: true,
                class: true,
                createdAt: true,
                updatedAt: true,
                // Include related data for the detail view
                uploadedVideos: {
                    select: { id: true, title: true, createdAt: true, s3Key:true },
                    orderBy: { createdAt: 'desc' },
                },
                createdNotes: {
                    select: { id: true, content: true, timestampMs: true, video: { select: { title: true } } },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

/**
 * @route PATCH /api/admin/users/[id]
 * @description Updates the role of a single user by ID.
 * @access Admin Only
 */
export async function PATCH(request: Request, context: Context) {
    const userId = context.params.id;

    try {
        // SECURITY WARNING: AUTHORIZATION IS REQUIRED HERE
        // Ensure the requesting user has the 'admin' role

        const body = await request.json();
        const { role: newRole } = body;

        // Input Validation
        if (!newRole || typeof newRole !== 'string' || !ALLOWED_ROLES.includes(newRole)) {
            return NextResponse.json({ message: 'Invalid or missing role in request body' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                role: newRole,
                // Optionally handle setting/clearing professionalId/studentId based on role change
            },
            select: { id: true, name: true, email: true, role: true, updatedAt: true },
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        // Handle Prisma not found error specifically (though validation should catch most cases)
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
            return NextResponse.json({ message: 'User not found for update' }, { status: 404 });
        }
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
