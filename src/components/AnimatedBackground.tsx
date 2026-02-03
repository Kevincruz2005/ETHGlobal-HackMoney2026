"use client";

import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export default function AnimatedBackground({ className, children }: AnimatedBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-gradient-shift opacity-20" />
      
      {/* Floating orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#4DA2FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#6BB6FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-[#3A8BEE] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: "4s" }} />
      </div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234DA2FF' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
