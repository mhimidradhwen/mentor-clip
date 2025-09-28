import { format } from 'date-fns';
import { Challenge } from "@/lib/generated/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

// Define the expected props
interface ChallengeListProps {
    challenges: (Challenge & {
        _count: { submissions: number };
        creator: { id: string; name: string };
    })[];
    onEdit: (challenge: Challenge) => void;
    onDelete: (id: string) => void;
}

export default function ChallengeList({ challenges, onEdit, onDelete }: ChallengeListProps) {
    if (challenges.length === 0) {
        return (
            <div className="p-6 text-center text-muted-foreground italic">
                No challenges have been created yet. Start by using the form above!
            </div>
        );
    }

    return (
        <div className="border-t">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Title</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead className="hidden sm:table-cell">Creator</TableHead>
                        <TableHead className="text-center">Submissions</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {challenges.map((challenge) => (
                        <TableRow key={challenge.id} data-state={challenge.isActive ? "active" : "inactive"}>
                            {/* Title (and a snippet of description for context) */}
                            <TableCell className="font-medium">
                                {challenge.title}
                                <p className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">
                                    {challenge.description?.substring(0, 40) || 'No description.'}
                                </p>
                            </TableCell>

                            {/* Dates */}
                            <TableCell className="text-xs text-muted-foreground">
                                **Start:** {format(new Date(challenge.startDate), 'MMM dd, yyyy')}
                                <br/>
                                **End:** {format(new Date(challenge.endDate), 'MMM dd, yyyy')}
                            </TableCell>

                            {/* Creator */}
                            <TableCell className="hidden sm:table-cell text-sm">
                                {challenge.creator.name}
                            </TableCell>

                            {/* Submissions */}
                            <TableCell className="text-center">
                                <Badge variant="secondary" className="font-semibold text-primary">
                                    {challenge._count.submissions}
                                </Badge>
                            </TableCell>

                            {/* Status */}
                            <TableCell className="text-center">
                                <Badge
                                    variant={challenge.isActive ? "default" : "outline"}
                                    className={`${challenge.isActive ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-gray-300 text-gray-500'}`}
                                >
                                    {challenge.isActive ? 'Active' : 'Draft/Inactive'}
                                </Badge>
                            </TableCell>

                            {/* Actions (using DropdownMenu for minimalism) */}
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(challenge)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit Challenge
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete(challenge.id)}
                                            className="text-red-600 focus:bg-red-50 focus:text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Challenge
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}