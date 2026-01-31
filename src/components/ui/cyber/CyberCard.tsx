import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CyberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glow' | 'danger';
}

export function CyberCard({ children, className, variant = 'default', ...props }: CyberCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl backdrop-blur-md transition-all duration-300",
        // Light Mode Defaults
        "bg-white/70 border border-slate-200 shadow-sm",
        // Dark Mode Defaults (The Abyss)
        "dark:bg-slate-900/40 dark:border-white/5 dark:shadow-xl",
        
        variant === 'glow' && "dark:border-cyan-500/30 dark:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
        variant === 'danger' && "dark:border-red-500/30 dark:shadow-[0_0_20px_rgba(239,68,68,0.15)] border-red-200 bg-red-50/50",
        
        className
      )}
      {...props}
    >
      {/* Decorative Corner Accents (Cyberpunk feel) - Visible mostly in Dark Mode */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-slate-300 dark:border-white/10 rounded-tl-xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-slate-300 dark:border-white/10 rounded-br-xl opacity-50 pointer-events-none" />
      
      {children}
    </div>
  );
}
