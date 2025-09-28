// components/supervisor/SupervisorChallengeListClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

// Define the type for challenges returned by the admin API for the list view
interface SupervisorChallenge {
    id: string;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string;
    isActive: boolean;
    creator: { name: string };
    _count: {
        submissions: number; // Count of submissions
    };
}

export default function SupervisorChallengeListClient() {
    const [challenges, setChallenges] = useState<SupervisorChallenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Client-side fetching logic
    const fetchChallenges = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Uses the authorized API endpoint
            const response = await fetch('/api/admin/challenge');

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || `Failed to fetch challenges: ${response.statusText}`);
            }

            const data: SupervisorChallenge[] = await response.json();
            setChallenges(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unknown error occurred while loading challenges.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChallenges();
    }, [fetchChallenges]);

    // --- Loading and Error States ---
    if (isLoading) {
        return <div className="p-8 text-center text-lg text-indigo-500">Loading challenges for review... ⏳</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600 border border-red-400 bg-red-50 rounded-lg">Error: {error} ❌</div>;
    }

    // --- Empty State ---
    if (challenges.length === 0) {
        return (
            <div className="p-10 text-center border border-dashed rounded-lg bg-gray-50">
                <p className="text-xl text-gray-600">No challenges found or available for review.</p>
            </div>
        );
    }

    // --- Main List Rendering ---
    return (
        <div className="space-y-6">
            {challenges.map((challenge) => {
                const isClosed = new Date(challenge.endDate) < new Date();
                const statusText = isClosed ? 'Closed' : 'Open';
                const statusColor = isClosed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';

                return (
                    <Link key={challenge.id} href={`/dashboard/supervisor/challenges/${challenge.id}`} passHref>
                        <div
                            className="block p-6 border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white cursor-pointer"
                        >
                            <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-semibold text-gray-800 hover:text-indigo-600">
                                    {challenge.title}
                                </h2>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColor}`}>
                                    {statusText}
                                </span>
                            </div>

                            <p className="text-gray-600 mt-2 line-clamp-2">
                                {challenge.description || 'No detailed description.'}
                            </p>

                            <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
                                <p className="flex items-center">
                                    <span className="font-bold text-gray-800 text-lg mr-1">
                                        {challenge._count.submissions}
                                    </span>
                                    <span className="font-medium">Submissions to Review</span>
                                </p>
                                <p>
                                    <span className="font-medium">Deadline:</span> {format(new Date(challenge.endDate), 'MMM dd, yyyy HH:mm')}
                                </p>
                                <p>
                                    <span className="font-medium">Created by:</span> {challenge.creator.name}
                                </p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}