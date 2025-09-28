"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Eye, Key, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner'; // ⬅️ IMPORT SONNER'S TOAST

// Shadcn/ui Components
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
// import { useToast } from "@/components/ui/use-toast"; // ⬅️ REMOVED useToast
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// NOTE: These components must be adapted to use Shadcn's Dialog component internally.
import { RoleChangeModal, UserWithCounts } from "@/components/admin/UserRoleChanger";
import { UserDetails, UserDetailsModal } from "@/components/admin/UserDetails";


// --- Utility Functions ---

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// --- Main Component ---

const UsersTable: React.FC = () => {
    // const { toast } = useToast(); // ⬅️ REMOVED useToast hook
    const [users, setUsers] = useState<UserWithCounts[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for Modals
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithCounts | null>(null);
    const [detailedUserData, setDetailedUserData] = useState<UserDetails | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // Function to fetch the main user list
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/users');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch users: Status ${response.status}`);
            }

            const data: UserWithCounts[] = await response.json();
            setUsers(data);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            // ⬅️ SONNER IMPLEMENTATION FOR ERROR
            toast.error("Failed to load users", {
                description: errorMessage,
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    }, []); // Removed 'toast' from dependencies as Sonner's 'toast' is a stable function

    // Initial Data Fetch
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);


    // Handler for Role Update (passed to RoleChangeModal)
    const handleRoleUpdated = (updatedUser: UserWithCounts) => {
        setUsers(prevUsers =>
            prevUsers.map(u => u.id === updatedUser.id ? {
                ...u,
                role: updatedUser.role,
                updatedAt: updatedUser.updatedAt
            } : u)
        );
        // ⬅️ SONNER IMPLEMENTATION FOR SUCCESS
        toast.success("Role Updated", {
            description: `Role for ${updatedUser.name} updated to ${updatedUser.role}.`,
        });
    };

    // Handler for View Details button
    const handleViewDetails = async (user: UserWithCounts) => {
        setSelectedUser(user);
        setDetailedUserData(null);
        setIsDetailsModalOpen(true);
        setIsDetailLoading(true);

        try {
            const response = await fetch(`/api/admin/users/${user.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch detailed user data.');
            }
            const data: UserDetails = await response.json();
            setDetailedUserData(data);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            console.error("Error fetching detailed user data:", e);
            // ⬅️ SONNER IMPLEMENTATION FOR DETAILS ERROR
            toast.error("Details Load Error", {
                description: errorMessage,
            });
            setIsDetailsModalOpen(false);
        } finally {
            setIsDetailLoading(false);
        }
    };

    // Handler for Change Role button
    const handleChangeRole = (user: UserWithCounts) => {
        setSelectedUser(user);
        setIsRoleModalOpen(true);
    };

    // Utility for role badge variants
    const getRoleVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (role) {
            case 'admin':
                // Use 'destructive' or 'default' to represent 'admin'
                return 'destructive';
            case 'supervisor':
                return 'default';
            case 'student':
            default:
                return 'secondary';
        }
    };

    // --- Render Logic (Remains the same) ---

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <div className="flex items-center p-4 rounded-lg border border-red-300 bg-red-50 text-red-800">
                <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold">Failed to Load Users</h4>
                    <p className="text-sm">{error}</p>
                    <Button variant="destructive" onClick={fetchUsers} className="mt-2">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-gray-300 bg-gray-50 text-gray-700">
                <Users className="w-8 h-8 mb-3" />
                <p className="font-semibold">No users found.</p>
                <p className="text-sm">The user database appears to be empty.</p>
            </div>
        );
    }

    return (
        <div className="">

            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Name (Role)</TableHead>
                            <TableHead className="hidden sm:table-cell">Email</TableHead>
                            <TableHead className="text-center">Videos</TableHead>
                            <TableHead className="text-center">Notes</TableHead>
                            <TableHead className="hidden md:table-cell">Joined</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-mono text-xs max-w-[80px] truncate">{user.id}</TableCell>
                                <TableCell className="font-medium">
                                    {user.name}
                                    <br />
                                    <Badge variant={getRoleVariant(user.role)} className="mt-1 capitalize">
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                                <TableCell className="text-center">{user._count.uploadedVideos}</TableCell>
                                <TableCell className="text-center">{user._count.createdNotes}</TableCell>
                                <TableCell className="hidden md:table-cell">{formatDate(user.createdAt)}</TableCell>
                                <TableCell className="text-center w-[120px]">
                                    <div className="flex space-x-2 justify-center">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleViewDetails(user)}
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleChangeRole(user)}
                                            title="Change Role"
                                        >
                                            <Key className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Loading/Fetching Details State Overlay */}
                {isDetailsModalOpen && isDetailLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                        <Loader2 className="animate-spin text-primary w-6 h-6 mr-3" />
                        <p className="text-sm text-muted-foreground">Fetching user details...</p>
                    </div>
                )}
            </div>

            {/* Modals - These MUST be adapted to use Shadcn's Dialog */}
            {isDetailsModalOpen && (
                <UserDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    user={detailedUserData}
                />
            )}

            {isRoleModalOpen && selectedUser && (
                <RoleChangeModal
                    isOpen={isRoleModalOpen}
                    onClose={() => setIsRoleModalOpen(false)}
                    user={selectedUser}
                    onRoleUpdated={handleRoleUpdated}
                />
            )}
        </div>
    );
};

export default UsersTable;