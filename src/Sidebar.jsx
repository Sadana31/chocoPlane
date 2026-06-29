import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Radar, 
  Home, 
  Crosshair, 
  Clock, 
  Activity,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  setIsOpen
}) {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Home Dashboard', icon: Home },
    { path: '/inspection', label: 'AI Inspection', icon: Crosshair },
    { path: '/history', label: 'Defect History', icon: Clock },
    { path: '/fleet', label: 'Fleet Status', icon: Activity },
  ];

  return (
    <>
      <button
  onClick={() => setIsOpen(!isOpen)}
  className="
    fixed
    top-4
    left-4
    z-[9999]
    p-3
    text-white
    rounded-lg
    shadow-lg
    hover:bg-cyan-400
    transition-all
  "
>
  {isOpen ? <X size={24} /> : <Menu size={24} />}
</button>


      {/* MOBILE OVERLAY (Closes menu when clicking background) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed top-0 left-0 h-screen w-[85vw] max-w-72 bg-[#080b14] border-r border-slate-800 flex flex-col z-[95] 
          transition-transform duration-300 ease-in-out ${
  isOpen
    ? 'translate-x-0'
    : '-translate-x-full'
}`}
      >
        {/* LOGO */}
        <div className="p-8 pb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Radar className="w-8 h-8 text-cyan-400 animate-[spin_4s_linear_infinite]" />
            <span className="text-2xl font-bold tracking-wider text-white">Aero<span className="text-cyan-400">Twin</span></span>
          </Link>
        </div>

        {/* NAV LINKS */}
        <div className="flex-1 py-6 px-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)} // Close on select
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-cyan-950/40 border border-cyan-800/50 text-white' 
                      : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="font-semibold tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

      </aside>
    </>
  );
}