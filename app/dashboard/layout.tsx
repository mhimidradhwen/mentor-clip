import type { ReactNode } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import DashboardSidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import { getSession } from "@/lib/session"

async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await getSession()

    return (
        <SidebarProvider>
            <DashboardSidebar session={session} />
            <SidebarInset>
                <Header session={session} />
                <div className="flex flex-1 flex-col gap-4 p-6">
                    <main className="flex-1">{children}</main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default DashboardLayout
