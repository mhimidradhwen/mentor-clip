import React from 'react';
import UsersTable from "@/components/admin/UsersTable";

function UsersPage() {
    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900">Users Dashboard</h1>
                        <p className="text-neutral-600 text-sm mt-1">
                            Manage MentorClip users
                        </p>
                    </div>
                    {/* Assuming this page is ONLY for supervisors, we can remove the student upload link */}
                    {/* If a supervisor can also upload videos, change the href */}
                    {/* <Link href="/dashboard/student/upload" className={buttonVariants({ variant: "default" })}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Video
                    </Link> */}
                </div>
            </div>
            <UsersTable/>
        </div>
    );
}

export default UsersPage;