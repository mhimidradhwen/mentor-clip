// hooks/useChatNotifications.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { StreamChat } from 'stream-chat';

interface UseChatNotificationsProps {
    userId: string;
    userToken: string;
    apiKey: string;
    userName?: string;
    enabled?: boolean;
}

export function useChatNotifications({
                                         userId,
                                         userToken,
                                         apiKey,
                                         userName,
                                         enabled = true
                                     }: UseChatNotificationsProps) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [client, setClient] = useState<StreamChat | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const updateUnreadCount = useCallback(async (chatClient: StreamChat) => {
        try {
            const channels = await chatClient.queryChannels({
                type: 'messaging',
                members: { $in: [userId] }
            });

            const totalUnread = channels.reduce((total, channel) => {
                return total + (channel.state.unreadCount || 0);
            }, 0);

            setUnreadCount(totalUnread);
        } catch (error) {
            console.error('Error updating unread count:', error);
        }
    }, [userId]);

    useEffect(() => {
        if (!enabled || !userId || !userToken || !apiKey) {
            setUnreadCount(0);
            setIsConnected(false);
            return;
        }

        const chatClient = new StreamChat(apiKey);

        const connectAndListen = async () => {
            try {
                await chatClient.connectUser({
                    id: userId,
                    name: userName || userId,
                    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || userId)}&background=random`
                }, userToken);

                setClient(chatClient);
                setIsConnected(true);

                // Get initial unread count
                await updateUnreadCount(chatClient);

                // Listen for new messages from other users
                chatClient.on('notification.message_new', (event) => {
                    if (event.channel && event.user?.id !== userId) {
                        setUnreadCount(prev => prev + 1);
                    }
                });

                // Listen for read events
                chatClient.on('notification.mark_read', (event) => {
                    if (event.channel) {
                        updateUnreadCount(chatClient);
                    }
                });

                // Listen for channel updates
                chatClient.on('channel.updated', () => {
                    updateUnreadCount(chatClient);
                });

                // Refresh unread count every 60 seconds
                const interval = setInterval(() => {
                    updateUnreadCount(chatClient);
                }, 60000);

                return () => clearInterval(interval);

            } catch (error) {
                console.error('Error connecting to Stream Chat:', error);
                setIsConnected(false);
            }
        };

        connectAndListen();

        return () => {
            if (chatClient) {
                chatClient.disconnectUser();
                setIsConnected(false);
                setClient(null);
            }
        };
    }, [userId, userToken, apiKey, userName, enabled, updateUnreadCount]);

    return {
        unreadCount,
        client,
        isConnected
    };
}