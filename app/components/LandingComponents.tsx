"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useAnimation, useInView } from "framer-motion";
import { 
  ArrowRight, 
  BarChart4, 
  Target, 
  FileText, 
  ChevronRight,
  Github,
  Twitter,
  Mail
} from "lucide-react";
import { 
  H1, H2, H3, P, Lead, GradientText, TypingText, ButtonText
} from "./Typography";

// Shared animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.2
    }
  }
};

function useAnimateOnInView() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);
  
  return { ref, controls };
}

// Glowing CTA Button
function GlowingButton({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="relative group inline-block"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
      <div className="relative flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-5 rounded-lg font-medium text-base transition duration-300">
        {children}
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="ml-2"
        >
          <ArrowRight size={16} />
        </motion.div>
      </div>
    </Link>
  );
}

// Animated counter for score meters
function AnimatedCounter({ value, color }: { value: number, color: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    if (isActive) {
      let start = 0;
      const end = value;
      const duration = 1500;
      
      // Reset counter to 0
      setDisplayValue(0);
      
      // Start animation after a slight delay
      const timer = setTimeout(() => {
        // Set animation start time
        let startTime: number | null = null;
        
        // Easing function for smooth counting animation
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        
        // Animation function using requestAnimationFrame
        const animate = (time: number) => {
          if (!startTime) startTime = time;
          const elapsedTime = time - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          const easedProgress = easeOutCubic(progress);
          const currentValue = Math.floor(easedProgress * (end - start) + start);
          
          setDisplayValue(currentValue);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
      }, 300); // Slight delay before starting animation
      
      return () => clearTimeout(timer);
    }
  }, [value, isActive]);

  // Activate counter when parent signals it's ready
  useEffect(() => {
    setIsActive(true);
  }, []);
  
  return (
    <div className="text-center">
      <span className="text-2xl font-bold" style={{ color }}>
        {displayValue}%
      </span>
    </div>
  );
}

// Score Meter Animation
function ScoreMeter({ value = 75, label = "Overall Score", color = "#10b981", delay = 0 }: { 
  value?: number, 
  label?: string,
  color?: string,
  delay?: number
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const controls = useAnimation();
  const [isAnimated, setIsAnimated] = useState(false);
  
  // Calculate stroke-dashoffset for the circle
  const circumference = 2 * Math.PI * 40; // 2πr where r = 40
  
  useEffect(() => {
    // Only start animation when component is in view
    if (isInView) {
      // Apply delay before starting animation
      const timer = setTimeout(() => {
        controls.start("visible").then(() => {
          setIsAnimated(true);
        });
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isInView, controls, delay]);
  
  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInUp}
      className="w-28 h-28 relative mx-auto mb-2"
    >
      <svg className="w-full h-full -rotate-90">
        <circle 
          cx="50%" 
          cy="50%" 
          r="40" 
          fill="none" 
          stroke="#374151" 
          strokeWidth="8"
        />
        <motion.circle 
          cx="50%" 
          cy="50%" 
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isAnimated ? { 
            strokeDashoffset: circumference - (circumference * value / 100) 
          } : {}}
          transition={{ duration: 1.5, ease: "easeOutCubic" }}
        />
      </svg>
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={isAnimated ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
      >
        {isAnimated && <AnimatedCounter value={value} color={color} />}
      </motion.div>
      <div className="text-center text-sm text-gray-300 mt-2">{label}</div>
    </motion.div>
  );
}

// Feature Card with hover effects
function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) {
  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden"
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.2)"
      }}
    >
      {/* Highlight glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 opacity-0 group-hover:opacity-20 rounded-xl blur-sm transition-all duration-500 group-hover:from-emerald-500/10 group-hover:to-emerald-500/30"></div>
      
      <div className="relative z-10">
        <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center mb-5 group-hover:bg-emerald-800/40 transition-colors duration-300 group-hover:scale-110 transform">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3 group-hover:text-emerald-400 transition-colors duration-300">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
      
      {/* Arrow indicator on hover */}
      <motion.div 
        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ x: -10, opacity: 0 }}
        whileHover={{ x: 0, opacity: 1 }}
      >
        <ArrowRight className="text-emerald-400" size={16} />
      </motion.div>
    </motion.div>
  );
}

