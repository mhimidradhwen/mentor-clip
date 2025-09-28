'use client';

// Import the component that handles the video submission form
import VideoSubmissionForm from "@/components/student/VideoSubmissionForm";
import { format, isFuture, isPast } from 'date-fns';
import { useMemo } from 'react';

// --- shadcn/ui Imports ---
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, User, Calendar, Send, XCircle } from 'lucide-react';
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";

// Define the props structure
interface ChallengeDetailClientProps {
    challenge: {
        id: string;
        title: string;
        description: string | null;
        startDate: string;
        endDate: string;
        isActive: boolean;
        creator: { name: string };
    };
    studentId: string;
}

export default function ChallengeDetailClient({ challenge, studentId }: ChallengeDetailClientProps) {
    const challengeStartDate = new Date(challenge.startDate);
    const challengeEndDate = new Date(challenge.endDate);

    const { label, variant, icon, isChallengeOpen } = useMemo(() => {
        const now = new Date();
        const isOpen = challenge.isActive && isFuture(challengeEndDate);

        if (!challenge.isActive) {
            return { label: 'Inactive', variant: 'secondary', icon: <XCircle className="w-4 h-4 mr-1" />, isChallengeOpen: false };
        }
        if (isPast(challengeEndDate)) {
            return { label: 'Closed', variant: 'destructive', icon: <Clock className="w-4 h-4 mr-1" />, isChallengeOpen: false };
        }
        if (isFuture(challengeStartDate)) {
            return { label: 'Starting Soon', variant: 'outline', icon: <Calendar className="w-4 h-4 mr-1" />, isChallengeOpen: false };
        }
        return { label: 'OPEN FOR SUBMISSIONS', variant: 'default', icon: <Send className="w-4 h-4 mr-1" />, isChallengeOpen: true };
    }, [challenge.isActive, challengeStartDate, challengeEndDate]);


    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-4xl space-y-8">
            {/* Header and Status */}
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{challenge.title}</h1>
                <div className="flex items-center space-x-4">
                    <Badge variant={variant as any} className="text-sm py-1 font-semibold">
                        {icon} {label}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center">
                        <User className="w-3 h-3 mr-1" /> Created by: {challenge.creator.name}
                    </span>
                </div>
            </div>

            <Separator />

            {/* Challenge Metadata and Description Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Challenge Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Dates Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-primary" />
                            <p>
                                <span className="font-medium text-foreground mr-1">Start Date:</span>
                                {format(challengeStartDate, 'MMM dd, yyyy HH:mm')}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-destructive" />
                            <p>
                                <span className="font-medium text-foreground mr-1">End Date:</span>
                                {format(challengeEndDate, 'MMM dd, yyyy HH:mm')}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">Description</h3>
                        <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                            {challenge.description || 'No detailed description available.'}
                        </p>
                    </div>
                </CardContent>
            </Card>


            {/* --- Submission Section --- */}
            {isChallengeOpen ? (
                // VideoSubmissionForm is a client component that handles its own fetch/state
                // We wrap the form in a Card for consistent visual style
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center">
                            <Send className="w-5 h-5 mr-2" /> Submit Your Video Solution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <VideoSubmissionForm
                            challengeId={challenge.id}
                            studentId={studentId}
                        />
                    </CardContent>
                </Card>
            ) : (
                <Alert variant="destructive" className="bg-red-50 border-red-300">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Submissions Closed</AlertTitle>
                    <AlertDescription>
                        This challenge is currently **{label.toLowerCase()}** and cannot receive submissions. Please check the dates above.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}