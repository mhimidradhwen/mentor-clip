'use client';

import { useState, useEffect, useCallback } from 'react';
import { Challenge } from "@/lib/generated/prisma";
import ChallengeForm from "@/components/admin/ChallengeForm";
import ChallengeList from "@/components/admin/ChallengeList";

// --- shadcn/ui Imports ---
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Zap, LayoutList, Pencil, Trash2, AlertTriangle } from 'lucide-react'; // Icons
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner'; // Use Sonner for notifications

// Define a type for the Challenge with submission count (as returned by the GET /api/admin/challenge)
type ChallengeWithCount = Challenge & {
    _count: { submissions: number };
    creator: { id: string; name: string };
};

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<ChallengeWithCount[]>([]);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New state for Dialog-based deletion
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [challengeToDeleteId, setChallengeToDeleteId] = useState<string | null>(null);

    // --- Fetch Data ---
    const fetchChallenges = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/challenge');

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || `Failed to fetch challenges: ${response.statusText}`);
            }

            const data: ChallengeWithCount[] = await response.json();
            setChallenges(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChallenges();
    }, [fetchChallenges]);

    // --- CRUD Handlers ---

    // Handle Create/Update Success
    const handleFormSuccess = () => {
        setSelectedChallenge(null); // Clear form state
        fetchChallenges(); // Refresh the list
        toast.success("Challenge saved successfully!");
    };

    // 1. Initiate Delete (opens the dialog)
    const initiateDelete = (id: string) => {
        setChallengeToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    // 2. Confirm and Execute Delete
    const executeDelete = async () => {
        if (!challengeToDeleteId) return;

        setIsDeleteDialogOpen(false); // Close the dialog immediately

        try {
            const id = challengeToDeleteId;
            const response = await fetch(`/api/admin/challenge?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to delete challenge.');
            }

            // Optimistically update state
            setChallenges(prev => prev.filter(c => c.id !== id));
            toast.success("Challenge deleted successfully.", {
                description: `ID: ${id}`
            });

        } catch (err: any) {
            console.error('Deletion error:', err);
            toast.error("Deletion failed", {
                description: err.message,
            });
        } finally {
            setChallengeToDeleteId(null);
        }
    };

    // Handle Edit selection
    const handleEdit = (challenge: ChallengeWithCount) => {
        const baseChallenge: Challenge = {
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            startDate: challenge.startDate,
            endDate: challenge.endDate,
            isActive: challenge.isActive,
            creatorId: challenge.creatorId,
            createdAt: challenge.createdAt,
            updatedAt: challenge.updatedAt,
        };
        setSelectedChallenge(baseChallenge);
    };

    // --- Loading and Error States (Minimalist Shadcn look) ---
    if (isLoading) {
        return (
            <div className="p-8 flex justify-center items-center h-40">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <span className="text-lg text-muted-foreground">Loading challenges...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-destructive/10 border border-destructive rounded-lg max-w-lg mx-auto">
                <div className="flex justify-center items-center mb-4">
                    <Zap className="h-6 w-6 text-destructive mr-2" />
                    <h2 className="text-xl font-semibold text-destructive">An Error Occurred</h2>
                </div>
                <p className="text-sm text-destructive/90">{error}</p>
                <Button onClick={fetchChallenges} variant="outline" className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    // --- Main Content (Shadcn Layout) ---
    return (
        <div className="container mx-auto p-4 sm:p-8">
            {/* --- Header --- */}
            <div className="flex items-center space-x-2 mb-8">
                <LayoutList className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Challenge Management</h1>
            </div>
            <Separator className="mb-8" />

            {/* --- Challenge Form Card --- */}
            <Card className="mb-10">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        {selectedChallenge ? (
                            <>
                                <Pencil className="w-5 h-5 mr-2 text-yellow-600" />
                                Edit Challenge: {selectedChallenge.title}
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5 mr-2 text-green-600" />
                                Create New Challenge
                            </>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChallengeForm
                        challengeToEdit={selectedChallenge}
                        onSuccess={handleFormSuccess}
                        onCancel={() => setSelectedChallenge(null)}
                    />
                </CardContent>
            </Card>

            {/* --- Challenge List Card --- */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">
                        Existing Challenges <span className="text-sm font-normal text-muted-foreground">({challenges.length})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ChallengeList
                        challenges={challenges}
                        onEdit={handleEdit}
                        onDelete={initiateDelete} // Pass the new initiator function
                    />
                </CardContent>
            </Card>

            {/* ======================================================= */}
            {/* Delete Confirmation Dialog (Shadcn UI) */}
            {/* ======================================================= */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="flex flex-row items-center space-x-3">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you absolutely sure you want to delete this challenge? This action **cannot be undone**. All associated submissions will also be removed.
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={executeDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}