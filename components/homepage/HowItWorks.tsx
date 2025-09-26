import { ArrowRight, Upload, Eye, MessageSquare } from "lucide-react"

const steps = [
    {
        step: "01",
        icon: Upload,
        title: "Upload Your Video",
        description:
            "Students record and upload practice sessions, clinical procedures, or patient interactions securely to the platform.",
        color: "text-primary",
    },
    {
        step: "02",
        icon: Eye,
        title: "Supervisor Review",
        description:
            "Experienced medical professionals review submissions using standardized evaluation criteria and competency frameworks.",
        color: "text-medical-blue",
    },
    {
        step: "03",
        icon: MessageSquare,
        title: "Receive Feedback",
        description:
            "Get detailed scores, constructive notes, and actionable recommendations to improve your clinical skills and knowledge.",
        color: "text-medical-green",
    },
]

export function HowItWorks() {
    return (
        <section className="py-20 lg:py-32">
            <div className="container mx-auto">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Simple process, powerful results</h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Get started with video-based learning in three easy steps
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            <div className="text-center">
                                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                                    <step.icon className={`h-8 w-8 ${step.color}`} />
                                </div>
                                <div className="mb-4">
                                    <span className="text-sm font-mono text-muted-foreground">{step.step}</span>
                                    <h3 className="text-xl font-semibold mt-2">{step.title}</h3>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-full w-12 h-px bg-border">
                                    <ArrowRight className="absolute -top-2 -right-2 h-4 w-4 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
