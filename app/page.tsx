import {Header} from "@/components/homepage/Header";
import {HeroSection} from "@/components/homepage/HeroSection";
import {FeaturesSection} from "@/components/homepage/FeaturesSection";
import {HowItWorks} from "@/components/homepage/HowItWorks";
import {CTASection} from "@/components/homepage/CtaSection";


export default function HomePage() {
  return (
      <div className="min-h-screen mx-auto">
        <Header />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorks />
          <CTASection />
        </main>
      </div>
  )
}
