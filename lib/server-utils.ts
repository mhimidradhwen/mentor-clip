// ./lib/server-utils.ts

import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { StreamChat } from 'stream-chat'; // <-- 1. Import Stream Server SDK

// Define a type for the data you need to pass to the client
export type InitialClientData = {
    apiKey: string;
    userToken: string; // <-- This will now be the Stream Token
    userId: string;
    userName: string;
};
const STATIC_SUPERVISOR_IDS = ['some-other-supervisor-id']; // <-- List the problematic ID here

// Get the Stream API Secret from environment variables
const streamApiSecret = process.env.STREAM_API_SECRET;
if (!streamApiSecret) {
    throw new Error("STREAM_API_SECRET is not defined in environment variables.");
}

// 2. Instantiate the Stream Server Client
const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY as string,
    streamApiSecret
);

export async function getSessionData(): Promise<InitialClientData> {

    // Fetch BetterAuth session
    const session = await auth.api.getSession({
        headers: headers() as unknown as Headers,
    });

    if (!session || !session.user || !session.session || !session.user.name) {
        throw new Error("Authentication session is invalid or missing required data.");
    }

    const userId = session.user.id;

    // =======================================================
    // 1. GUARANTEE USER EXISTENCE BEFORE TOKEN GENERATION
    // =======================================================
    // Upsert the currently authenticated user and the static supervisor ID(s)
    const usersToUpsert = [
        // The currently logged-in user
        { id: userId, name: session.user.name, role: 'user' },
        ...STATIC_SUPERVISOR_IDS.map(id => ({ id: id, name: id })),
    ];

    await serverClient.upsertUsers(usersToUpsert); // This creates the users if they don't exist

    // =======================================================
    // 2. GENERATE AND RETURN DATA (same as before)
    // =======================================================
    const streamUserToken = serverClient.createToken(userId);

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    if (!apiKey) {
        throw new Error("NEXT_PUBLIC_STREAM_API_KEY is not defined.");
    }

    return {
        apiKey: apiKey,
        userToken: streamUserToken,
        userId: userId,
        userName: session.user.name,
    };
}