import type { Session } from "@/lib/session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {BookOpen, Calendar, FileText, Users, GraduationCap, MessageSquare, VideoIcon, UploadIcon} from "lucide-react"

interface StudentDashboardShortcutsCardsProps {
    session: Session
}

export default function StudentDashboardShortcutsCards({ session }: StudentDashboardShortcutsCardsProps) {
    const shortcuts = [
        {
            title: "My Videos",
            description: "View enrolled courses and materials",
            icon: VideoIcon,
            href: "/courses",
            color: "text-blue-600",
        },

        {
            title: "Messages",
            description: "Chat with professors and peers",
            icon: MessageSquare,
            href: "/messages",
            color: "text-indigo-600",
        },
    ]

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
                {shortcuts.map((shortcut) => {
                    const IconComponent = shortcut.icon
                    return (
                        <Card key={shortcut.title} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="pb-3">
                                <div className="flex items-center space-x-3">
                                    <IconComponent className={`h-6 w-6 ${shortcut.color}`} />
                                    <CardTitle className="text-lg">{shortcut.title}</CardTitle>
                                </div>
                            </CardHeader>

                        </Card>
                    )
                })}


            </div>
        </div>
    )
}
