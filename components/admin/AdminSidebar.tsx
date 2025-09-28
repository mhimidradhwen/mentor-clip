"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Home,
    Users,
    Settings,
    BarChart3,
    LogOut, FileVideo2Icon, MessageCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {SidebarHeader} from "@/components/ui/sidebar";
import {Session} from "@/lib/session";
import {signOut} from "@/lib/actions/auth-actions";
import {router} from "next/client";

const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Videos", href: "/admin/videos", icon: FileVideo2Icon },
    { name: "Messages", href: "/admin/messages", icon: MessageCircleIcon },
];

function AdminSidebar({session}: {session: Session}) {
    const handleSignOut = async () => {
        await signOut()
        router.push("/") // redirect after logout
    }
    return (
        <div className="flex h-screen w-64 flex-col border-r bg-white shadow-sm">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    {/* Logo container */}
                    <div className="flex items-center gap-2">
                        <img
                            src="/mentor-clip-logo.png"
                            alt="Logo"
                            className="h-8 w-8 rounded-lg object-contain"
                        />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">MentorClip</span>
                            <span className="truncate text-xs text-sidebar-foreground/70">
          {session?.user.role || "Guest"}
        </span>
                        </div>
                    </div>
                </div>
            </SidebarHeader>

            {/* Nav Items */}
            <nav className="flex-1 px-2 py-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <TooltipProvider key={item.name}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>{item.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t">
                <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}

export default AdminSidebar;