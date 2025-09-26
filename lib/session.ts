// lib/get-session.ts
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";

export async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return session;
}

export interface Session {
    user: {
        id: string
        name: string
        email: string
        role: string
        avatar?: string
    }
}