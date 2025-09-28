'use server';

import { StreamChat } from 'stream-chat';
import {PrismaClient} from "@/lib/generated/prisma";
import {getSession} from "@/lib/session"; // Your Prisma client import

const api_key = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const api_secret = process.env.STREAM_SECRET!;
const prisma = new PrismaClient()
// Initialize Stream Server Client (only use the secret on the server!)
const serverClient = StreamChat.getInstance(api_key, api_secret);

/**
 * Authenticates the user with Stream and generates a client-side token.
 * Also synchronizes the user's data from Prisma to Stream.
 * @returns The Stream connection token for the frontend.
 */
export async function connectToStream(): Promise<string> {
    // 1. Get the current user ID from your authentication system
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error('User not authenticated.');
    }

    // 2. Fetch the full user details from your Prisma database
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, image: true },
    });

    if (!user) {
        throw new Error('User not found in database.');
    }

    // 3. Define the Stream User object using your Prisma data
    const streamUser = {
        id: user.id, // CRITICAL: Use your database ID as the Stream ID
        name: user.name || 'Anonymous',
        image: user.image || undefined,
    };

    try {
        // 4. Upsert (Create or Update) the user on Stream's servers
        // This synchronizes your Prisma user data with Stream.
        await serverClient.upsertUsers([streamUser]);

        // 5. Generate the secure token for the client
        const token = serverClient.createToken(user.id);

        return token;
    } catch (error) {
        console.error('Error connecting to Stream:', error);
        throw new Error('Failed to connect to chat service.');
    }
}