// /api/users/route.ts (MODIFIED)

import { NextResponse } from 'next/server';
import { PrismaClient } from "@/lib/generated/prisma";
import { StreamChat } from 'stream-chat'; // <-- NEW IMPORT

const prisma = new PrismaClient();

// Get the Stream API Secret and Key from environment variables
const streamApiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY as string;
const streamApiSecret = process.env.STREAM_API_SECRET as string;

// Initialize the Stream Server Client
const serverClient = StreamChat.getInstance(streamApiKey, streamApiSecret);

/**
 * @route GET /api/users
 * @description Retrieves a list of all users and ensures they exist in Stream Chat.
 * @access Admin/Authorized Professional Only
 */
export async function GET(request: Request) {
    try {
        // ... (SECURITY WARNING REMAINS VITAL) ...

        const users = await prisma.user.findMany({
            // Ensure you select 'id', 'name', and 'role' (if available)
            select: { id: true, name: true, email: true, role: true, /* ... other fields */ },
        });

        // =====================================================================
        // FIX: SYNCHRONIZE ALL USERS WITH STREAM CHAT ON THE SERVER
        // =====================================================================
        const streamUsersToUpsert = users.map(u => ({
            id: u.id,
            name: u.name,
            // Only include role if you have defined it in the Stream Dashboard
            // If you removed it earlier, you can skip it:
            // role: u.role || 'user',
        }));

        // The Server Client is trusted and can perform this action (upsertUsers)
        await serverClient.upsertUsers(streamUsersToUpsert);
        // =====================================================================

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error('Error syncing or fetching all users:', error);
        return NextResponse.json(
            { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}