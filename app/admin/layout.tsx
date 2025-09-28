import React, {ReactNode} from "react";
import {getSession, Session} from "@/lib/session";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {children} from "effect/Fiber";

async function AdminLayout({children}: {children: ReactNode}) {
    const session = await getSession();
    if (!session) {
        redirect("/");
    }
    if (session.user.role !== "admin") {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r shadow-sm">
                <AdminSidebar session={session as Session} />
            </aside>

            {/* Main content */}
            <main className="flex-1 p-6">
                <div className="rounded-lg bg-white p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;