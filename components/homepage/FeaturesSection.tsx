import { Upload, Star, MessageSquare, BarChart3, Shield, Clock } from "lucide-react"

const features = [
    {
        icon: Upload,
        title: "Easy Video Upload",
        description:
            "Students can quickly upload practice videos of clinical procedures, patient interactions, and skill demonstrations.",
        color: "text-primary",
    },
    {
        icon: Star,
        title: "Expert Scoring",
        description: "Supervisors provide structured evaluations using standardized rubrics and competency frameworks.",
        color: "text-medical-green",
    },
    {
        icon: MessageSquare,
        title: "Detailed Feedback",
        description: "Receive comprehensive notes and suggestions for improvement from experienced medical professionals.",
        color: "text-medical-blue",
    },
    {
        icon: BarChart3,
        title: "Progress Tracking",
        description: "Monitor skill development over time with detailed analytics and performance insights.",
        color: "text-primary",
    },
    {
        icon: Shield,
        title: "HIPAA Compliant",
        description: "Secure, encrypted platform ensuring patient privacy and regulatory compliance.",
        color: "text-medical-green",
    },
    {
        icon: Clock,
        title: "Real-time Reviews",
        description: "Get feedback within 24-48 hours to maintain learning momentum and rapid improvement.",
        color: "text-medical-blue",
    },
]

export function FeaturesSection() {
    return (
        <section className="py-20 lg:py-32 bg-muted/30">
            <div className="container mx-auto">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Everything you need for effective medical mentorship
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Streamline the feedback process with tools designed specifically for medical education
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="group relative">
                            <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm transition-all hover:shadow-md hover:border-border">
                                <div className="mb-4">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
