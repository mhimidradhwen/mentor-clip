import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function CTASection() {
    return (
        <section className="py-20 lg:py-32 bg-primary/5">
            <div className="container mx-auto">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6 text-balance">
                        Ready to accelerate your medical education?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
                        Join thousands of medical students who are improving their clinical skills with personalized video feedback
                        from expert supervisors.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                            Start Free Trial
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="flex items-center gap-2 bg-transparent">
                            <Play className="h-4 w-4" />
                            Schedule Demo
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mt-6">
                        No credit card required • 14-day free trial • Cancel anytime
                    </p>
                </div>
            </div>
        </section>
    )
}
