import React from "react";
import { FcGoogle } from "react-icons/fc";

interface GoogleButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function GoogleButton({ text, onClick, disabled = false }: GoogleButtonProps) {
  return (
    <button 
      className={`auth-button bg-gray-700 hover:bg-gray-600 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`} 
      onClick={onClick}
      type="button"
      disabled={disabled}
    >
      <FcGoogle className="text-xl" />
      <span>{text}</span>
    </button>
  );
} 