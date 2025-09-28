'use client';

import { useEffect, useState, useCallback } from 'react';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import {
    Chat,
    Channel,
    ChannelList,
    Window,
    MessageList,
    MessageInput,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { InitialClientData } from '@/lib/server-utils';
import { createShortId } from '@/lib/chat-utils';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { User, MessageSquare, X, LogOut, Loader2 } from 'lucide-react'; // Lucide Icons

type ApiUser = {
    id: string;
    name: string;
    image?: string;
};

interface ChatClientProps {
    initialData: InitialClientData;
}

// --- Utility Functions (Kept for consistency and custom avatars) ---

// Generate a consistent avatar color based on user ID
const getAvatarColor = (userId: string): string => {
    const colors = [
        '#3b82f6', // blue-500
        '#8b5cf6', // violet-500
        '#06b6d4', // cyan-500
        '#10b981', // emerald-500
        '#f59e0b', // amber-500
        '#ef4444', // red-500
        '#ec4899', // pink-500
        '#84cc16', // lime-500
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
};

// Generate initials from name
const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// --- Custom Avatar Component (Minimalist Style) ---
interface CustomAvatarProps {
    userId: string;
    userName: string;
    size?: 'sm' | 'md' | 'lg';
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({ userId, userName, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
    };

    return (
        <div
            className={`rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 ${sizeClasses[size]}`}
            style={{ backgroundColor: getAvatarColor(userId) }}
        >
            {getInitials(userName)}
        </div>
    );
};

// --- Main Chat Client Component ---

export function ChatClient({ initialData }: ChatClientProps) {
    const { apiKey, userToken, userId, userName } = initialData;
    const [client, setClient] = useState<StreamChat | null>(null);
    const [channel, setChannel] = useState<StreamChannel | null>(null);
    const [apiUsers, setApiUsers] = useState<ApiUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [showNewMessage, setShowNewMessage] = useState(false);

    // ... (createDirectChannel and getChannelDisplayName remain the same) ...
    const createDirectChannel = useCallback(
        async (targetUser: ApiUser) => {
            if (!client) return;

            if (targetUser.id === userId) {
                alert('You cannot start a direct chat with yourself.');
                return;
            }

            try {
                const members = [userId, targetUser.id];
                const keyString = members.sort().join('-');
                const channelId = createShortId(keyString);

                const newChannel = client.channel('messaging', channelId, {
                    members,
                    name: `${userName} & ${targetUser.name}`,
                });

                await newChannel.watch();
                setChannel(newChannel);
                setShowNewMessage(false);
            } catch (error) {
                console.error('Error creating direct channel:', error);
                alert(
                    `Failed to start chat with ${targetUser.name}. Check console for details.`
                );
            }
        },
        [client, userId, userName]
    );

    const getChannelDisplayName = useCallback((channel: StreamChannel) => {
        if (channel.data?.name) return channel.data.name;

        const members = Object.values(channel.state.members);
        const otherMembers = members.filter(member => member.user_id !== userId);

        if (otherMembers.length === 1) {
            return otherMembers[0].user?.name || 'Direct Message';
        } else if (otherMembers.length > 1) {
            const names = otherMembers.slice(0, 2).map(member =>
                member.user?.name?.split(' ')[0] || 'User'
            );
            return otherMembers.length > 2
                ? `${names.join(', ')} +${otherMembers.length - 2}`
                : names.join(', ');
        }

        return 'Chat';
    }, [userId]);
    // ... (End of createDirectChannel and getChannelDisplayName) ...

    // ... (useEffect for Stream Chat connection and user fetching remains the same) ...
    useEffect(() => {
        const chatClient = new StreamChat(apiKey);

        chatClient
            .connectUser({
                id: userId,
                name: userName,
                image: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=${getAvatarColor(userId).slice(1)}&color=fff&size=128`
            }, userToken)
            .then(async () => {
                setClient(chatClient);

                const defaultChannel = chatClient.channel(
                    'messaging',
                    'supervisor-support',
                    {
                        name: 'General Support',
                        members: [userId, 'some-other-supervisor-id'],
                    }
                );
                await defaultChannel.watch();
                setChannel(defaultChannel);
            })
            .catch((err) => {
                console.error('Error connecting Stream Chat:', err);
            });

        async function fetchUsers() {
            try {
                const response = await fetch('/api/stream/users');
                if (!response.ok) throw new Error('Failed to fetch user list');

                const data: ApiUser[] = await response.json();
                const otherUsers = data.filter((u) => u.id !== userId);
                setApiUsers(otherUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoadingUsers(false);
            }
        }

        fetchUsers();

        return () => {
            if (chatClient) {
                chatClient.disconnectUser();
            }
        };
    }, [apiKey, userId, userName, userToken]);

    if (!client || loadingUsers) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600 text-sm">Loading Chat and Contacts...</p>
                </div>
            </div>
        );
    }

    // The isChannelSelected utility is no longer used in the new UI structure, removing for simplicity.
    // const isChannelSelected = (targetUserId: string) => { ... }

    // Custom Channel Preview Component (using CustomAvatar)
    const CustomChannelPreview = (props: any) => {
        const { channel: c } = props;
        const isSelected = channel && channel.id === c.id;
        const displayName = getChannelDisplayName(c);
        const members = Object.values(c.state.members);
        const otherMembers = members.filter(member => member.user_id !== userId);
        const isDirect = members.length === 2;
        const lastMessage = c.state.messages[c.state.messages.length - 1];
        const otherUser = isDirect && otherMembers.length > 0 ? otherMembers[0] : null;

        return (
            <div
                onClick={async () => {
                    await c.watch();
                    setChannel(c);
                }}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                    isSelected
                        ? 'bg-blue-50 text-blue-700 font-medium' // Minimalist selection style
                        : 'hover:bg-gray-50'
                }`}
            >
                {otherUser ? (
                    <CustomAvatar userId={otherUser.user_id || ''} userName={otherUser.user?.name || ''} size="sm" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className="text-sm truncate">
                            {displayName}
                        </p>
                        {lastMessage && (
                            <p className="text-xs text-gray-400 font-normal flex-shrink-0 ml-2">
                                {new Date(lastMessage.created_at).toLocaleDateString() === new Date().toLocaleDateString()
                                    ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : new Date(lastMessage.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                                }
                            </p>
                        )}
                    </div>
                    <p className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'} truncate`}>
                        {lastMessage ? (
                            `${lastMessage.user?.name?.split(' ')[0]}: ${lastMessage.text || 'Media message'}`
                        ) : (
                            isDirect ? 'Direct message' : `${members.length} members`
                        )}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <Chat client={client} theme="messaging light">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <div className="bg-white  flex flex-col">
                    {/* Header: User Profile and New Message */}
                    <div className="p-4 ">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CustomAvatar userId={userId} userName={userName} size="md" />
                                <div>
                                    <h2 className="font-semibold text-gray-900">{userName}</h2>
                                    <p className="text-xs text-gray-500 flex items-center">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
                                        Online
                                    </p>
                                </div>
                            </div>

                        </div>
                        <Separator className="my-4" />
                        <Button
                            onClick={() => setShowNewMessage(true)}
                            className="w-full"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            New Message
                        </Button>
                    </div>

                    {/* Recent Chats List */}
                    <ScrollArea className="flex-1">
                        <div className="p-4 pt-2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Recent Chats
                            </h3>
                            <ChannelList
                                filters={{ type: 'messaging', members: { $in: [userId] } }}
                                sort={{ last_message_at: -1 }}
                                Preview={CustomChannelPreview}
                                List={({ children, loading }) => (
                                    <div className="flex flex-col">
                                        {loading && <p className="text-center p-4 text-sm text-gray-500">Loading channels...</p>}
                                        {children}
                                    </div>
                                )}
                            />
                        </div>
                    </ScrollArea>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col bg-gray-50">
                    {channel ? (
                        <Channel channel={channel}>
                            {/* Chat Header */}
                            <div className="p-4  bg-white ">
                                <div className="flex items-center space-x-3">
                                    {(() => {
                                        const members = Object.values(channel.state.members);
                                        const otherMembers = members.filter(member => member.user_id !== userId);
                                        const isDirect = members.length === 2;
                                        const otherUser = isDirect && otherMembers.length > 0 ? otherMembers[0] : null;

                                        return otherUser ? (
                                            <CustomAvatar userId={otherUser.user_id || ''}
                                                          userName={otherUser.user?.name || ''} size="md"/>
                                        ) : (
                                            <div
                                                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <MessageSquare className="w-5 h-5 text-gray-500"/>
                                            </div>
                                        );
                                    })()}
                                    <div>
                                            {getChannelDisplayName(channel)}


                                    </div>
                                </div>
                            </div>

                            <Window>
                                <MessageList/>
                                <MessageInput/>
                            </Window>
                        </Channel>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                                <div
                                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-blue-500"/>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Chat</h3>
                                <p className="text-gray-500">Select a recent chat or start a new message.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Message Dialog (Shadcn Dialog) */}
            <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>New Message</DialogTitle>
                        <DialogDescription>
                            Select a contact to start messaging.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-72">
                        <div className="p-1">
                            {apiUsers.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => createDirectChannel(user)}
                                    className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <CustomAvatar userId={user.id} userName={user.name} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500">Available</p>
                                    </div>
                                </div>
                            ))}
                            {apiUsers.length === 0 && (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500">No contacts available</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                /* Global overrides for a minimalist look */
                .str-chat {
                    height: 100vh;
                }

                .str-chat__container {
                    height: 100%;
                }

                .str-chat__channel {
                    height: 100%;
                }

                .str-chat__main-panel {
                    height: 100%;
                    border-left: none; /* Remove border in Stream's main panel */
                }

                /* General list styling */
                .str-chat__list {
                    background: transparent !important;
                    padding: 0 !important;
                }

                /* Input area styling */
                .str-chat__message-input {
                    border-top: 1px solid #e5e7eb; /* Subtle separator */
                    background-color: #ffffff; /* Ensure white background for input */
                }

                /* Message list background */
                .str-chat__message-list {
                    background: #f9fafb; /* Very light gray background for messages */
                }

                /* Hide default avatars in favor of our custom ones */
                .str-chat__avatar {
                    display: none;
                }

                /* Customizing message bubble appearance for minimalism */
                .str-chat__message-simple__text-container {
                    /* Optional: Add slight rounded edges to messages */
                    border-radius: 0.5rem; 
                }
            `}</style>
        </Chat>
    );
}