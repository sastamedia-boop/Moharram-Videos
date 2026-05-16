import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, PlaySquare, PlusSquare, MessageCircle, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Layout() {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative bg-stone-950 border-x border-stone-900 shadow-2xl">
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>
      
      <nav className="bg-stone-950 border-t border-stone-800 pb-safe relative z-50">
        <div className="flex justify-around items-center h-16">
          <NavItem to="/" icon={<Home size={24} />} label="Home" />
          <NavItem to="/videos" icon={<PlaySquare size={24} />} label="Videos" />
          
          <NavLink 
            to="/upload"
            className="flex flex-col items-center justify-center -mt-6"
          >
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50 text-white">
              <PlusSquare size={24} />
            </div>
            <span className="text-[10px] text-emerald-600 mt-1 font-medium">Upload</span>
          </NavLink>
          
          <NavItem to="/chats" icon={<MessageCircle size={24} />} label="Chat" />
          <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => cn(
        "flex flex-col items-center justify-center w-16 gap-1 transition-colors",
        isActive ? "text-emerald-500" : "text-stone-500 hover:text-stone-300"
      )}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
}
