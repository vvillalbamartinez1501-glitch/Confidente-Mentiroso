'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';

export function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 1 }}
      className="relative w-full py-12 px-6 flex flex-col items-center justify-center gap-4 z-10"
    >
      {/* Decorative Line */}
      <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2" />
      
      <div className="flex flex-col items-center gap-2">
        <p className="text-[10px] sm:text-xs font-medium text-gray-500 tracking-widest uppercase">
          Desarrollado con <span className="text-rose-500 animate-pulse inline-block mx-0.5">♥</span> por
        </p>
        
        <a 
          href="https://github.com/vvillalbamartinez1501-glitch"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-full backdrop-blur-md transition-all duration-300"
        >
          <Github className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          <span className="text-xs font-black tracking-tight text-gray-400 group-hover:text-white transition-colors relative">
            vvillalbamartinez1501-glitch
            <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
          </span>
        </a>
      </div>
      
      <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.5em] mt-2">
        Est. 2026 &bull; Social Gaming Platform
      </p>
    </motion.footer>
  );
}
