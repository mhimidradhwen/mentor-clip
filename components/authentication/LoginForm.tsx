"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { signIn } from "@/lib/actions/auth-actions";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {Loader} from "lucide-react";

// ✅ Validation schema
const formSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });


    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true);
            const result = await signIn(values.email, values.password);

            if (result?.error) {
                // Handle server-side errors
                form.setError("email", { message: result.error.message });
            } else if (result?.redirectUrl) {
                // 💥 FIX: Client-side redirect using the URL returned from the server
                router.push(result.redirectUrl);
            } else {
                // Fallback redirect if redirectUrl is missing (shouldn't happen)
                router.push("/login/success-handler");
            }
        } catch (err) {
            console.error(err);
            form.setError("email", { message: "Something went wrong." });
        } finally {
            // NOTE: Keep loading true or false, but the redirect will likely
            // happen before this resolves completely.
            // setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen ">
            <div className="w-full max-w-md ">
                <div className="flex flex-col gap-2 text-center mb-4">
                    <h1 className="text-2xl font-semibold tracking-tight">Welcome Back!</h1>
                    <p className="text-muted-foreground text-sm">
                        Enter your credentials below to login to your account
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="you@example.com"
                                            type="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/> {/* This is the key change! */}
                                </FormItem>
                            )}
                        />

                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="password" placeholder="********" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        {/* Submit */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader className="animate-spin"/> : "Login"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}