// Testimonial Card
function TestimonialCard({ 
  quote, 
  author, 
  role 
}: { 
  quote: string, 
  author: string, 
  role: string 
}) {
  return (
    <motion.div 
      className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 relative group"
      whileHover={{ 
        y: -5,
        boxShadow: "0 15px 30px -15px rgba(16, 185, 129, 0.15)",
        borderColor: "rgba(16, 185, 129, 0.3)"
      }}
    >
      {/* Quote mark */}
      <div className="absolute -top-4 -left-2 text-emerald-500 text-5xl opacity-20 transform rotate-12">"</div>
      <div className="absolute -bottom-4 -right-2 text-emerald-500 text-5xl opacity-20 transform -rotate-12">"</div>
      
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 opacity-0 group-hover:opacity-10 rounded-xl blur-md transition-all duration-700"></div>
      
      <div className="px-2 relative z-10">
        <p className="text-gray-300 mb-6 leading-relaxed">
          {quote}
        </p>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-emerald-800/50 rounded-full mr-3 flex items-center justify-center text-emerald-400 font-semibold ring-2 ring-emerald-600/30">
            {author.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{author}</p>
            <p className="text-sm text-gray-400">{role}</p>
          </div>
        </div>
      </div>
      
      {/* Subtle shine effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent skew-x-12 -translate-x-full overflow-hidden"
        animate={{ translateX: ["100%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 2, repeatDelay: 5 }}
        style={{ width: "200%" }}
      />
    </motion.div>
  );
}

// Hero Section with animations
export function HeroSection() {
  const { ref, controls } = useAnimateOnInView();
  
  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerChildren}
      className="relative py-20 sm:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div variants={fadeInUp}>
          <H1 animate={false}>
            Validate Your Startup Idea <GradientText>Instantly</GradientText> with AI
          </H1>
        </motion.div>
        
        <motion.div 
          className="max-w-2xl mx-auto mt-6"
          variants={fadeInUp}
        >
          <Lead animate={false}>
            <TypingText 
              text="Backed by open-source models like Mistral & LLaMA" 
              typingSpeed={35}
            />
          </Lead>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <P animate={false} className="max-w-2xl mx-auto mt-4 mb-10">
            Free, private, and secure evaluation of your business ideas
          </P>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="flex justify-center">
          <GlowingButton href="/login">
            <ButtonText>Validate My Idea</ButtonText>
          </GlowingButton>
        </motion.div>
        
        <motion.div 
          className="mt-16 flex flex-wrap justify-center gap-4 md:gap-12"
          variants={fadeInUp}
        >
          <ScoreMeter value={78} label="Overall Score" color="#10b981" delay={0} />
          <ScoreMeter value={82} label="Market Potential" color="#3b82f6" delay={300} />
          <ScoreMeter value={74} label="Technical Feasibility" color="#f59e0b" delay={600} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// How It Works Section
export function HowItWorksSection() {
  const { ref, controls } = useAnimateOnInView();
  
  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerChildren}
      className="py-20 bg-gray-800/50 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <H2>How It Works</H2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <motion.div 
            className="relative"
            variants={fadeInUp}
          >
            <div className="flex flex-col items-center">
              <motion.div 
                className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mb-6 relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-emerald-500 opacity-0"
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="text-emerald-400 font-bold text-xl relative z-10">1</span>
              </motion.div>
              <H3 className="mb-4">Submit Idea</H3>
              <P className="text-center">
                Enter your startup idea, business model, and target market details.
              </P>
            </div>
            {/* Arrow for desktop */}
            <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-1/3 h-2">
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ArrowRight className="text-emerald-400 absolute right-0" size={30} />
              </motion.div>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            className="relative"
            variants={fadeInUp}
          >
            <div className="flex flex-col items-center">
              <motion.div 
                className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mb-6 relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-emerald-500 opacity-0"
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="text-emerald-400 font-bold text-xl relative z-10">2</span>
              </motion.div>
              <H3 className="mb-4">AI Evaluates</H3>
              <P className="text-center">
                Our AI analyzes your idea using advanced models and market data.
              </P>
            </div>
            {/* Arrow for desktop */}
            <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-1/3 h-2">
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              >
                <ArrowRight className="text-emerald-400 absolute right-0" size={30} />
              </motion.div>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div variants={fadeInUp}>
            <div className="flex flex-col items-center">
              <motion.div 
                className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mb-6 relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-emerald-500 opacity-0"
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="text-emerald-400 font-bold text-xl relative z-10">3</span>
              </motion.div>
              <H3 className="mb-4">Get Insights</H3>
              <P className="text-center">
                Receive detailed evaluation, recommendations, and actionable next steps.
              </P>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Features Section
export function FeaturesSection() {
  const { ref, controls } = useAnimateOnInView();
  
  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerChildren}
      className="py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          variants={fadeInUp}
        >
          <H2>Feature Highlights</H2>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerChildren}
        >
          <motion.div variants={fadeInUp}>
            <FeatureCard
              icon={<span className="text-emerald-400 font-bold">S</span>}
              title="SWOT Analysis"
              description="Identify strengths, weaknesses, opportunities, and threats for your startup idea."
            />
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <FeatureCard
              icon={<span className="text-emerald-400 font-bold">MVP</span>}
              title="MVP Suggestions"
              description="Get recommendations for minimum viable product features to test your idea quickly."
            />
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <FeatureCard
              icon={<Target size={24} className="text-emerald-400" />}
              title="Market Fit"
              description="Analyze potential market fit and discover ideal customer segments for your idea."
            />
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <FeatureCard
              icon={<BarChart4 size={24} className="text-emerald-400" />}
              title="Idea Scoring"
              description="Get a quantitative assessment with scores for market potential and technical feasibility."
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Testimonials Section
export function TestimonialsSection() {
  const { ref, controls } = useAnimateOnInView();
  
  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerChildren}
      className="py-20 bg-gray-800/50 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          variants={fadeInUp}
        >
          <H2>What Founders Say</H2>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerChildren}
        >
          <motion.div variants={fadeInUp}>
            <TestimonialCard
              quote="VettAI helped me validate my SaaS idea in minutes instead of weeks. The insights were spot on!"
              author="Sarah K."
              role="Founder, TechStart"
            />
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <TestimonialCard
              quote="The SWOT analysis identified critical weaknesses I hadn't considered. Saved me from making costly mistakes."
              author="Michael R."
              role="CEO, HealthTech"
            />
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <TestimonialCard
              quote="The MVP suggestions were incredibly practical. Helped us launch faster and with less capital."
              author="Jessica T."
              role="Founder, EcoShop"
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// CTA Section
export function CTASection() {
  const { ref, controls } = useAnimateOnInView();
  
  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInUp}
      className="py-16 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-emerald-900/10 backdrop-blur-sm z-0"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div variants={fadeInUp} className="mb-6">
          <H2>Ready to validate your startup idea?</H2>
        </motion.div>
        <motion.div variants={fadeInUp} className="mb-8">
          <P>
            Join thousands of founders who've used VettAI to refine their ideas before investing time and money.
          </P>
        </motion.div>
        <motion.div variants={fadeInUp} className="flex justify-center">
          <GlowingButton href="/login">
            <ButtonText>Get Started Free</ButtonText>
          </GlowingButton>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Footer
export function Footer() {
  return (
    <footer className="bg-gray-800/80 backdrop-blur-md pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              About
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white flex items-center group">
                  <ChevronRight size={14} className="opacity-0 -ml-4 mr-0 group-hover:opacity-100 group-hover:mr-1 group-hover:-ml-0 transition-all duration-200" />
                  Company
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white flex items-center group">
                  <ChevronRight size={14} className="opacity-0 -ml-4 mr-0 group-hover:opacity-100 group-hover:mr-1 group-hover:-ml-0 transition-all duration-200" />
                  Team
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white flex items-center group">
                  <ChevronRight size={14} className="opacity-0 -ml-4 mr-0 group-hover:opacity-100 group-hover:mr-1 group-hover:-ml-0 transition-all duration-200" />
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white flex items-center group">
                  <ChevronRight size={14} className="opacity-0 -ml-4 mr-0 group-hover:opacity-100 group-hover:mr-1 group-hover:-ml-0 transition-all duration-200" />
                  Terms
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white flex items-center group">
                  <Github size={14} className="mr-2 text-emerald-400" />
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white flex items-center group">
                  <FileText size={14} className="mr-2 text-emerald-400" />
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white flex items-center">
                  <Mail size={14} className="mr-2 text-emerald-400" />
                  Support
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white flex items-center">
                  <Twitter size={14} className="mr-2 text-emerald-400" />
                  Twitter
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-700">
          <p className="text-gray-400 text-sm text-center">
            &copy; {new Date().getFullYear()} VettAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 