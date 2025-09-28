"use client"
import React, { useState, useEffect } from 'react';
import { Loader2, Key, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner'; // Import Sonner's toast

// Shadcn/ui Components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge"; // For current role display

// --- Type Definitions (Kept the same) ---

export interface UserWithCounts {
    id: string;
    name: string;
    email: string;
    role: string;
    studentId: string | null;
    professionalId: string | null;
    class: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
        uploadedVideos: number;
        createdNotes: number;
    };
}

// --- Role Change Modal Component ---

interface RoleChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserWithCounts | null;
    onRoleUpdated: (updatedUser: UserWithCounts) => void;
}

const ALL_ROLES = ['student', 'supervisor', 'admin'];

export const RoleChangeModal: React.FC<RoleChangeModalProps> = ({ isOpen, onClose, user, onRoleUpdated }) => {
    const [newRole, setNewRole] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    // Removed local status state, using Sonner for feedback

    useEffect(() => {
        if (user) {
            setNewRole(user.role);
            // Reset any temporary state
        }
    }, [user]);

    // Utility for role badge variants (copied from UsersTable for consistency)
    const getRoleVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'professional': // assuming 'professional' is now 'supervisor' or similar in ALL_ROLES
            case 'supervisor':
                return 'default';
            case 'student':
            default:
                return 'secondary';
        }
    };


    const handleUpdate = async () => {
        if (!user) return;

        if (newRole === user.role) {
            toast.warning('No Change', {
                description: "The selected role is the same as the user's current role.",
            });
            return;
        }

        setIsUpdating(true);
        const loadingToastId = toast.loading(`Changing role for ${user.name}...`);

        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `API Status ${response.status}`);
            }

            const updatedUserData = await response.json();

            // Update the parent table data
            const updatedUser: UserWithCounts = {
                ...user,
                role: updatedUserData.role,
                updatedAt: updatedUserData.updatedAt
            };
            onRoleUpdated(updatedUser);

            // Success notification and modal close
            toast.success("Role Change Successful", {
                description: `${user.name}'s role is now ${updatedUserData.role}.`,
                id: loadingToastId, // Dismiss loading toast
            });
            onClose(); // Close the modal on success

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';

            // Error notification
            toast.error("Role Change Failed", {
                description: errorMessage,
                id: loadingToastId, // Dismiss loading toast
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (!user) return null;

    // Use the Shadcn/ui Dialog component for a minimal and accessible modal
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        <Key className="w-5 h-5 inline mr-2 text-primary" />
                        Change Role for {user.name}
                    </DialogTitle>
                    <DialogDescription>
                        Update the administrative role for this user. Be cautious when assigning elevated privileges.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Current Role Display */}
                    <div className="flex items-center space-x-2">
                        <Label>Current Role:</Label>
                        <Badge variant={getRoleVariant(user.role)} className="capitalize">
                            {user.role}
                        </Badge>
                    </div>

                    {/* Role Selection */}
                    <div className="grid gap-2">
                        <Label htmlFor="role-select">Select New Role</Label>
                        <Select
                            value={newRole}
                            onValueChange={setNewRole}
                            disabled={isUpdating}
                        >
                            <SelectTrigger id="role-select" className="w-full">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {ALL_ROLES.map(role => (
                                    <SelectItem key={role} value={role} className="capitalize">
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Warning Message for Admin Role */}
                    {newRole === 'admin' && (
                        <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                            <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">
                                Granting **Admin** status gives the user full control over the system. Proceed with extreme caution.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {/* Footer Buttons */}
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleUpdate}
                        disabled={isUpdating || newRole === user.role}
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                Updating...
                            </>
                        ) : (
                            'Confirm Change'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};