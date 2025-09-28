// ./app/dashboard/supervisor/messages/page.tsx

// This is an async Server Component. NO 'use client' needed.

import { getSessionData } from "@/lib/server-utils";
import {ChatClient} from "@/components/stream/ChatClient"; // ✅ SAFE: Imports server-only logic here

export default async function AdminMessagesPage() {
    let initialData;
    try {
        // 1. Execute the server-only function
        initialData = await getSessionData();
    } catch (error) {
        console.error("Failed to get session data:", error);
        // Handle error (e.g., redirect to login or show an error message)
        return <div>Error loading chat session. Please log in.</div>;
    }

    // 2. Pass the data to the Client Component
    return (
        <div style={{ height: 'calc(100vh - 60px)' }}>
            {/* Adjust height as necessary */}
            <ChatClient initialData={initialData} />
        </div>
    );
}