import { Button } from "@/components/ui/button"
import { Play, Upload, Star, Users, MessageSquare } from "lucide-react"

export function HeroSection() {
    return (
        <section className="relative overflow-hidden py-20 lg:py-32">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-medical-blue/10 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-medical-green/5 blur-3xl" />
            </div>



            <div className="container mx-auto">
                <div className="mx-auto max-w-4xl text-center">
                    {/* Announcement Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm">
                        <span className="font-medium">New:</span>
                        <span className="text-muted-foreground">AI-powered feedback analysis</span>
                        <span className="text-primary font-medium cursor-pointer hover:underline">Learn more</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                        Transform Medical Education with <span className="text-primary">Video-Based Learning</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground text-pretty leading-relaxed">
                        Empower medical students with personalized feedback. Upload practice videos, receive expert evaluations, and
                        accelerate your clinical skills development with structured mentorship.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                            Start Learning Today
                        </Button>
                        <Button size="lg" variant="outline" className="flex items-center gap-2 bg-transparent">
                            <Play className="h-4 w-4" />
                            Watch Demo
                        </Button>
                    </div>

                    {/* Trust Indicators */}
                    <p className="text-sm text-muted-foreground mb-8">
                        Trusted by over 5,000 medical students and 200+ supervisors worldwide
                    </p>

                    {/* University Logos */}
                    <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
                        <div className="text-lg font-semibold text-muted-foreground">Harvard Medical</div>
                        <div className="text-lg font-semibold text-muted-foreground">Johns Hopkins</div>
                        <div className="text-lg font-semibold text-muted-foreground">Mayo Clinic</div>
                        <div className="text-lg font-semibold text-muted-foreground">Stanford Medicine</div>
                        <div className="text-lg font-semibold text-muted-foreground">UCSF</div>
                    </div>
                </div>
            </div>
        </section>
    )
}
