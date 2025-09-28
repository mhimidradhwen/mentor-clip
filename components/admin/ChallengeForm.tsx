'use client';

import { useState, useEffect } from 'react';
import { Challenge } from "@/lib/generated/prisma";

// --- shadcn/ui Imports ---
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import {Loader2} from "lucide-react"; // For displaying validation errors

interface ChallengeFormProps {
    challengeToEdit: Challenge | null;
    onSuccess: () => void;
    onCancel: () => void;
}

// Define the shape of the form data
interface FormData {
    title: string;
    description: string;
    startDate: string; // ISO string for form input
    endDate: string;   // ISO string for form input
    isActive: boolean;
}

// Helper to format Date to datetime-local string
const formatDateForInput = (date: Date): string => {
    return date.toISOString().substring(0, 16);
};

export default function ChallengeForm({ challengeToEdit, onSuccess, onCancel }: ChallengeFormProps) {
    const isEditing = !!challengeToEdit;

    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        startDate: formatDateForInput(new Date()),
        endDate: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        isActive: true,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    // Removed local error state since we're using Sonner toast

    // --- Effect to load data when editing a challenge ---
    useEffect(() => {
        if (challengeToEdit) {
            setFormData({
                title: challengeToEdit.title,
                description: challengeToEdit.description || '',
                startDate: formatDateForInput(new Date(challengeToEdit.startDate)),
                endDate: formatDateForInput(new Date(challengeToEdit.endDate)),
                isActive: challengeToEdit.isActive,
            });
        } else {
            // Reset form if challengeToEdit is null
            setFormData({
                title: '',
                description: '',
                startDate: formatDateForInput(new Date()),
                endDate: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
                isActive: true,
            });
        }
    }, [challengeToEdit]);

    // --- Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, isActive: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Basic date validation (using toast for cleaner error display)
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            toast.error('Validation Failed', {
                description: 'Start date must be before end date.',
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const method = isEditing ? 'PUT' : 'POST';
            const body = isEditing ? { id: challengeToEdit!.id, ...formData } : formData;

            const response = await fetch('/api/admin/challenge', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || `Failed to ${isEditing ? 'update' : 'create'} challenge.`);
            }

            onSuccess(); // Triggers success toast in parent component
        } catch (err: any) {
            console.error('Submission error:', err);
            toast.error(`Error ${isEditing ? 'Updating' : 'Creating'} Challenge`, {
                description: err.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // The component content is simplified by using shadcn components
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="title">Title*</Label>
                <Input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Spring 2025 Coding Challenge"
                />
            </div>

            {/* Description */}
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide a detailed description of the challenge rules and goals."
                    rows={3}
                />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="startDate">Start Date*</Label>
                    <Input
                        type="datetime-local"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="endDate">End Date*</Label>
                    <Input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            {/* Is Active Switch */}
            <div className="flex items-center space-x-3 pt-2">
                <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isActive">
                    Challenge is **Active** (Can receive submissions)
                </Label>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : isEditing ? (
                        'Update Challenge'
                    ) : (
                        'Create Challenge'
                    )}
                </Button>
                {isEditing && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel Edit
                    </Button>
                )}
            </div>
        </form>
    );
}