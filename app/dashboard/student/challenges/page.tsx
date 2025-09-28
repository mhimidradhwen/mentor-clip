// supervisor/challenge/page.tsx
// This is a Server Component (no 'use client')

import { redirect } from 'next/navigation';
import { getSession } from "@/lib/session";
import SupervisorChallengeListClient from "@/components/supervisor/SupervisorChallengeListClient";

export default async function SupervisorChallengesPage() {
    // 1. Authorization Check (Server-side)
    const session = await getSession();

    if (!session || !session.user) {
        redirect('/login');
    }

    const userRole = (session.user as any).role;
    // Ensure the user has the required role to view the supervisor dashboard
    if (userRole !== 'supervisor' && userRole !== 'admin') {
        redirect('/dashboard?error=access_denied');
    }

    // 2. Render the client component for data fetching and display
    return (
        <div className="container mx-auto p-8 max-w-7xl">
            <h1 className="text-4xl font-extrabold mb-8 border-b pb-4 text-gray-900">Challenges for Review 📝</h1>

            <SupervisorChallengeListClient />
        </div>
    );
}