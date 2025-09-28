// app/login/success-handler/page.tsx
import { redirect } from 'next/navigation';
import {getSession} from "@/lib/session";

export default async function LoginSuccessPage() {
    // 1. Get the current session
    // ASSUMPTION: Your `auth.getSession()` returns a session object
    // with a user object that includes the `role` property (e.g., session.user.role).
    const session = await getSession();

    // 2. Validate session
    if (!session || !session.user || !session.user.role) {
        // Redirect to a default login page if no session or role is found
        redirect('/login');
    }

    // 3. Determine the redirect path based on the role
    const userRole = session.user.role;
    let redirectPath: string;

    if (userRole === "student") {
        redirectPath = "/dashboard/student/dashboard";
    } else if (userRole === "supervisor") {
        redirectPath = "/dashboard/supervisor/dashboard";
    } else if (userRole === "admin") {
        // THIS IS THE NEW LOGIC FOR THE ADMIN ROLE
        redirectPath = "/admin/dashboard";
    } else {
        // Fallback for unknown or unhandled roles
        redirectPath = "/dashboard";
    }

    // 4. Perform the server-side redirect
    redirect(redirectPath);
}