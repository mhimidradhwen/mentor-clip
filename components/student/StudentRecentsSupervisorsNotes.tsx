import type { Session } from "@/lib/session"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, AlertCircle } from "lucide-react"

interface StudentRecentsSupervisorsNotesProps {
    session: Session
}

export default function StudentRecentsSupervisorsNotes({ session }: StudentRecentsSupervisorsNotesProps) {
    // Mock data - replace with actual data fetching
    const supervisorNotes = [
        {
            id: 1,
            supervisor: {
                name: "Dr. Sarah Johnson",
                avatar: "/professor-avatar.png",
            },
            subject: "Mid-term Performance Review",
            content: "Great progress in your core subjects. Consider taking advanced algorithms next semester.",
            date: "2024-01-16",
            priority: "medium",
            status: "unread",
        },
        {
            id: 2,
            supervisor: {
                name: "Prof. Michael Chen",
                avatar: "/professor-avatar-male.jpg",
            },
            subject: "Research Project Update",
            content: "Your literature review is comprehensive. Please schedule a meeting to discuss methodology.",
            date: "2024-01-14",
            priority: "high",
            status: "read",
        },
        {
            id: 3,
            supervisor: {
                name: "Dr. Emily Rodriguez",
                avatar: "/professor-avatar-female.jpg",
            },
            subject: "Internship Opportunities",
            content: "I found several internship positions that match your interests. Let's discuss strategies.",
            date: "2024-01-12",
            priority: "low",
            status: "read",
        },
    ]

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold mb-4">Supervisors Notes</h2>
                <Button variant="ghost" size="sm" className="text-sm">
                    View All
                </Button>
            </div>
            <div className="space-y-3">
                {supervisorNotes.map((note) => (
                    <Card
                        key={note.id}
                        className={`${
                            note.status === "unread" ? "bg-blue-50/30 border-blue-200" : ""
                        } hover:shadow-sm transition-shadow`}
                    >
                        <CardContent className="p-3">
                            <div className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={note.supervisor.avatar || "/placeholder.svg"} alt={note.supervisor.name} />
                                    <AvatarFallback className="text-xs">
                                        {note.supervisor.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-medium text-sm">{note.supervisor.name}</h3>
                                            {note.priority === "high" && <AlertCircle className="h-3 w-3 text-red-500" />}
                                            {note.status === "unread" && <div className="h-2 w-2 bg-blue-600 rounded-full" />}
                                        </div>
                                    </div>
                                    <h4 className="font-medium text-sm mb-1">{note.subject}</h4>
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{note.content}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(note.date).toLocaleDateString()}
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                                            See Notes
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
