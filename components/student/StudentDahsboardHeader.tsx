"use client"
import React from 'react';
import {Button, buttonVariants} from "@/components/ui/button";
import {Upload} from "lucide-react";
import {Session} from "@/lib/session";
import Link from "next/link";

function StudentDahsboardHeader({session}: {session: Session}) {

    return (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome Back <span className="font-medium">{session.user.name}</span></p>
                </div>
                <Link href="/dashboard/student/upload" className={buttonVariants({ variant: "default" })}>
                    <Upload className="h-4 w-4" />
                    Upload New Video
                </Link>
            </div>
    );
}

export default StudentDahsboardHeader;