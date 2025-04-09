"use client";

import React from "react";
import { motion } from "framer-motion";

interface TextProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
}

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// H1 - Main headline with strong impact
export function H1({ children, className = "", animate = true, delay = 0 }: TextProps) {
  return animate ? (
    <motion.h1 
      className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight ${className}`}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={{ delay }}
      style={{ 
        textShadow: "0 2px 10px rgba(16, 185, 129, 0.2)",
        fontFamily: "'Poppins', 'Inter', sans-serif"
      }}
    >
      {children}
    </motion.h1>
  ) : (
    <h1 
      className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight ${className}`}
      style={{ 
        textShadow: "0 2px 10px rgba(16, 185, 129, 0.2)",
        fontFamily: "'Poppins', 'Inter', sans-serif"
      }}
    >
      {children}
    </h1>
  );
}

// H2 - Section headings
export function H2({ children, className = "", animate = true, delay = 0 }: TextProps) {
  return animate ? (
    <motion.h2 
      className={`text-2xl md:text-3xl font-bold tracking-wide leading-snug ${className}`}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={{ delay }}
      style={{ 
        fontFamily: "'Inter', 'Poppins', sans-serif",
        letterSpacing: "0.02em"
      }}
    >
      {children}
    </motion.h2>
  ) : (
    <h2 
      className={`text-2xl md:text-3xl font-bold tracking-wide leading-snug ${className}`}
      style={{ 
        fontFamily: "'Inter', 'Poppins', sans-serif",
        letterSpacing: "0.02em"
      }}
    >
      {children}
    </h2>
  );
}

// H3 - Subsection headings
export function H3({ children, className = "", animate = true, delay = 0 }: TextProps) {
  return animate ? (
    <motion.h3 
      className={`text-xl md:text-2xl font-semibold tracking-wide ${className}`}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={{ delay }}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {children}
    </motion.h3>
  ) : (
    <h3 
      className={`text-xl md:text-2xl font-semibold tracking-wide ${className}`} 
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {children}
    </h3>
  );
}

// Paragraph - Body text
export function P({ children, className = "", animate = true, delay = 0 }: TextProps) {
  return animate ? (
    <motion.p 
      className={`text-base leading-relaxed text-gray-300 ${className}`}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={{ delay }}
      style={{ 
        fontFamily: "'Inter', 'Roboto', sans-serif",
        fontWeight: 400,
        letterSpacing: "0.01em"
      }}
    >
      {children}
    </motion.p>
  ) : (
    <p 
      className={`text-base leading-relaxed text-gray-300 ${className}`}
      style={{ 
        fontFamily: "'Inter', 'Roboto', sans-serif",
        fontWeight: 400,
        letterSpacing: "0.01em"
      }}
    >
      {children}
    </p>
  );
}

// Lead paragraph - Larger intro text
export function Lead({ children, className = "", animate = true, delay = 0 }: TextProps) {
  return animate ? (
    <motion.p 
      className={`text-lg md:text-xl leading-relaxed text-gray-200 ${className}`}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={{ delay }}
      style={{ 
        fontFamily: "'Inter', sans-serif",
        fontWeight: 300,
        letterSpacing: "0.015em"
      }}
    >
      {children}
    </motion.p>
  ) : (
    <p 
      className={`text-lg md:text-xl leading-relaxed text-gray-200 ${className}`}
      style={{ 
        fontFamily: "'Inter', sans-serif",
        fontWeight: 300,
        letterSpacing: "0.015em"
      }}
    >
      {children}
    </p>
  );
}

// Gradient text - For emphasizing special words
export function GradientText({ children, className = "" }: TextProps) {
  return (
    <span 
      className={`font-bold ${className}`}
      style={{ 
        background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        textFillColor: "transparent"
      }}
    >
      {children}
    </span>
  );
}

// Small text - For captions and smaller information
export function Small({ children, className = "" }: TextProps) {
  return (
    <span 
      className={`text-sm text-gray-400 ${className}`}
      style={{ 
        fontFamily: "'Inter', sans-serif",
        fontWeight: 400
      }}
    >
      {children}
    </span>
  );
}

// Typing effect text
export function TypingText({ 
  text, 
  className = "", 
  typingSpeed = 40
}: { 
  text: string; 
  className?: string;
  typingSpeed?: number;
}) {
  const [displayText, setDisplayText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, typingSpeed]);
  
  return (
    <span 
      className={className} 
      style={{
        fontFamily: "'Inter', sans-serif",
        position: "relative" 
      }}
    >
      {displayText}
      {currentIndex < text.length && (
        <span 
          className="opacity-70 inline-block animate-pulse"
          style={{ marginLeft: "0.1em" }}
        >|</span>
      )}
    </span>
  );
}

// Interactive link with hover effect
export function TextLink({ 
  href = "#", 
  children, 
  className = "" 
}: { 
  href: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <a 
      href={href} 
      className={`relative inline-block text-emerald-400 hover:text-emerald-300 transition-colors duration-300 group ${className}`}
    >
      <span>{children}</span>
      <span 
        className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"
        style={{ opacity: 0.7 }}
      />
    </a>
  );
}

// Button text styling
export function ButtonText({ children, className = "" }: TextProps) {
  return (
    <span 
      className={`font-medium ${className}`}
      style={{ 
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "0.02em"
      }}
    >
      {children}
    </span>
  );
} 