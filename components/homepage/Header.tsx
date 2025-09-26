import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import Link from "next/link";

export function Header() {
    return (
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between mx-auto">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Play className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-semibold">Mentor Clip</span>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <a href="#" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                        Features
                    </a>
                    <a href="#" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                        For Students
                    </a>
                    <a href="#" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                        For Supervisors
                    </a>
                    <a href="#" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                        Pricing
                    </a>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="cursor-pointer">
                            Log in
                        </Button>
                    </Link>

                    <Link href="/signup">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 cursor-pointer">
                            Get Started Free
                        </Button>
                    </Link>
                </div>

            </div>
        </header>
    )
}
