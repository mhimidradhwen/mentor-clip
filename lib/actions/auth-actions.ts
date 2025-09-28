"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Define the response type for clarity
type ActionResponse = {
    error?: {
        message: string;
    };
    redirectUrl?: string;

};

export const signUp = async (email: string, password: string, name: string, role: 'student' | 'supervisor'): Promise<ActionResponse> => {
    try {
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
                role,
                callbackURL: "/dashboard",
            },
        });
        // On success, return an empty object or a success flag
        return {
            redirectUrl: "/login/success-handler"
        };    } catch (err: any) {
        // On error, return an object with an 'error' property
        console.error(err);
        return {
            error: {
                message: err.message || "Something went wrong during sign up.",
            },
        };
    }
};

export const signIn = async (email: string, password: string): Promise<ActionResponse> => {
    try {
        await auth.api.signInEmail({
            body: {
                email,
                password,
                callbackURL: "/login/success-handler"
            }
        });
        // On success, return an empty object
        return {};
    } catch (err: any) {
        // On error, return an object with an 'error' property
        console.error(err);
        return {
            error: {
                message: err.message || "Invalid credentials. Please try again.",
            },
        };
    }
};

export const signOut = async () => {
    await auth.api.signOut({ headers: await headers() });
};