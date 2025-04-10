"use client";

import { motion } from "framer-motion";
import { Check, Lightbulb } from "lucide-react";

interface LogoProps {
  variant?: "default" | "icon-only" | "text-only";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export default function Logo({ 
  variant = "default", 
  size = "md", 
  animated = false,
  className = ""
}: LogoProps) {
  // Size mappings
  const sizes = {
    sm: {
      container: "h-8",
      icon: 18,
      text: "text-lg",
      gap: "gap-1",
    },
    md: {
      container: "h-9",
      icon: 22,
      text: "text-xl",
      gap: "gap-2",
    },
    lg: {
      container: "h-12",
      icon: 28,
      text: "text-2xl",
      gap: "gap-2.5",
    },
  };

  // Logo icon with brain + check
  const LogoIcon = () => (
    <div className="relative">
      {/* Brain circuit container */}
      <motion.div
        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-full"
        initial={animated ? { opacity: 0.8 } : {}}
        animate={animated ? { 
          opacity: [0.8, 1, 0.8], 
          scale: [1, 1.05, 1] 
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Lightbulb className="text-white" size={sizes[size].icon * 0.7} />
      </motion.div>
      
      {/* Checkmark */}
      <motion.div
        className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5 border-2 border-gray-900"
        initial={animated ? { scale: 0 } : {}}
        animate={animated ? { scale: 1 } : {}}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Check className="text-emerald-400" size={sizes[size].icon * 0.5} strokeWidth={4} />
      </motion.div>
    </div>
  );

  // Text part of the logo
  const LogoText = () => (
    <motion.div 
      className={`font-bold ${sizes[size].text}`}
      initial={animated ? { opacity: 0, x: -5 } : {}}
      animate={animated ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      <span className="text-white">Vett</span>
      <span className="text-emerald-400">AI</span>
    </motion.div>
  );

  switch (variant) {
    case "icon-only":
      return (
        <div className={`${sizes[size].container} aspect-square ${className}`}>
          <LogoIcon />
        </div>
      );
    case "text-only":
      return <LogoText />;
    default:
      return (
        <div className={`flex items-center ${sizes[size].gap} ${className}`}>
          <div className={`${sizes[size].container} aspect-square`}>
            <LogoIcon />
          </div>
          <LogoText />
        </div>
      );
  }
} 