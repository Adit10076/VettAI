import { redirect } from "next/navigation";
import { auth } from "../auth";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ParticleBackground } from "./components/ParticleBackground";
import Logo from "./components/Logo";
import { 
  HeroSection, 
  HowItWorksSection, 
  FeaturesSection,
  TestimonialsSection,
  CTASection,
  Footer
} from "./components/LandingComponents";

export default async function Home() {
  const session = await auth();
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect("/dashboard");
  }
  
  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Logo size="md" animated />
          </Link>
          <div className="flex space-x-4">
            <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2 text-sm relative group">
              Login
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/signup" 
              className="relative overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            >
              <span className="relative z-10">Sign Up</span>
            </Link>
          </div>
        </nav>

        {/* Main Content Sections */}
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
