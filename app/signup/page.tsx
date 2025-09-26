import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {getSession} from "@/lib/session";
import {redirect} from "next/navigation";
import SignUpForm from "@/components/authentication/SignUpForm";

export default async function SignUpPage() {
    const session = await getSession();

    if (session) {
        redirect("/dashboard"); // 🔒 already logged in
    }
    return (
        <div className="relative container flex-1 shrink-0 items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Top right link (optional) */}
            <Link
                href="/login"
                className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "absolute top-4 right-4 md:top-8 md:right-8"
                )}
            >
                Login
            </Link>

            {/* Left side with branding / background */}
            <div className="text-primary relative hidden h-full flex-col p-10 lg:flex dark:border-r">
                <div
                    className="bg-primary/5 absolute inset-0"
                    style={{
                        backgroundImage: "url(/login-signup.png)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
            </div>

            {/* Right side with login form */}
            <div className="flex items-center justify-center lg:h-screen lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
                    <SignUpForm />
                </div>
            </div>
        </div>
    )
}