import React from 'react';
import { motion } from 'framer-motion';
import { GameSecret } from '../lib/types';
import { ContentDisplay } from './ContentDisplay';

interface GameCardProps {
  secret: GameSecret | null;
  isHidden?: boolean;
}

export function GameCard({ secret, isHidden = false }: GameCardProps) {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, rotateY: 90 }}
      animate={{ scale: 1, opacity: 1, rotateY: isHidden ? 180 : 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="relative w-full aspect-square sm:aspect-[4/3] max-w-md mx-auto perspective-1000"
    >
      <div className={`w-full h-full rounded-2xl overflow-hidden glass-panel shadow-[0_0_25px_rgba(0,0,0,0.3)] transition-all duration-500 ${isHidden ? 'bg-gray-800' : ''}`}>
        {!isHidden ? (
          <ContentDisplay secret={secret} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1d2d] border-4 border-white/5 p-6">
            <div className="text-5xl sm:text-6xl mb-4 drop-shadow-2xl">❓</div>
            <p className="text-gray-400 font-bold tracking-widest text-xs sm:text-sm uppercase text-center">Identidad Oculta</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
