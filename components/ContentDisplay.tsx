'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GameSecret } from '../lib/types';
import { Loader2 } from 'lucide-react';

interface ContentDisplayProps {
  secret: GameSecret | null;
  isLoading?: boolean;
}

export function ContentDisplay({ secret, isLoading = false }: ContentDisplayProps) {
  if (isLoading || !secret) {
    return (
      <div className="w-full aspect-[4/3] flex flex-col items-center justify-center bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-600 animate-pulse">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Buscando secreto...</p>
      </div>
    );
  }

  if (secret.type === 'text') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full aspect-[4/3] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-black rounded-full blur-3xl" />
        </div>
        
        <p className="text-white/60 text-sm font-bold tracking-[0.2em] uppercase mb-4 relative z-10">
          {secret.category}
        </p>
        
        <h3 className="text-white text-5xl md:text-6xl font-black text-center leading-tight drop-shadow-2xl relative z-10">
          {secret.content}
        </h3>
        
        <div className="mt-8 px-4 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 relative z-10">
          <p className="text-white/90 text-xs font-semibold">TARJETA DE PALABRA</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative bg-black shadow-2xl group"
    >
      <img 
        src={secret.content.url} 
        alt={secret.content.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
        <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-1">
          {secret.content.category}
        </p>
        <h3 className="text-white text-2xl font-bold truncate">
          {secret.content.title}
        </h3>
      </div>
    </motion.div>
  );
}
