"use client";

import { ParticleBackground } from "./ParticleBackground";
import { 
  HeroSection, 
  HowItWorksSection, 
  FeaturesSection,
  TestimonialsSection,
  CTASection,
  Footer
} from "./LandingComponents";
import { Navigation } from "./Navigation";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Client-side navigation */}
      <Navigation />
      
      {/* Content */}
      <div className="relative z-10 pt-20">
        {/* Sections with ID anchors for navigation */}
        <section id="hero">
          <HeroSection />
        </section>
        
        <section id="how-it-works">
          <HowItWorksSection />
        </section>
        
        <section id="features">
          <FeaturesSection />
        </section>
        
        <section id="testimonials">
          <TestimonialsSection />
        </section>
        
        <section id="cta">
          <CTASection />
        </section>
        
        <Footer />
      </div>
    </div>
  );
} 