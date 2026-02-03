"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export default function AnimatedButton({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md",
  className,
  disabled = false
}: AnimatedButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center font-bold rounded-lg transition-all duration-300 overflow-hidden group";
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base"
  };
  
  const variantClasses = {
    primary: "bg-[#4DA2FF] text-black hover:bg-[#3A8BEE] shadow-[0_0_20px_rgba(77,162,255,0.3)] hover:shadow-[0_0_30px_rgba(77,162,255,0.5)]",
    secondary: "bg-black text-white hover:bg-zinc-900 border border-zinc-800 hover:border-[#4DA2FF]/50",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4DA2FF]/20 to-[#6BB6FF]/20 animate-pulse" />
      </div>
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
