import Hero from "@/components/landing-page/Hero";
import Features from "@/components/landing-page/Features";
import CTA from "@/components/landing-page/CTA";
import { HeroHeader } from "@/components/landing-page/Header";
import ContentSection from "@/components/landing-page/Content";

import FooterSection from "@/components/landing-page/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroHeader />
      <Hero />
      <Features />
      <ContentSection />
      <CTA />
      <FooterSection />
    </div>
  );
}
