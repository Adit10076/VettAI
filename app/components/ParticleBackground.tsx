"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  speed: number;
  color: string;
}

export function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate random particles with varied colors
    const colors = ['#10b981', '#0ea5e9', '#6366f1', '#8b5cf6'];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 70; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        delay: Math.random() * 5,
        speed: Math.random() * 15 + 5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setParticles(newParticles);

    // Mouse movement event listener
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width * 100,
          y: (e.clientY - rect.top) / rect.height * 100
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
    >
      {particles.map((particle) => {
        // Calculate distance to mouse for interactive effect
        const dx = Math.abs(particle.x - mousePosition.x) / 100;
        const dy = Math.abs(particle.y - mousePosition.y) / 100;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance * 2); // Stronger effect when closer

        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            animate={{
              x: [0, Math.random() * particle.speed - particle.speed/2 + (mousePosition.x > 0 ? influence * 15 : 0), 0],
              y: [0, Math.random() * particle.speed - particle.speed/2 + (mousePosition.y > 0 ? influence * 15 : 0), 0],
              opacity: [
                particle.opacity, 
                particle.opacity * (1.5 + influence), 
                particle.opacity
              ],
              scale: [1, 1 + influence * 0.5, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              ease: "easeInOut",
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        );
      })}
      {/* Overlay gradient using absolute positioning with more dynamic appearance */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(17, 24, 39, 0) 0%, rgba(17, 24, 39, 0.9) 100%)'
      }} />
      {/* Subtle glow effect in the center */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute rounded-full"
          style={{
            width: '40%',
            height: '40%',
            left: '30%',
            top: '30%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0) 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </div>
    </div>
  );
} 