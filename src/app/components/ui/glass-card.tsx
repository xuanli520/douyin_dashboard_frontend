import React from 'react';

export const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`
    relative overflow-hidden
    bg-[#0f172a]/40 backdrop-blur-xl 
    border border-white/[0.08] 
    rounded-[24px] 
    shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]
    group
    ${className}
  `}>
    {/* Top Highlight */}
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-50" />
    {children}
  </div>
);
