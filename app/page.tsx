import Hero from "@/components/landing-page/Hero";
import Features from "@/components/landing-page/Features";
import Pricing from "@/components/landing-page/Pricing";
import CTA from "@/components/landing-page/CTA";
//import { testWorkflow } from "@/ai/data_reporter";

export default function Home() {
  {
    /*testWorkflow().then(() => console.log("Test completed")); */
  }

  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Pricing />
      <CTA />
    </div>
  );
}
