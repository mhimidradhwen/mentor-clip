'use client';

import { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat'; // Core client/logic library
import { Chat, LoadingIndicator } from 'stream-chat-react'; // React components library

import { connectToStream } from "@/lib/actions/stream";

// ... rest of your component logic
// Replace with your actual types/props
interface StreamChatProviderProps {
    userId: string; // The currently logged-in user's ID
    children: React.ReactNode;
}

// Initialize the Stream client once outside the component to prevent re-initialization
const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);

export function StreamChatProvider({ userId, children }: StreamChatProviderProps) {
    const [chatClient, setChatClient] = useState<StreamChat | null>(null);

    useEffect(() => {
        // This function will fetch the secure token from the server
        async function initChat() {
            try {
                const token = await connectToStream(); // Call the Server Action

                // Connect the client using the secure token
                await client.connectUser({ id: userId }, token);
                setChatClient(client);

            } catch (error) {
                console.error('Error connecting user to chat:', error);
                // Handle error (e.g., show a message to the user)
            }
        }

        if (userId) {
            initChat();
        }

        // Cleanup function: Disconnect the user when the component unmounts
        return () => {
            if (chatClient) {
                chatClient.disconnectUser();
            }
        };
    }, [userId]); // Re-run if the userId changes (e.g., user logs in/out)

    if (!chatClient) {
        return <LoadingIndicator />;
    }

    // 2. The <Chat> component provides the context to all Stream UI components
    return <Chat client={chatClient}>{children}</Chat>;
}