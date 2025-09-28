"use client"

import { Bell, Search, Settings, User, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { Session } from "@/lib/session"
import { signOut } from "@/lib/actions/auth-actions"
import { useRouter } from "next/navigation"
import { useChatNotifications } from "@/hooks/useChatNotifications"

interface HeaderProps {
    session: Session | null
    // Add these props for chat notifications
    streamApiKey?: string
    streamUserToken?: string
}

export default function Header({ session, streamApiKey, streamUserToken }: HeaderProps) {
    const router = useRouter()

    // Initialize chat notifications if user is logged in and Stream credentials are available
    const { unreadCount, isConnected } = useChatNotifications({
        userId: session?.user?.id || '',
        userToken: streamUserToken || '',
        apiKey: streamApiKey || '',
        userName: session?.user?.name || '',
        enabled: !!(session?.user?.id && streamUserToken && streamApiKey)
    })

    const handleSignOut = async () => {
        await signOut()
        router.push("/") // redirect after logout
    }

    const handleMessagesClick = () => {
        router.push("/dashboard/supervisor/messages")
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 gap-4">
                <SidebarTrigger />

                <div className="flex items-center gap-2">
                    {/* Chat Messages Notification */}
                    {session && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                            onClick={handleMessagesClick}
                            title={unreadCount > 0 ? `${unreadCount} unread messages` : "Messages"}
                        >
                            <MessageCircle className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <>
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full text-[10px] font-medium text-destructive-foreground flex items-center justify-center animate-pulse">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                    {/* Pulse animation ring */}
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full animate-ping opacity-75"></span>
                                </>
                            )}
                            {/* Connection status indicator */}
                            {session && streamApiKey && (
                                <span
                                    className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
                                        isConnected ? 'bg-green-500' : 'bg-gray-400'
                                    }`}
                                    title={isConnected ? 'Chat connected' : 'Chat disconnected'}
                                />
                            )}
                            <span className="sr-only">Messages</span>
                        </Button>
                    )}


                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={session.user.avatar || "/placeholder.svg"} alt={session.user.name} />
                                        <AvatarFallback>
                                            {session.user.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleMessagesClick}>
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    <span>Messages</span>
                                    {unreadCount > 0 && (
                                        <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button variant="ghost" size="icon">
                            <User className="h-4 w-4" />
                            <span className="sr-only">User</span>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}