import { NextResponse } from 'next/server';
import {PrismaClient} from "@/lib/generated/prisma";
const prisma = new PrismaClient(); // Initializing the prisma client instance

/**
 * @route GET /api/admin
 * @description Retrieves a list of all users.
 * @access Admin/Authorized Professional Only
 */
export async function GET(request: Request) {
    try {
        // =====================================================================
        // SECURITY WARNING: AUTHORIZATION IS REQUIRED HERE
        // You MUST implement checks (e.g., using middleware or next-auth session)
        // to ensure the requesting user has the 'admin' or 'professional' role
        // before allowing this query to proceed.
        // Example: if (session.user.role !== 'admin') return new NextResponse('Forbidden', { status: 403 });
        // =====================================================================

        const users = await prisma.user.findMany({
            // Select the fields necessary for administration, excluding sensitive data
            select: {
                id: true,
                name: true,
                email: true,
                role: true, // Display the current role
                studentId: true,
                professionalId: true,
                class: true,
                createdAt: true,
                updatedAt: true,
                // Include related counts or select key related data if needed
                _count: {
                    select: {
                        uploadedVideos: true,
                        createdNotes: true,
                    },
                },
            },
            // You can add orderBy here if needed, e.g., orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error('Error fetching all users:', error);

        // Provide a generic error response for security and stability
        return NextResponse.json(
            { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
