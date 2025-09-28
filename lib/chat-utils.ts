// ./lib/chat-utils.ts

// Simple function to create a unique hash (FNV-1a) from a string.
// This ensures the ID is short and consistent.
export function createShortId(str: string): string {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    // Ensure the output is a positive, 32-bit hex string (max 8 characters)
    return (hash >>> 0).toString(16);
}