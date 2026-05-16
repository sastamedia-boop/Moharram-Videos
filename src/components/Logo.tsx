import React from 'react';
import { cn } from './Layout';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <svg 
        width="48" 
        height="48" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
      >
        <path 
          d="M50 10 
             C65 30, 80 40, 80 65 
             C80 85, 65 95, 50 95 
             C35 95, 20 85, 20 65 
             C20 40, 35 30, 50 10 Z" 
          stroke="currentColor" 
          strokeWidth="4" 
          fill="rgba(16, 185, 129, 0.1)" 
        />
        <path d="M50 25 L50 95" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M35 75 Q50 65 65 75" stroke="currentColor" strokeWidth="3" fill="none" />
        <circle cx="50" cy="15" r="4" fill="currentColor" />
        <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M46 50 A 4 4 0 1 1 50 46" stroke="currentColor" strokeWidth="2" fill="currentColor" />
      </svg>
      <span className="mt-2 text-lg font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent tracking-widest uppercase">
        Moharram
      </span>
      <span className="text-[10px] text-stone-400 uppercase tracking-[0.2em]">Video</span>
    </div>
  );
}

export function LogoSmall({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg 
        width="28" 
        height="28" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]"
      >
        <path 
          d="M50 10 C65 30, 80 40, 80 65 C80 85, 65 95, 50 95 C35 95, 20 85, 20 65 C20 40, 35 30, 50 10 Z" 
          stroke="currentColor" 
          strokeWidth="6" 
          fill="rgba(16, 185, 129, 0.2)" 
        />
        <circle cx="50" cy="15" r="5" fill="currentColor" />
      </svg>
      <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent transform translate-y-px">
        Moharram
      </span>
    </div>
  );
}
