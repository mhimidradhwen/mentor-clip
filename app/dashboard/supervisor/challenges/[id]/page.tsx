// supervisor/challenge/[id]/page.tsx
// This is a Server Component (no 'use client')

import { notFound, redirect } from 'next/navigation';
import { getSession } from "@/lib/session";
import SupervisorChallengeDetail from "@/components/supervisor/SupervisorChallengeDetail";

// Define the type for the challenge, including submissions/notes for the supervisor
interface Feedback {
    id: string;
    score: number;
    content: string;
    supervisor: { name: string };
    updatedAt: string;
}

interface Submission {
    id: string;
    video: {
        id: string;
        title: string;
        s3Key: string; // Needed for video player/link
        uploader: { id: string; name: string };
        notes: Feedback[]; // Notes linked via Video model
    };
}

interface ChallengeDetail {
    id: string;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string;
    isActive: boolean;
    creator: { name: string };
    submissions?: Submission[]; // Full submission list for authorized users
}

interface ChallengeDetailPageProps {
    params: {
        id: string; // The challenge ID from the URL
    };
}

// Function to fetch challenge details (uses the /api/admin/challenge?id=... endpoint)
async function fetchChallengeDetail(challengeId: string): Promise<ChallengeDetail | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

    try {
        const response = await fetch(`${baseUrl}/api/admin/challenge?id=${challengeId}`, {
            cache: 'no-store'
        });

        if (response.status === 404) {
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch challenge details: ${response.statusText}`);
        }

        const data: ChallengeDetail = await response.json();
        return data;
    } catch (err) {
        console.error("Server-side challenge fetch error:", err);
        return null;
    }
}


export default async function SupervisorChallengeDetailPage({ params }: ChallengeDetailPageProps) {
    const challengeId = params.id;

    // 1. Authorization Check (Supervisor/Admin only)
    const session = await getSession();

    if (!session || !session.user) {
        redirect('/login');
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'supervisor' && userRole !== 'admin') {
        return (
            <div className="p-8 text-center text-red-600 border border-red-300 bg-red-50 rounded-lg">
                Access denied. Only Supervisors and Admins can access challenge details for review.
            </div>
        );
    }

    // 2. Data Fetching
    const challenge = await fetchChallengeDetail(challengeId);

    if (!challenge) {
        // If the challenge is not found or is restricted (API returns 404)
        notFound();
    }

    // 3. Pass data to the Client Component
    return (
        <SupervisorChallengeDetail
            challenge={challenge}
            userRole={userRole}
            // Pass the entire session user object if needed for context, but studentId (which is the user ID) is usually sufficient
        />
    );
}