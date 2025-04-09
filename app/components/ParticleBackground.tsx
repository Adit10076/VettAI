"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
}

export function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        delay: Math.random() * 5
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-emerald-500"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
          }}
          animate={{
            x: [0, Math.random() * 30 - 15, 0],
            y: [0, Math.random() * 30 - 15, 0],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
          }}
          transition={{
            duration: 8 + Math.random() * 10,
            ease: "easeInOut",
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
      {/* Overlay gradient using absolute positioning and opacity instead of radial gradient */}
      <div className="absolute inset-0 bg-gray-900 opacity-0" />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle, rgba(17, 24, 39, 0) 0%, rgba(17, 24, 39, 0.9) 100%)'
      }} />
    </div>
  );
} 