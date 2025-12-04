import { Navbar } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { DemoSection } from "@/components/landing/DemoSection"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"
import { PricingSection } from "@/components/landing/PricingSection"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <HeroSection />
      <div id="demo">
        <DemoSection />
      </div>
      <div id="features">
        <FeaturesGrid />
      </div>
      <div id="pricing">
        <PricingSection />
      </div>
      <div id="contact">
        <CTASection />
      </div>
      <Footer />
    </main>
  )
}
