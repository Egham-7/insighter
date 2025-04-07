import Hero from "@/components/landing-page/Hero";
import Features from "@/components/landing-page/Features";
import Pricing from "@/components/landing-page/Pricing";
import CTA from "@/components/landing-page/CTA";
import { HeroHeader } from "@/components/landing-page/Header";
import ContentSection from "@/components/landing-page/Content";
import TestimonialsSection from "@/components/landing-page/Testimonials";
import StatsSection from "@/components/landing-page/Stats";
import FooterSection from "@/components/landing-page/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroHeader />
      <Hero />
      <Features />
      <ContentSection />
      <StatsSection />
      <TestimonialsSection />
      <Pricing />
      <CTA />
      <FooterSection />
    </div>
  );
}
