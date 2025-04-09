"use client";

import React from "react";
import Logo from "./components/Logo";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left section with branding */}
      <div className="hidden md:flex md:w-1/2 bg-gray-900 animated-bg flex-col items-center justify-center p-12 relative">
        <div className="absolute top-8 left-8 z-10">
          <Logo />
        </div>
        
        <div className="max-w-md text-center mt-16">
          <h1 className="text-4xl font-bold text-white mb-6">Validate your startup ideas with AI</h1>
          <p className="text-gray-300 text-lg mb-8">
            Use powerful AI tools to test your startup concepts, get market insights, and optimize your business model before investing time and resources.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-md hover:shadow-emerald-900/20 hover:translate-y-[-2px] transition duration-300">
              <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center mb-3 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-emerald-400">
                  <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75c-1.036 0-1.875-.84-1.875-1.875v-11.25zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75C3.84 21.75 3 20.91 3 19.875v-6.75z" />
                </svg>
              </div>
              <h3 className="text-emerald-400 font-medium mb-1">Market Analysis</h3>
              <p className="text-gray-400 text-sm">Get detailed market insights for your business concept</p>
            </div>
            
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-md hover:shadow-emerald-900/20 hover:translate-y-[-2px] transition duration-300">
              <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center mb-3 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-emerald-400">
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
              </div>
              <h3 className="text-emerald-400 font-medium mb-1">Target Audience</h3>
              <p className="text-gray-400 text-sm">Identify and validate your ideal customer profile</p>
            </div>
            
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-md hover:shadow-emerald-900/20 hover:translate-y-[-2px] transition duration-300">
              <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center mb-3 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-emerald-400">
                  <path d="M16.5 7.5h-9v9h9v-9z" />
                  <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-emerald-400 font-medium mb-1">Competitive Analysis</h3>
              <p className="text-gray-400 text-sm">Evaluate your competition and find your edge</p>
            </div>
            
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-md hover:shadow-emerald-900/20 hover:translate-y-[-2px] transition duration-300">
              <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center mb-3 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-emerald-400">
                  <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-emerald-400 font-medium mb-1">Financial Modeling</h3>
              <p className="text-gray-400 text-sm">Project costs, revenue and profitability</p>
            </div>
          </div>
          
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg inline-block shadow-md">
            <p className="text-gray-300 font-medium">
              "VettAI helped us validate our SaaS idea in days instead of months."
            </p>
            <div className="mt-3 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mr-2">
                <span className="text-white font-medium">JD</span>
              </div>
              <div className="text-left">
                <p className="text-sm text-white">Jane Doe</p>
                <p className="text-xs text-gray-400">Founder, TechStartup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right section with auth form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 bg-gray-900">
        <div className="md:hidden mb-10">
          <Logo />
        </div>
        
        <div className="auth-card w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
          {children}
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-xs md:hidden">
          <p>© {new Date().getFullYear()} VettAI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
} 