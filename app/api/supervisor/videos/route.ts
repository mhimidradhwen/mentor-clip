// app/api/supervisor/videos

import { NextResponse } from 'next/server';
import { PrismaClient } from "@/lib/generated/prisma";
import { getSession } from "@/lib/session";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const session = await getSession();

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized access. No session found." }, { status: 401 });
        }

        // 🛑 SECURITY CHECK: Ensure only supervisors can see ALL videos
        if (session.user.role !== 'supervisor') {
            return NextResponse.json({ error: "Access denied. Only supervisors can view all videos." }, { status: 403 });
        }

        // Fetch all videos, including the uploader's name and any notes/supervisors
        const videos = await prisma.video.findMany({
            include: {
                uploader: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                notes: {
                    include: {
                        supervisor: {
                            select: {
                                name: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc',
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return NextResponse.json(videos, { status: 200 });

    } catch (error) {
        console.error("Database error fetching all videos:", error);
        return NextResponse.json({
            error: "Failed to fetch all videos."
        }, { status: 500 });
    }
}