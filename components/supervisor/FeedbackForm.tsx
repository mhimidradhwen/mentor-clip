// components/supervisor/FeedbackForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

// Define the shape of the existing feedback (linked via Video model)
interface Feedback {
    id: string;
    score: number;
    content: string; // Maps to the 'content' field in VideoNote
    supervisor: { name: string };
    updatedAt: string;
}

interface FeedbackFormProps {
    submissionId: string;
    initialFeedback: Feedback | null; // Passed from the parent component
    onFeedbackUpdated: () => void; // Callback to refresh data in parent
}

export default function FeedbackForm({ submissionId, initialFeedback, onFeedbackUpdated }: FeedbackFormProps) {
    const [score, setScore] = useState<number | ''>(initialFeedback?.score ?? '');
    const [noteContent, setNoteContent] = useState<string>(initialFeedback?.content ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setScore(initialFeedback?.score ?? '');
        setNoteContent(initialFeedback?.content ?? '');
        setStatus('idle');
        setErrorMessage(null);
    }, [initialFeedback]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setStatus('idle');

        if (score === '' || noteContent.trim() === '') {
            setErrorMessage('Score and Note fields are required.');
            setStatus('error');
            return;
        }
        if (typeof score !== 'number' || score < 0 || score > 100) {
            setErrorMessage('Score must be a number between 0 and 100.');
            setStatus('error');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/supervisor/submission/${submissionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ score: score, note: noteContent }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit feedback.');
            }

            setStatus('success');
            onFeedbackUpdated();

        } catch (e: any) {
            setErrorMessage(e.message);
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 border border-indigo-300 bg-indigo-50 rounded-lg shadow-inner h-full flex flex-col">
            <h4 className="text-xl font-bold mb-3 text-indigo-800">Review Score & Notes ✍️</h4>

            {initialFeedback && (
                <p className="text-sm text-gray-600 mb-3">
                    **Last Scored:** {initialFeedback.score}/100 by {initialFeedback.supervisor.name} on {format(new Date(initialFeedback.updatedAt), 'MMM dd, HH:mm')}
                </p>
            )}

            <p className="text-xs text-orange-700 bg-orange-100 p-2 rounded mb-3">
                ⚠️ **Schema Note:** Score/Note is applied to the **video**, affecting all submissions of this video.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 flex-grow flex flex-col">
                {/* Score Input */}
                <div>
                    <label htmlFor="score" className="block text-sm font-medium text-gray-700">Score (0-100)*</label>
                    <input
                        type="number"
                        id="score"
                        value={score}
                        onChange={(e) => setScore(e.target.value === '' ? '' : parseInt(e.target.value))}
                        min="0"
                        max="100"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Note/Feedback Textarea */}
                <div className="flex-grow">
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700">Detailed Feedback Note*</label>
                    <textarea
                        id="note"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={4}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 flex-grow min-h-[100px]"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Status Messages */}
                {status === 'error' && errorMessage && (
                    <div className="p-2 bg-red-100 text-red-700 border border-red-400 rounded text-sm">
                        {errorMessage}
                    </div>
                )}
                {status === 'success' && (
                    <div className="p-2 bg-green-100 text-green-700 border border-green-400 rounded text-sm">
                        Feedback successfully saved!
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 rounded-md font-semibold text-white transition mt-2 ${
                        isSubmitting
                            ? 'bg-indigo-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {isSubmitting ? 'Saving...' : initialFeedback ? 'Update Feedback' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    );
}