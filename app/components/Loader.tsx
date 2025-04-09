import React from 'react';

type LoaderSize = 'sm' | 'md' | 'lg';
type LoaderColor = 'emerald' | 'white' | 'gray';

interface LoaderProps {
  size?: LoaderSize;
  color?: LoaderColor;
  text?: string;
  fullPage?: boolean;
}

const sizeMap = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

const colorMap = {
  emerald: 'border-t-emerald-500',
  white: 'border-t-white',
  gray: 'border-t-gray-300',
};

const bgColorMap = {
  emerald: 'border-emerald-300/30',
  white: 'border-white/30',
  gray: 'border-gray-600/30',
};

export default function Loader({ 
  size = 'md', 
  color = 'emerald',
  text,
  fullPage = false 
}: LoaderProps) {
  
  const spinnerClasses = `
    ${sizeMap[size]} 
    ${colorMap[color]} 
    ${bgColorMap[color]} 
    animate-spin rounded-full border 
  `;
  
  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClasses}></div>
      {text && (
        <p className={`mt-3 text-${color === 'emerald' ? 'emerald-500' : color}`}>
          {text}
        </p>
      )}
    </div>
  );
  
  if (fullPage) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        {content}
      </div>
    );
  }
  
  return content;
} 