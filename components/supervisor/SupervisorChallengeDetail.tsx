// components/supervisor/SupervisorChallengeDetail.tsx
'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import FeedbackForm from "./FeedbackForm";
import VideoPlayer from "@/components/supervisor/VideoPlayer";

// Define the type for the challenge data received as props
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
        s3Key: string;
        uploader: { id: string; name: string };
        notes: Feedback[];
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
    submissions?: Submission[];
}

interface SupervisorChallengeDetailProps {
    challenge: ChallengeDetail;
    userRole: string;
}


export default function SupervisorChallengeDetail({ challenge: initialChallenge, userRole }: SupervisorChallengeDetailProps) {
    const [challenge, setChallenge] = useState(initialChallenge);

    const isChallengeOpen = challenge.isActive && new Date(challenge.endDate) > new Date();

    // Function to re-fetch the challenge data after a score/note is submitted
    const refetchChallenge = useCallback(async () => {
        // Re-fetch the data to get the updated score/note
        const response = await fetch(`/api/admin/challenge?id=${challenge.id}`, { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            setChallenge(data);
        } else {
            console.error("Failed to re-fetch challenge data after feedback update.");
        }
    }, [challenge.id]);


    return (
        <div className="container mx-auto p-8 max-w-6xl">
            <h1 className="text-4xl font-extrabold mb-2 text-gray-900">{challenge.title}</h1>
            <p className="text-xl text-indigo-600 mb-6">Challenge Review Interface</p>

            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div className="text-sm text-gray-600 space-y-1">
                    <p>
                        **Created by:** {challenge.creator.name}
                    </p>
                    <p>
                        **Deadline:** {format(new Date(challenge.endDate), 'MMM dd, yyyy HH:mm')}
                    </p>
                </div>
                <span className={`px-4 py-2 font-bold rounded-full text-white shadow-md ${
                    isChallengeOpen ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {isChallengeOpen ? 'OPEN' : 'CLOSED'}
                </span>
            </div>

            <div className="mb-10 p-4 bg-gray-50 rounded-lg border">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Total Submissions: {challenge.submissions?.length || 0}</h2>
                <p className="text-gray-600">{challenge.description || 'No detailed description available.'}</p>
            </div>

            {/* --- Submissions List --- */}
            <div className="space-y-12">
                {challenge.submissions && challenge.submissions.length > 0 ? (
                    challenge.submissions.map((submission, index) => {
                        const existingFeedback = submission.video.notes?.[0] || null;

                        return (
                            <div key={submission.id} className="border-2 border-gray-200 p-6 rounded-xl shadow-lg bg-white">
                                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                                    {index + 1}. Review: {submission.video.title}
                                    <span className="text-base font-normal text-gray-500 ml-3">by {submission.video.uploader.name}</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Video Player Section */}
                                    <div className="md:col-span-2">
                                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                            <VideoPlayer s3Key={submission.video.s3Key} videoTitle={submission.video.title} />
                                        </div>
                                    </div>

                                    {/* Score and Note Section */}
                                    <div className="md:col-span-1">
                                        <FeedbackForm
                                            submissionId={submission.id}
                                            initialFeedback={existingFeedback}
                                            onFeedbackUpdated={refetchChallenge}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-10 text-center border border-dashed rounded-lg bg-gray-50">
                        <p className="text-xl text-gray-600">No videos have been submitted to this challenge yet. 😢</p>
                    </div>
                )}
            </div>
        </div>
    );
}