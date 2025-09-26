import React from 'react';
import {getSession, Session} from "@/lib/session";
import StudentDahsboardHeader from "@/components/student/StudentDahsboardHeader";
import StudentDashboardShortcutsCards from "@/components/student/StudentDashboardShortcutsCards";
import StudentRecentsVideos from "@/components/student/StudentRecentsVideos";
import StudentRecentsSupervisorsNotes from "@/components/student/StudentRecentsSupervisorsNotes";

async function StudentDashboardPage() {
    const session = await getSession()
    return (
        <div className="container mx-auto">
            <StudentDahsboardHeader session={session as Session}/>
            <StudentDashboardShortcutsCards session={session as Session}/>
                <StudentRecentsSupervisorsNotes session={session as Session}/>
                <StudentRecentsVideos session={session as Session}/>
        </div>
    );
}

export default StudentDashboardPage;