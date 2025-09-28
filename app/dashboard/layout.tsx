import type { ReactNode } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import DashboardSidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import { getSession } from "@/lib/session"
import { getSessionData } from "@/lib/server-utils"

async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await getSession()

    // Get Stream credentials using your existing server-utils
    let streamApiKey: string | undefined
    let streamUserToken: string | undefined

    if (session?.user) {
        try {
            const sessionData = await getSessionData()
            streamApiKey = sessionData.apiKey
            streamUserToken = sessionData.userToken
        } catch (error) {
            console.error('Error getting Stream session data:', error)
            // Fallback to just the API key if session data fails
            streamApiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY
        }
    }

    return (
        <SidebarProvider>
            <DashboardSidebar session={session} />
            <SidebarInset>
                <Header
                    session={session}
                    streamApiKey={streamApiKey}
                    streamUserToken={streamUserToken}
                />
                <div className="flex flex-1 flex-col gap-4 p-6">
                    <main className="flex-1">{children}</main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default DashboardLayout