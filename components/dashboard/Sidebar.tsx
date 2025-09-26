import {
    Home,
    Users,
    BarChart3,
    Settings,
    FileText,
    Calendar,
    Mail,
    HelpCircle,
    ChevronRight,
    FileVideo
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { Session } from "@/lib/session"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// Define navigation items for each role
const studentNavigationItems = [
    {
        title: "Dashboard",
        url: "/dashboard/student/dashboard",
        icon: Home,
    },
    {
        title: "My Videos",
        url: "/dashboard/student/videos",
        icon: FileVideo,
    },

    {
        title: "Messages",
        url: "/dashboard/student/messages",
        icon: Mail,
    },
];

const supervisorNavigationItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Videos",
        url: "/dashboard/supervisor/videos",
        icon: Users,
    },

    {
        title: "Messages",
        url: "/dashboard/supervisor/messages",
        icon: Mail,
    },
];

const adminNavigationItems = [
    {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: Home,
    },
    {
        title: "Users",
        url: "/admin/users",
        icon: Users,
    },
    {
        title: "System Settings",
        url: "/admin/admin-settings",
        icon: Settings,
    },
    {
        title: "Analytics",
        url: "/admin/analytics",
        icon: BarChart3,
        items: [
            {
                title: "Overview",
                url: "/admin/analytics/overview",
            },
            {
                title: "Reports",
                url: "/admin/analytics/reports",
            },
            {
                title: "Insights",
                url: "/admin/analytics/insights",
            },
        ],
    },
    {
        title: "Documents",
        url: "/admin/documents",
        icon: FileText,
    },
    {
        title: "Messages",
        url: "/admin/messages",
        icon: Mail,
    },
];

const sharedSupportItems = [
    {
        title: "Help Center",
        url: "/help",
        icon: HelpCircle,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
];
interface DashboardSidebarProps {
    session: Session | null
}

// Re-use the navigation and support item lists from above...

export default function DashboardSidebar({ session }: DashboardSidebarProps) {
    const userRole = session?.user?.role;
    let navigationItemsToRender: any[] = [];
    let supportItemsToRender: any[] = sharedSupportItems;

    switch (userRole) {
        case "student":
            navigationItemsToRender = studentNavigationItems;
            break;
        case "supervisor":
            navigationItemsToRender = supervisorNavigationItems;
            break;
        case "admin":
            navigationItemsToRender = adminNavigationItems;
            break;
        default:
            navigationItemsToRender = [];
            break;
    }

    return (
        <Sidebar variant="inset">
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

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItemsToRender.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {item.items ? (
                                        <Collapsible asChild defaultOpen={false}>
                                            <div>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton tooltip={item.title}>
                                                        {item.icon && <item.icon />}
                                                        <span>{item.title}</span>
                                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items?.map((subItem:any) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild>
                                                                    <a href={subItem.url}>
                                                                        <span>{subItem.title}</span>
                                                                    </a>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </div>
                                        </Collapsible>
                                    ) : (
                                        <SidebarMenuButton tooltip={item.title} asChild>
                                            <a href={item.url}>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {supportItemsToRender.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton tooltip={item.title} asChild>
                                        <a href={item.url}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <div className="p-1">
                    {session && (
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium">
                                {session.user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate text-xs font-medium">{session.user.name}</span>
                                <span
                                    className="truncate text-xs text-sidebar-foreground/70">{session.user.email}</span>
                            </div>
                        </div>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}