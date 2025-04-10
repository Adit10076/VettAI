"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

// Desktop navigation link
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href} 
      className="text-gray-300 hover:text-white px-3 py-2 text-sm relative overflow-hidden group"
    >
      <span className="relative z-10">{label}</span>
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
}

// Mobile navigation link
function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link 
      href={href} 
      className="w-full text-center text-gray-300 hover:text-white px-4 py-3 text-lg relative group"
      onClick={onClick}
    >
      <span>{label}</span>
      <span className="block mx-auto mt-1 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-12"></span>
    </Link>
  );
}

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <>
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-3 bg-gray-900/80 backdrop-blur-lg shadow-md' : 'py-6 bg-transparent'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center group">
            <Logo size="md" animated />
            <motion.span 
              className="ml-2 text-lg font-semibold text-white hidden sm:block"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Idea<span className="text-emerald-400">Validator</span>
            </motion.span>
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-1">
            <NavLink href="#features" label="Features" />
            <NavLink href="#how-it-works" label="How It Works" />
            <NavLink href="#testimonials" label="Testimonials" />
            <div className="w-px h-8 bg-gray-700/50 mx-2 self-center"></div>
            <Link 
              href="/login" 
              className="text-gray-300 hover:text-white px-3 py-2 text-sm relative group"
            >
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
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              className="text-gray-300 hover:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-lg pt-20"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center gap-4 p-6">
              <MobileNavLink href="#features" label="Features" onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink href="#how-it-works" label="How It Works" onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink href="#testimonials" label="Testimonials" onClick={() => setMobileMenuOpen(false)} />
              <div className="w-24 h-px bg-gray-700/50 my-4"></div>
              <Link 
                href="/login" 
                className="w-full text-center text-gray-300 hover:text-white px-4 py-3 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-lg text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 